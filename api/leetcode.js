import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { parseLeetCodeCalendar, calculateStreakFromCalendar } from "./utils/streakCalculator.js";
import { ensureMethod, sendError, createLogger, requireAuthenticatedUser, withRetry } from "./utils/http.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const USERNAME_RE = /^[a-zA-Z0-9_-]{1,50}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const logger = createLogger("leetcode-sync");

export default async function handler(req, res) {
  if (!ensureMethod(req, res, "GET")) {
    return;
  }

  try {
    const { username, user_id } = req.query;

    if (!username || !user_id) {
      return sendError(res, 400, "Missing username or user_id");
    }
    if (!USERNAME_RE.test(String(username))) {
      return sendError(res, 400, "Invalid username format");
    }
    if (!UUID_RE.test(String(user_id))) {
      return sendError(res, 400, "Invalid user_id format");
    }

    const authUser = await requireAuthenticatedUser(req, res, supabase, user_id);
    if (!authUser) {
      return;
    }

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

    const response = await withRetry(() =>
      axios.post(
        "https://leetcode.com/graphql",
        { query, variables: { username } },
        { headers: { "Content-Type": "application/json" }, timeout: 12000 }
      )
    , { retries: 1 });

    const stats = response.data?.data;
    if (!stats?.matchedUser?.submitStats?.acSubmissionNum) {
      return sendError(res, 404, "LeetCode user not found");
    }

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

    logger.info("LeetCode sync completed", {
      userId: authUser.id,
      username,
      solved,
      streak,
      date: today,
    });
    return res.json({ solved, streak, date: today, platform: 'leetcode' });
  } catch (err) {
    logger.error("LeetCode sync failed", { error: err.message });
    return sendError(res, 500, "Failed to sync LeetCode", err.message);
  }
}
