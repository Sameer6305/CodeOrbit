import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { handle, user_id } = req.query;

    if (!handle || !user_id)
      return res.status(400).json({ error: "Missing handle or user_id" });

    // 1. Fetch Codeforces submissions
    const subRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );

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

    // 3. Store cumulative total for today
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "codeforces",
      solved_count: totalSolved,
    }, {
      onConflict: 'user_id,date,platform'
    });

    console.log(`Codeforces sync: ${handle} = ${totalSolved} problems on ${today}`);
    return res.json({ success: true, solved: totalSolved });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
