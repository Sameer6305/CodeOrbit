import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
        // CodeChef doesn't have a public API for submission calendar
        // We'll derive it from daily_stats by calculating daily changes
        const { data: dailyStats, error } = await supabase
          .from('daily_stats')
          .select('date, solved_count')
          .eq('user_id', user_id)
          .eq('platform', 'codechef')
          .order('date', { ascending: true });

        if (error) {
          console.error('CodeChef daily_stats fetch error:', error.message);
        } else if (dailyStats && dailyStats.length > 0) {
          console.log(`CodeChef: Found ${dailyStats.length} daily_stats records`);
          
          const dailySubmissions = {};
          
          // Calculate daily changes (skip first entry to avoid showing cumulative spike)
          dailyStats.forEach((stat, index) => {
            if (index === 0) {
              // Skip first entry - we don't know the previous value
              // This prevents showing the entire history as a spike on first sync day
              return;
            }
            
            const prevStat = dailyStats[index - 1];
            const change = stat.solved_count - prevStat.solved_count;
            
            if (change > 0) {
              dailySubmissions[stat.date] = change;
            }
          });
          
          result.codechef = dailySubmissions;
          console.log(`CodeChef calendar: ${Object.keys(dailySubmissions).length} active days (first entry skipped to avoid spike)`);
        }
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
