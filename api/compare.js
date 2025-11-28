import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cf_handle, lc_username, cc_handle } = req.query;

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

    // Fetch LeetCode data
    if (lc_username) {
      try {
        console.log(`🔍 Fetching LeetCode data for: ${lc_username}`);
        const lcQuery = `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStats {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              userCalendar {
                streak
                submissionCalendar
              }
            }
          }
        `;

        const lcResponse = await axios.post('https://leetcode.com/graphql', {
          query: lcQuery,
          variables: { username: lc_username }
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com'
          },
          timeout: 10000
        });

        if (lcResponse.data?.data?.matchedUser) {
          const submissions = lcResponse.data.data.matchedUser.submitStats.acSubmissionNum;
          const totalSolved = submissions.find(item => item.difficulty === "All")?.count || 0;
          result.leetcode = totalSolved;
          result.streaks.leetcode = lcResponse.data.data.matchedUser.userCalendar?.streak || 0;
          console.log(`✅ LeetCode data for ${lc_username}:`, totalSolved, 'solved, streak:', result.streaks.leetcode);
        } else {
          console.log(`⚠️ LeetCode: No data found for ${lc_username}`);
          result.leetcode = null; // Distinguish between 0 and no data
        }
      } catch (error) {
        console.error('❌ LeetCode fetch error for', lc_username, ':', error.message);
        result.leetcode = null; // Distinguish between 0 and error
      }
    }

    // Fetch Codeforces data
    if (cf_handle) {
      try {
        console.log(`🔍 Fetching Codeforces data for: ${cf_handle}`);
        const cfResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${cf_handle}`, {
          timeout: 10000
        });
        if (cfResponse.data.status === 'OK') {
          const submissions = cfResponse.data.result;
          const solvedProblems = new Set();
          
          submissions.forEach(submission => {
            if (submission.verdict === 'OK' && submission.problem) {
              const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
              solvedProblems.add(problemId);
            }
          });

          result.codeforces = solvedProblems.size;
          console.log(`✅ Codeforces data for ${cf_handle}:`, solvedProblems.size, 'solved');

          // Calculate streak from submission history
          const dates = submissions
            .filter(s => s.verdict === 'OK')
            .map(s => new Date(s.creationTimeSeconds * 1000).toDateString())
            .filter((date, index, self) => self.indexOf(date) === index)
            .sort((a, b) => new Date(b) - new Date(a));

          let currentStreak = 0;
          const today = new Date().toDateString();
          let checkDate = new Date();

          for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            if (date === checkDate.toDateString()) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          result.streaks.codeforces = currentStreak;
          console.log(`✅ Codeforces streak for ${cf_handle}:`, currentStreak);
        } else {
          console.log(`⚠️ Codeforces: Invalid response for ${cf_handle}`);
          result.codeforces = null;
        }
      } catch (error) {
        console.error('❌ Codeforces fetch error for', cf_handle, ':', error.message);
        result.codeforces = null;
      }
    }

    // Fetch CodeChef data
    if (cc_handle) {
      try {
        console.log(`🔍 Fetching CodeChef data for: ${cc_handle}`);
        const ccResponse = await axios.get(`https://www.codechef.com/users/${cc_handle}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const html = ccResponse.data;
        
        // Extract solved count
        const solvedMatch = html.match(/<h3>Problems\s+Solved<\/h3>\s*<div[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
                           html.match(/fully\s+solved[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
                           html.match(/problems?\s+solved[^>]*>\s*(\d+)/i);
        
        if (solvedMatch) {
          result.codechef = parseInt(solvedMatch[1], 10);
          console.log(`✅ CodeChef data for ${cc_handle}:`, result.codechef, 'solved');
        } else {
          console.log(`⚠️ CodeChef: Could not parse solved count for ${cc_handle}`);
          result.codechef = null;
        }

        // Try to extract streak (CodeChef shows "Current Streak")
        const streakMatch = html.match(/current\s+streak[^>]*>\s*<span[^>]*>(\d+)<\/span>/i) ||
                           html.match(/streak[^>]*>\s*(\d+)\s*days?/i);
        
        if (streakMatch) {
          result.streaks.codechef = parseInt(streakMatch[1], 10);
          console.log(`✅ CodeChef streak for ${cc_handle}:`, result.streaks.codechef);
        }
      } catch (error) {
        console.error('❌ CodeChef fetch error for', cc_handle, ':', error.message);
        result.codechef = null;
      }
    }

    console.log('📊 Final comparison result:', result);
    
    // Check if we got any valid data
    const hasAnyData = result.leetcode !== null || result.codeforces !== null || result.codechef !== null;
    
    if (!hasAnyData) {
      console.log('⚠️ No data could be fetched for any platform');
      return res.status(404).json({ 
        error: 'No data found for the provided handles',
        details: 'Please verify the usernames are correct and try again',
        result
      });
    }
    
    // Convert null values back to 0 for platforms that weren't queried
    Object.keys(result).forEach(key => {
      if (key === 'streaks') {
        Object.keys(result.streaks).forEach(platform => {
          if (result.streaks[platform] === null) result.streaks[platform] = 0;
        });
      } else if (result[key] === null) {
        result[key] = 0;
      }
    });
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('Comparison API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch comparison data',
      details: error.message 
    });
  }
}
