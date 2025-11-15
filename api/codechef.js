import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { handle, user_id } = req.query;

    const page = await axios.get(`https://www.codechef.com/users/${handle}`);
    const $ = cheerio.load(page.data);

    // Scrape solved count
    const solved = parseInt($(".rating-data-section .problems-solved h5").text());

    await supabase.from("daily_stats").upsert({
      user_id,
      date: new Date().toISOString().slice(0, 10),
      platform: "codechef",
      solved_count: solved,
    });

    return res.json({ solved });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
