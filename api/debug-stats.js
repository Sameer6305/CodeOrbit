import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }
    if (!UUID_RE.test(String(user_id))) {
      return res.status(400).json({ error: "Invalid user_id format" });
    }

    // Fetch ALL stats for this user
    const { data, error } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", user_id)
      .order("date", { ascending: false });

    if (error) throw error;

    // Group by platform
    const byPlatform = {
      leetcode: [],
      codeforces: [],
      codechef: []
    };

    data.forEach(stat => {
      if (byPlatform[stat.platform]) {
        byPlatform[stat.platform].push({
          date: stat.date,
          solved: stat.solved_count,
          streak: stat.streak
        });
      }
    });

    return res.json({
      total_records: data.length,
      platforms: byPlatform,
      latest_by_platform: {
        leetcode: data.find(s => s.platform === 'leetcode'),
        codeforces: data.find(s => s.platform === 'codeforces'),
        codechef: data.find(s => s.platform === 'codechef')
      },
      all_data: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
