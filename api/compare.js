import { parseLeetCodeCalendar, createCodeforcesCalendar, calculateStreakFromCalendar } from "./utils/streakCalculator.js";

const HANDLE_RE = /^[a-zA-Z0-9_.-]{1,50}$/;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cf_handle, lc_username, cc_handle, test } = req.query;
  
  // Health check endpoint
  if (test === 'ping') {
    return res.status(200).json({ 
      status: 'ok', 
      version: '2.0',
      message: 'Compare API is working',
      timestamp: new Date().toISOString()
    });
  }

  console.log('🎯 Compare API called with:', { cf_handle, lc_username, cc_handle });
  console.log('🎯 API Version: 2.0 - Using same methods as user sync APIs');

  if (!cf_handle && !lc_username && !cc_handle) {
    return res.status(400).json({ error: 'At least one profile handle is required' });
  }
  if (cf_handle && !HANDLE_RE.test(String(cf_handle))) {
    return res.status(400).json({ error: 'Invalid cf_handle format' });
  }
  if (lc_username && !HANDLE_RE.test(String(lc_username))) {
    return res.status(400).json({ error: 'Invalid lc_username format' });
  }
  if (cc_handle && !HANDLE_RE.test(String(cc_handle))) {
    return res.status(400).json({ error: 'Invalid cc_handle format' });
  }

  try {
    const result = {
      leetcode: 0,
      codeforces: 0,
      codechef: 0,
      streaks: {
        leetcode: 0,
        codeforces: 0,
        codechef: 0
      }
    };
    
    // Track which platforms were successfully fetched
    const fetchSuccess = {
      leetcode: false,
      codeforces: false,
      codechef: false
    };

    // Fetch LeetCode data - SAME METHOD AS /api/leetcode
    if (lc_username) {
      try {
        console.log(`🔍 Fetching LeetCode data for: ${lc_username}`);

        const query = `
          query getUserProfile($username: String!) {
            allQuestionsCount { difficulty count }
            matchedUser(username: $username) {
              submitStats: submitStatsGlobal {
                acSubmissionNum { difficulty count }
              }
              userCalendar {
                streak
                submissionCalendar
              }
            }
          }
        `;

        const lcResponse = await fetch("https://leetcode.com/graphql", {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { username: lc_username } })
        });

        const responseData = await lcResponse.json();
        const stats = responseData?.data;
        
        if (stats?.matchedUser) {
          // Get only the 'All' difficulty count to avoid double counting
          const allDifficulty = stats.matchedUser.submitStats.acSubmissionNum.find(
            x => x.difficulty === 'All'
          );
          const solved = allDifficulty ? allDifficulty.count : 0;
          
          // Calculate streak from submission calendar
          const submissionCalendarJson = stats.matchedUser.userCalendar?.submissionCalendar;
          const calendar = parseLeetCodeCalendar(submissionCalendarJson);
          const streakData = calculateStreakFromCalendar(calendar);
          
          result.leetcode = solved;
          result.streaks.leetcode = streakData.current;
          fetchSuccess.leetcode = true;
          console.log(`✅ LeetCode data for ${lc_username}:`, solved, 'solved, streak:', result.streaks.leetcode);
        } else {
          console.log(`⚠️ LeetCode: No user found for ${lc_username}`);
        }
      } catch (error) {
        console.error('❌ LeetCode fetch error for', lc_username, ':', error.message);
      }
    }    // Fetch Codeforces data - SAME METHOD AS /api/codeforces
    if (cf_handle) {
      try {
        console.log(`🔍 Fetching Codeforces data for: ${cf_handle}`);
        
        const cfResponse = await fetch(
          `https://codeforces.com/api/user.status?handle=${cf_handle}`
        );

        const cfData = await cfResponse.json();

        if (cfData.status === 'OK') {
          const subs = cfData.result;

          // Count total unique problems solved
          const uniqueProblems = new Set();
          subs.forEach((s) => {
            if (s.verdict === "OK") {
              const problemId = `${s.problem.contestId}-${s.problem.index}`;
              uniqueProblems.add(problemId);
            }
          });

          result.codeforces = uniqueProblems.size;
          fetchSuccess.codeforces = true;
          console.log(`✅ Codeforces data for ${cf_handle}:`, uniqueProblems.size, 'solved');

          // Calculate streak using unified streak calculator
          const calendar = createCodeforcesCalendar(subs);
          const streakData = calculateStreakFromCalendar(calendar);
          
          result.streaks.codeforces = streakData.current;
          console.log(`✅ Codeforces streak for ${cf_handle}:`, streakData.current);
        } else {
          console.log(`⚠️ Codeforces: Invalid response for ${cf_handle}`);
        }
      } catch (error) {
        console.error('❌ Codeforces fetch error for', cf_handle, ':', error.message);
      }
    }

    // Fetch CodeChef data - SAME METHOD AS /api/codechef
    if (cc_handle) {
      try {
        console.log(`🔍 Fetching CodeChef data for: ${cc_handle}`);
        
        const ccResponse = await fetch(`https://www.codechef.com/users/${cc_handle}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const html = await ccResponse.text();
        
        // Primary pattern: Look for "Total Problems Solved:" in h3 tags (used in codechef.js)
        let solvedMatch = html.match(/<h3[^>]*>Total Problems Solved:\s*(\d+)/i);
        
        // Fallback patterns if primary doesn't work
        if (!solvedMatch) {
          solvedMatch = 
            html.match(/Total\s+Problems\s+Solved:\s*(\d+)/i) ||
            html.match(/<h3>Problems\s+Solved<\/h3>\s*<div[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
            html.match(/fully\s+solved[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
            html.match(/"fully_solved":\s*(\d+)/i) ||
            html.match(/Fully\s+Solved[^>]*>\s*(\d+)/i);
        }
        
        if (solvedMatch) {
          result.codechef = parseInt(solvedMatch[1], 10);
          fetchSuccess.codechef = true;
          console.log(`✅ CodeChef data for ${cc_handle}:`, result.codechef, 'solved');
        } else {
          console.log(`⚠️ CodeChef: Could not parse solved count for ${cc_handle}`);
          console.log('HTML preview:', html.substring(0, 1000));
        }

        // Try to extract streak
        const streakMatch = 
          html.match(/current\s+streak[^>]*>\s*<span[^>]*>(\d+)<\/span>/i) ||
          html.match(/streak[^>]*>\s*(\d+)\s*days?/i) ||
          html.match(/"current_streak":\s*(\d+)/i);
        
        if (streakMatch) {
          result.streaks.codechef = parseInt(streakMatch[1], 10);
          console.log(`✅ CodeChef streak for ${cc_handle}:`, result.streaks.codechef);
        }
      } catch (error) {
        console.error('❌ CodeChef fetch error for', cc_handle, ':', error.message);
      }
    }

    console.log('📊 Final comparison result:', result);
    console.log('📊 Fetch success status:', fetchSuccess);
    
    // Check if we successfully fetched data for at least one requested platform
    const hasAnyData = 
      (lc_username && fetchSuccess.leetcode) ||
      (cf_handle && fetchSuccess.codeforces) ||
      (cc_handle && fetchSuccess.codechef);
    
    if (!hasAnyData) {
      console.log('⚠️ No data could be fetched for any platform');
      return res.status(404).json({ 
        error: 'No data found for the provided handles',
        details: 'Please verify the usernames are correct and try again',
        leetcode: 0,
        codeforces: 0,
        codechef: 0,
        streaks: { leetcode: 0, codeforces: 0, codechef: 0 }
      });
    }
    
    console.log('✅ Returning successful result:', result);
    return res.status(200).json(result);

  } catch (error) {
    console.error('Comparison API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch comparison data',
      details: error.message 
    });
  }
}
