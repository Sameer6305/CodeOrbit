import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { username, user_id } = req.query;

    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount { difficulty count }
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }
    `;

    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables: { username } },
      { headers: { "Content-Type": "application/json" } }
    );

    const stats = response.data.data;

    const solved = stats.matchedUser.submitStats.acSubmissionNum.reduce(
      (sum, x) => sum + x.count,
      0
    );

    // Store snapshot with upsert to avoid duplicates
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "leetcode",
      solved_count: solved,
    }, {
      onConflict: 'user_id,date,platform'
    });

    console.log(`LeetCode sync: ${username} = ${solved} problems on ${today}`);
    return res.json({ solved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
