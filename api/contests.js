import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const API_TOKEN = process.env.CLIST_API_TOKEN;

export default async function handler(req, res) {
  try {
    // Fetch contests from multiple platforms
    const platforms = ['codeforces.com', 'leetcode.com', 'codechef.com'];
    const allContests = [];

    for (const platform of platforms) {
      try {
        const url = `https://clist.by/api/v4/contest/?resource=${platform}&upcoming=true&limit=10&order_by=start`;

        const response = await axios.get(url, {
          headers: { 
            Authorization: `ApiKey ${API_TOKEN}` 
          }
        });

        const contests = response.data.objects.map((c) => ({
          name: c.event,
          platform: platform.split('.')[0].charAt(0).toUpperCase() + platform.split('.')[0].slice(1),
          start_time: c.start,
          duration: c.duration,
          url: c.href,
        }));

        allContests.push(...contests);
      } catch (platformError) {
        console.error(`Error fetching ${platform}:`, platformError.message);
      }
    }

    // Sort by start time and limit to 10 most upcoming
    allContests.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const upcomingContests = allContests.slice(0, 10);

    // Cache in database
    if (upcomingContests.length > 0) {
      try {
        await supabase.from("contests_cache").delete().neq('id', 0); // Clear old cache
        await supabase.from("contests_cache").insert(upcomingContests);
      } catch (dbError) {
        console.error("Database cache error:", dbError.message);
      }
    }

    res.json({ contests: upcomingContests });
  } catch (e) {
    console.error("Contests API error:", e);
    res.status(500).json({ error: e.message });
  }
}
