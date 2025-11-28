import axios from 'axios';

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

  const { cf_handle, lc_username, cc_handle } = req.query;

  console.log('🎯 Compare API called with:', { cf_handle, lc_username, cc_handle });

  if (!cf_handle && !lc_username && !cc_handle) {
    return res.status(400).json({ error: 'At least one profile handle is required' });
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
              }
            }
          }
        `;

        const response = await axios.post(
          "https://leetcode.com/graphql",
          { query, variables: { username: lc_username } },
          { 
            headers: { "Content-Type": "application/json" },
            timeout: 10000
          }
        );

        const stats = response.data?.data;
        
        if (stats?.matchedUser) {
          // Get only the 'All' difficulty count to avoid double counting
          const allDifficulty = stats.matchedUser.submitStats.acSubmissionNum.find(
            x => x.difficulty === 'All'
          );
          const solved = allDifficulty ? allDifficulty.count : 0;
          
          result.leetcode = solved;
          result.streaks.leetcode = stats.matchedUser.userCalendar?.streak || 0;
          fetchSuccess.leetcode = true;
          console.log(`✅ LeetCode data for ${lc_username}:`, solved, 'solved, streak:', result.streaks.leetcode);
        } else {
          console.log(`⚠️ LeetCode: No user found for ${lc_username}`);
        }
      } catch (error) {
        console.error('❌ LeetCode fetch error for', lc_username, ':', error.message);
      }
    }

    // Fetch Codeforces data - SAME METHOD AS /api/codeforces
    if (cf_handle) {
      try {
        console.log(`🔍 Fetching Codeforces data for: ${cf_handle}`);
        
        const subRes = await axios.get(
          `https://codeforces.com/api/user.status?handle=${cf_handle}`,
          { timeout: 10000 }
        );

        if (subRes.data.status === 'OK') {
          const subs = subRes.data.result;

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

          // Calculate streak from submission history
          const dates = subs
            .filter(s => s.verdict === 'OK')
            .map(s => new Date(s.creationTimeSeconds * 1000).toISOString().split('T')[0])
            .filter((date, index, self) => self.indexOf(date) === index)
            .sort((a, b) => new Date(b) - new Date(a));

          let currentStreak = 0;
          const today = new Date().toISOString().split('T')[0];
          let checkDate = new Date();

          // Allow 1-day grace period
          if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            for (let i = 0; i < dates.length; i++) {
              const expectedDate = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0];
              if (dates.includes(expectedDate)) {
                currentStreak++;
              } else if (i > 0) { // Allow skipping today if checking from yesterday
                break;
              }
            }
          }

          result.streaks.codeforces = currentStreak;
          console.log(`✅ Codeforces streak for ${cf_handle}:`, currentStreak);
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
        
        const page = await axios.get(`https://www.codechef.com/users/${cc_handle}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const html = page.data;
        
        // Extract solved count - multiple patterns to try
        const solvedMatch = 
          html.match(/<h3>Problems\s+Solved<\/h3>\s*<div[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
          html.match(/fully\s+solved[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
          html.match(/problems?\s+solved[^>]*>\s*(\d+)/i) ||
          html.match(/"fully_solved":\s*(\d+)/i) ||
          html.match(/Fully\s+Solved[^>]*>\s*(\d+)/i);
        
        if (solvedMatch) {
          result.codechef = parseInt(solvedMatch[1], 10);
          fetchSuccess.codechef = true;
          console.log(`✅ CodeChef data for ${cc_handle}:`, result.codechef, 'solved');
        } else {
          console.log(`⚠️ CodeChef: Could not parse solved count for ${cc_handle}`);
          console.log('HTML snippet:', html.substring(0, 500));
        }

        // Try to extract streak
        const streakMatch = 
          html.match(/current\s+streak[^>]*>\s*<span[^>]*>(\d+)<\/span>/i) ||
          html.match(/streak[^>]*>\s*(\d+)\s*days?/i) ||
          html.match(/"streak":\s*(\d+)/i);
        
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
      return res.status(200).json({ 
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
