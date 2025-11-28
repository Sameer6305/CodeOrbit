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
          headers: { 'Content-Type': 'application/json' }
        });

        if (lcResponse.data?.data?.matchedUser) {
          const submissions = lcResponse.data.data.matchedUser.submitStats.acSubmissionNum;
          const totalSolved = submissions.find(item => item.difficulty === "All")?.count || 0;
          result.leetcode = totalSolved;
          result.streaks.leetcode = lcResponse.data.data.matchedUser.userCalendar?.streak || 0;
        }
      } catch (error) {
        console.error('LeetCode fetch error:', error.message);
      }
    }

    // Fetch Codeforces data
    if (cf_handle) {
      try {
        const cfResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${cf_handle}`);
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
        }
      } catch (error) {
        console.error('Codeforces fetch error:', error.message);
      }
    }

    // Fetch CodeChef data
    if (cc_handle) {
      try {
        const ccResponse = await axios.get(`https://www.codechef.com/users/${cc_handle}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const html = ccResponse.data;
        
        // Extract solved count
        const solvedMatch = html.match(/<h3>Problems\s+Solved<\/h3>\s*<div[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
                           html.match(/fully\s+solved[^>]*>\s*<h5>(\d+)<\/h5>/i) ||
                           html.match(/problems?\s+solved[^>]*>\s*(\d+)/i);
        
        if (solvedMatch) {
          result.codechef = parseInt(solvedMatch[1], 10);
        }

        // Try to extract streak (CodeChef shows "Current Streak")
        const streakMatch = html.match(/current\s+streak[^>]*>\s*<span[^>]*>(\d+)<\/span>/i) ||
                           html.match(/streak[^>]*>\s*(\d+)\s*days?/i);
        
        if (streakMatch) {
          result.streaks.codechef = parseInt(streakMatch[1], 10);
        }
      } catch (error) {
        console.error('CodeChef fetch error:', error.message);
      }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Comparison API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch comparison data',
      details: error.message 
    });
  }
}
