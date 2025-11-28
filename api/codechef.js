import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  try {
    const { handle, user_id } = req.query;

    if (!handle || !user_id) {
      return res.status(400).json({ error: "Missing handle or user_id" });
    }

    const page = await axios.get(`https://www.codechef.com/users/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
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

    // Try to extract current streak from the page
    let currentStreak = 0;
    $('.rating-data-section').each((i, section) => {
      const $section = $(section);
      const label = $section.find('h3').text().trim();
      if (label.toLowerCase().includes('streak')) {
        const streakText = $section.find('.rating-number').text().trim();
        const streakMatch = streakText.match(/(\d+)/);
        if (streakMatch) {
          currentStreak = parseInt(streakMatch[1]);
        }
      }
    });

    // If streak not found in rating-data-section, try alternative patterns
    if (currentStreak === 0) {
      const pageText = page.data;
      const streakMatch = pageText.match(/current\s*streak[^>]*>\s*(\d+)/i) ||
                         pageText.match(/streak[^>]*>\s*(\d+)\s*days?/i);
      if (streakMatch) {
        currentStreak = parseInt(streakMatch[1]);
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("daily_stats").upsert({
      user_id,
      date: today,
      platform: "codechef",
      solved_count: solved,
      streak: currentStreak
    }, {
      onConflict: 'user_id,date,platform'
    });

    console.log(`CodeChef sync: ${handle} = ${solved} problems, streak: ${currentStreak} on ${today}`);
    return res.json({ solved, streak: currentStreak, date: today, platform: 'codechef' });
  } catch (e) {
    console.error('CodeChef API error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
