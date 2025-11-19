import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { handle, user_id } = req.query;

    const page = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(page.data);

    // Find the h3 that contains "Total Problems Solved:"
    let solved = 0;
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(/Total Problems Solved:\s*(\d+)/i);
      if (match) {
        solved = parseInt(match[1]);
        return false; // Break the loop
      }
    });

    if (solved === 0) {
      throw new Error('Could not find problems solved count on profile');
    }

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
