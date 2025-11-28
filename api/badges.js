import axios from "axios";

export default async function handler(req, res) {
  try {
    const { codeforces_handle, leetcode_username, codechef_handle } = req.query;
    
    const badges = {
      leetcode: 0,
      codeforces: 0,
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

    // Fetch Codeforces rating (we'll count rating milestones as "badges")
    if (codeforces_handle) {
      try {
        const response = await axios.get(
          `https://codeforces.com/api/user.info?handles=${codeforces_handle}`
        );

        if (response.data.status === 'OK') {
          const user = response.data.result[0];
          const rating = user.rating || 0;
          const maxRating = user.maxRating || 0;
          
          // Count rating milestones as badges (every 200 rating = 1 badge)
          // Also count achievements like contests participated
          const ratingBadges = Math.floor(maxRating / 200);
          const contributionBadge = user.contribution > 0 ? 1 : 0;
          
          badges.codeforces = ratingBadges + contributionBadge;
        }
      } catch (error) {
        console.error('Codeforces badges error:', error.message);
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
          badges.codechef = parseInt(starMatch[1]);
        }
      } catch (error) {
        console.error('CodeChef badges error:', error.message);
      }
    }

    badges.total = badges.leetcode + badges.codeforces + badges.codechef;

    res.json({ badges });
  } catch (error) {
    console.error('Badges API error:', error);
    res.status(500).json({ error: error.message });
  }
}
