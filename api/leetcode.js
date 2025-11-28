import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { parseLeetCodeCalendar, calculateStreakFromCalendar } from "./utils/streakCalculator.js";

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
          userCalendar {
            streak
            submissionCalendar
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

    // Get only the 'All' difficulty count to avoid double counting
    const allDifficulty = stats.matchedUser.submitStats.acSubmissionNum.find(
      x => x.difficulty === 'All'
    );
    const solved = allDifficulty ? allDifficulty.count : 0;
    
    // Calculate streak from submission calendar
    const submissionCalendarJson = stats.matchedUser.userCalendar?.submissionCalendar;
    const calendar = parseLeetCodeCalendar(submissionCalendarJson);
    const streakData = calculateStreakFromCalendar(calendar);
    const streak = streakData.current;

    // Store snapshot with upsert to avoid duplicates
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "leetcode",
      solved_count: solved,
      streak: streak
    }, {
      onConflict: 'user_id,date,platform'
    });

    console.log(`LeetCode sync: ${username} = ${solved} problems, streak: ${streak} on ${today}`);
    return res.json({ solved, streak, date: today, platform: 'leetcode' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
