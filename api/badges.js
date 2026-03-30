import axios from "axios";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{1,50}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { codeforces_handle, leetcode_username, codechef_handle } = req.query;
    if (leetcode_username && !USERNAME_RE.test(String(leetcode_username))) {
      return res.status(400).json({ error: "Invalid leetcode_username format" });
    }
    if (codechef_handle && !USERNAME_RE.test(String(codechef_handle))) {
      return res.status(400).json({ error: "Invalid codechef_handle format" });
    }
    
    const badges = {
      leetcode: 0,
      codechef: 0,
      total: 0
    };

    // Fetch LeetCode badges
    if (leetcode_username) {
      try {
        const query = `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              badges {
                id
                name
                icon
              }
            }
          }
        `;

        const response = await axios.post(
          "https://leetcode.com/graphql",
          { query, variables: { username: leetcode_username } },
          { headers: { "Content-Type": "application/json" } }
        );

        const badgeData = response.data?.data?.matchedUser?.badges || [];
        badges.leetcode = badgeData.length;
      } catch (error) {
        console.error('LeetCode badges error:', error.message);
      }
    }

    // Fetch CodeChef stars (we'll use stars as badges)
    if (codechef_handle) {
      try {
        const response = await axios.get(
          `https://www.codechef.com/users/${codechef_handle}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );
        
        // CodeChef has star ratings (1-7 stars)
        // We'll extract this from the HTML if available
        const html = response.data;
        const starMatch = html.match(/(\d+)\s*★/);
        if (starMatch) {
          badges.codechef = parseInt(starMatch[1], 10);
        }
      } catch (error) {
        console.error('CodeChef badges error:', error.message);
      }
    }

    badges.total = badges.leetcode + badges.codechef;

    res.json({ badges });
  } catch (error) {
    console.error('Badges API error:', error);
    res.status(500).json({ error: error.message });
  }
}
