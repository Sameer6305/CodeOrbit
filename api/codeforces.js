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

    // 2. Group solved by date
    const solvedByDate = {};

    subs.forEach((s) => {
      if (s.verdict === "OK") {
        const date = new Date(s.creationTimeSeconds * 1000)
          .toISOString()
          .slice(0, 10);
        solvedByDate[date] = (solvedByDate[date] || 0) + 1;
      }
    });

    // 3. Upsert into Supabase
    for (const date in solvedByDate) {
      await supabase.from("daily_stats").upsert({
        user_id,
        date,
        platform: "codeforces",
        solved_count: solvedByDate[date],
      });
    }

    return res.json({ success: true, solved: solvedByDate });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
