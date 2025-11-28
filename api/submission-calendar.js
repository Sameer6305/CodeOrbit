import axios from "axios";

export default async function handler(req, res) {
  try {
    const { lc_username, cf_handle, cc_username } = req.query;
    
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

    // Fetch CodeChef submission history (if available via API)
    if (cc_username) {
      try {
        // CodeChef doesn't have a public API for submission calendar
        // We'll use the stored daily_stats as fallback
        result.codechef = {};
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
