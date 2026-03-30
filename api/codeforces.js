import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { createCodeforcesCalendar, calculateStreakFromCalendar } from "./utils/streakCalculator.js";
import { ensureMethod, sendError, createLogger, requireAuthenticatedUser, withRetry } from "./utils/http.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const HANDLE_RE = /^[a-zA-Z0-9_.-]{1,50}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const logger = createLogger("codeforces-sync");

export default async function handler(req, res) {
  if (!ensureMethod(req, res, "GET")) {
    return;
  }

  try {
    const { handle, user_id } = req.query;

    if (!handle || !user_id)
      return sendError(res, 400, "Missing handle or user_id");
    if (!HANDLE_RE.test(String(handle))) {
      return sendError(res, 400, "Invalid handle format");
    }
    if (!UUID_RE.test(String(user_id))) {
      return sendError(res, 400, "Invalid user_id format");
    }

    const authUser = await requireAuthenticatedUser(req, res, supabase, user_id);
    if (!authUser) {
      return;
    }

    // 1. Fetch Codeforces submissions
    const subRes = await withRetry(() =>
      axios.get(`https://codeforces.com/api/user.status?handle=${handle}`, { timeout: 12000 })
    , { retries: 1 });

    if (subRes.data?.status !== "OK" || !Array.isArray(subRes.data?.result)) {
      return sendError(res, 404, "Codeforces handle not found");
    }

    const subs = subRes.data.result;

    // 2. Count total unique problems solved (cumulative total, not per-day)
    const uniqueProblems = new Set();
    subs.forEach((s) => {
      if (s.verdict === "OK") {
        const problemId = `${s.problem.contestId}-${s.problem.index}`;
        uniqueProblems.add(problemId);
      }
    });

    const totalSolved = uniqueProblems.size;

    // Calculate streak from submission calendar
    const calendar = createCodeforcesCalendar(subs);
    const streakData = calculateStreakFromCalendar(calendar);
    const currentStreak = streakData.current;

    // 3. Store cumulative total for today
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "codeforces",
      solved_count: totalSolved,
      streak: currentStreak
    }, {
      onConflict: 'user_id,date,platform'
    });

    logger.info("Codeforces sync completed", {
      userId: authUser.id,
      handle,
      solved: totalSolved,
      streak: currentStreak,
      date: today,
    });
    return res.json({ success: true, solved: totalSolved, streak: currentStreak, date: today, platform: 'codeforces' });
  } catch (err) {
    logger.error("Codeforces sync failed", { error: err.message });
    return sendError(res, 500, "Failed to sync Codeforces", err.message);
  }
}
