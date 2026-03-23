import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeCodeChefDate(raw) {
  const match = String(raw || "").match(/(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const yearPart = Number(match[3]);
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;

  if (!day || !month || !year) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

async function fetchCodeChefAcceptedCalendar(handle) {
  const allAcceptedByDate = {};

  const firstPageResp = await axios.get(`https://www.codechef.com/recent/user?user_handle=${encodeURIComponent(handle)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Requested-With": "XMLHttpRequest"
      },
      timeout: 15000
    }
  );

  const maxPage = Math.max(1, toSafeNumber(firstPageResp.data?.max_page) || 1);
  const pagesToFetch = Math.min(maxPage, 20);
  const pagePayloads = [firstPageResp.data];

  for (let page = 2; page <= pagesToFetch; page++) {
    try {
      const resp = await axios.get(
        `https://www.codechef.com/recent/user?page=${page}&user_handle=${encodeURIComponent(handle)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest"
          },
          timeout: 15000
        }
      );
      pagePayloads.push(resp.data);
    } catch (error) {
      console.warn(`CodeChef recent submissions page ${page} failed:`, error.message);
      break;
    }
  }

  for (const payload of pagePayloads) {
    const content = payload?.content;
    if (!content || typeof content !== 'string') continue;

    const $ = cheerio.load(content);
    $('tr').each((_, row) => {
      const rowText = $(row).text().replace(/\s+/g, ' ').trim();
      if (!rowText) return;

      // CodeChef marks fully accepted rows with score (100)
      const isAccepted = /\(100\)/.test(rowText);
      if (!isAccepted) return;

      const date = normalizeCodeChefDate(rowText);
      if (!date) return;

      allAcceptedByDate[date] = (allAcceptedByDate[date] || 0) + 1;
    });
  }

  return allAcceptedByDate;
}

export default async function handler(req, res) {
  try {
    const { lc_username, cf_handle, cc_username, user_id } = req.query;
    
    const result = {
      leetcode: {},
      codeforces: {},
      codechef: {}
    };

    // Fetch LeetCode submission calendar
    if (lc_username) {
      try {
        const lcQuery = `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              userCalendar {
                submissionCalendar
              }
            }
          }
        `;

        const lcResponse = await axios.post('https://leetcode.com/graphql', {
          query: lcQuery,
          variables: { username: lc_username }
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (lcResponse.data?.data?.matchedUser?.userCalendar?.submissionCalendar) {
          // LeetCode returns a JSON string like: '{"1609459200": 1, "1609545600": 3}'
          // Keys are Unix timestamps, values are number of submissions
          const calendar = JSON.parse(lcResponse.data.data.matchedUser.userCalendar.submissionCalendar);
          
          // Convert Unix timestamps to dates
          Object.entries(calendar).forEach(([timestamp, count]) => {
            const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
            result.leetcode[date] = count;
          });
        }
      } catch (error) {
        console.error('LeetCode calendar fetch error:', error.message);
      }
    }

    // Fetch Codeforces submission history and create calendar
    if (cf_handle) {
      try {
        const cfResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${cf_handle}`);
        
        if (cfResponse.data.status === 'OK') {
          const submissions = cfResponse.data.result;
          const dailySubmissions = {};
          
          submissions.forEach(submission => {
            if (submission.verdict === 'OK') {
              // Convert Unix timestamp to date
              const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split('T')[0];
              dailySubmissions[date] = (dailySubmissions[date] || 0) + 1;
            }
          });
          
          result.codeforces = dailySubmissions;
        }
      } catch (error) {
        console.error('Codeforces calendar fetch error:', error.message);
      }
    }

    // Fetch CodeChef submission history from daily_stats
    if (cc_username && user_id) {
      try {
        // Prefer real accepted-submission history from CodeChef recent submissions endpoint.
        let dailySubmissions = await fetchCodeChefAcceptedCalendar(cc_username);

        // Fallback to daily_stats deltas only when scrape returns no usable rows.
        if (!dailySubmissions || Object.keys(dailySubmissions).length === 0) {
          const { data: dailyStats, error } = await supabase
            .from('daily_stats')
            .select('date, solved_count')
            .eq('user_id', user_id)
            .eq('platform', 'codechef')
            .order('date', { ascending: true });

          if (error) {
            console.error('CodeChef daily_stats fetch error:', error.message);
          } else if (dailyStats && dailyStats.length > 1) {
            dailySubmissions = {};

            // Real delta-based changes from snapshots; no synthetic monthly distribution.
            dailyStats.forEach((stat, index) => {
              if (index === 0) return;

              const prevStat = dailyStats[index - 1];
              const change = toSafeNumber(stat.solved_count) - toSafeNumber(prevStat.solved_count);

              if (change > 0) {
                dailySubmissions[stat.date] = change;
              }
            });
          }
        }

        result.codechef = dailySubmissions || {};
        console.log(`CodeChef calendar: ${Object.keys(result.codechef).length} active days`);
      } catch (error) {
        console.error('CodeChef calendar fetch error:', error.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Submission calendar API error:', err);
    res.status(500).json({ error: err.message });
  }
}
