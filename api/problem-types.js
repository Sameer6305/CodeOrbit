import axios from "axios";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{1,50}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { codeforces_handle, leetcode_username, codechef_handle } = req.query;
    if (codeforces_handle && !USERNAME_RE.test(String(codeforces_handle))) {
      return res.status(400).json({ error: "Invalid codeforces_handle format" });
    }
    if (leetcode_username && !USERNAME_RE.test(String(leetcode_username))) {
      return res.status(400).json({ error: "Invalid leetcode_username format" });
    }
    if (codechef_handle && !USERNAME_RE.test(String(codechef_handle))) {
      return res.status(400).json({ error: "Invalid codechef_handle format" });
    }

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

        const tagCounts = lcResponse.data?.data?.matchedUser?.tagProblemCounts;
        if (!tagCounts) {
          throw new Error('LeetCode user not found');
        }
        
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

    // Sort by count - return ALL types, not just top 10
    const sortedTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1]);

    res.json({
      types: Array.from(problemTypes),
      typeCount: Object.fromEntries(sortedTypes),
      topTypes: sortedTypes.map(([type, count]) => ({ type, count })),
    });
  } catch (error) {
    console.error('Problem types API error:', error);
    res.status(500).json({ error: error.message });
  }
}
