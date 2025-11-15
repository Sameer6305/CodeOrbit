import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const API_TOKEN = process.env.CLIST_API_TOKEN;

export default async function handler(req, res) {
  try {
    const { platform } = req.query;

    const url = `https://clist.by/api/v3/contest/?resource__name=${platform}&upcoming=true`;

    const response = await axios.get(url, {
      headers: { Authorization: `ApiKey ${API_TOKEN}` }
    });

    const contests = response.data.objects.map((c) => ({
      name: c.event,
      platform: platform,
      start_time: c.start,
      duration: c.duration,
      url: c.href,
    }));

    // Cache
    await supabase.from("contests_cache").insert(contests);

    res.json({ contests });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
