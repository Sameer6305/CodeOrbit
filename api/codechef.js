import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { handle, user_id } = req.query;

    const page = await axios.get(`https://www.codechef.com/users/${handle}`);
    const $ = cheerio.load(page.data);

    // Scrape solved count from the profile page
    const solvedText = $(".rating-data-section .problems-solved h5").text().trim();
    const solved = parseInt(solvedText) || 0;

    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "codechef",
      solved_count: solved,
    }, {
      onConflict: 'user_id,date,platform'
    });

    console.log(`CodeChef sync: ${handle} = ${solved} problems on ${today}`);
    return res.json({ solved });
  } catch (e) {
    console.error('CodeChef API error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
