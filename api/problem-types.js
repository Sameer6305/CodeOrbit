import axios from "axios";

export default async function handler(req, res) {
  try {
    const { codeforces_handle, leetcode_username, codechef_handle } = req.query;

    const problemTypes = new Set();
    const typeCount = {};

    // Fetch from Codeforces
    if (codeforces_handle) {
      try {
        const cfResponse = await axios.get(
          `https://codeforces.com/api/user.status?handle=${codeforces_handle}`
        );
        
        if (cfResponse.data.status === 'OK') {
          const submissions = cfResponse.data.result;
          
          // Get unique solved problems with their tags
          const solvedProblems = new Map();
          submissions.forEach((sub) => {
            if (sub.verdict === 'OK') {
              const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
              if (!solvedProblems.has(problemId) && sub.problem.tags) {
                solvedProblems.set(problemId, sub.problem.tags);
                sub.problem.tags.forEach(tag => {
                  problemTypes.add(tag);
                  typeCount[tag] = (typeCount[tag] || 0) + 1;
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Codeforces error:', error.message);
      }
    }

    // Fetch from LeetCode
    if (leetcode_username) {
      try {
        const query = `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              tagProblemCounts {
                advanced { tagName problemsSolved }
                intermediate { tagName problemsSolved }
                fundamental { tagName problemsSolved }
              }
            }
          }
        `;

        const lcResponse = await axios.post(
          "https://leetcode.com/graphql",
          { query, variables: { username: leetcode_username } },
          { headers: { "Content-Type": "application/json" } }
        );

        const tagCounts = lcResponse.data.data.matchedUser.tagProblemCounts;
        
        // Combine all tag levels
        [...tagCounts.advanced, ...tagCounts.intermediate, ...tagCounts.fundamental].forEach(tag => {
          if (tag.problemsSolved > 0) {
            problemTypes.add(tag.tagName);
            typeCount[tag.tagName] = (typeCount[tag.tagName] || 0) + tag.problemsSolved;
          }
        });
      } catch (error) {
        console.error('LeetCode error:', error.message);
      }
    }

    // CodeChef doesn't provide tag/category data via API, so we'll add common categories
    if (codechef_handle) {
      // Add common competitive programming categories as fallback
      const commonTypes = ['Dynamic Programming', 'Greedy', 'Math', 'Implementation'];
      commonTypes.forEach(type => {
        if (!problemTypes.has(type)) {
          problemTypes.add(type);
          typeCount[type] = (typeCount[type] || 0) + 1;
        }
      });
    }

    // Sort by count and get top types
    const sortedTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    res.json({
      types: Array.from(problemTypes),
      typeCount: Object.fromEntries(sortedTypes),
      topTypes: sortedTypes.map(([type]) => type),
    });
  } catch (error) {
    console.error('Problem types API error:', error);
    res.status(500).json({ error: error.message });
  }
}
