import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { createLogger, withRetry, ensureMethod, sendError } from "./utils/http.js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const logger = createLogger("contests");

const API_TOKEN = process.env.CLIST_API_TOKEN;

export default async function handler(req, res) {
  if (!ensureMethod(req, res, "GET")) {
    return;
  }

  if (!API_TOKEN) {
    return sendError(res, 500, "CLIST_API_TOKEN is not configured");
  }

  try {
    const now = new Date();
    const platforms = [
      { name: 'codeforces.com', displayName: 'Codeforces' },
      { name: 'leetcode.com', displayName: 'LeetCode' },
      { name: 'codechef.com', displayName: 'CodeChef' }
    ];
    
    const allContests = [];

    // Fetch contests from each platform
    for (const platform of platforms) {
      try {
        // Get upcoming contests for this platform (limit to 20 to ensure we get at least one upcoming)
        const url = `https://clist.by/api/v4/contest/?resource=${platform.name}&start__gt=${now.toISOString()}&order_by=start&limit=20`;

        logger.info("Fetching contests", { platform: platform.displayName });

        const response = await withRetry(() => axios.get(url, {
          headers: { 
            Authorization: `ApiKey ${API_TOKEN}` 
          },
          timeout: 10000 // 10 second timeout
        }), { retries: 1 });

        if (response.data && response.data.objects && response.data.objects.length > 0) {
          // Get the next upcoming contest for this platform
          const nextContest = response.data.objects[0];
          
          // Clean up contest name (remove common prefixes and clean formatting)
          let contestName = nextContest.event || 'Contest';
          const originalName = contestName;
          
          // Remove platform name prefixes and clean up
          contestName = contestName
            .replace(/^LeetCode\s+/ig, '')
            .replace(/^CodeChef\s+/ig, '')
            .replace(/^Codeforces\s+/ig, '')
            .replace(/^CF\s+/ig, '')
            .replace(/^LC\s+/ig, '')
            .replace(/^CC\s+/ig, '')
            .replace(/\s+Round\s+#?(\d+)/i, ' Round $1') // Normalize round numbers
            .replace(/\s+\(Div\.?\s*(\d+)\)/i, ' (Div. $1)') // Normalize divisions
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();
          
          // If name is empty or too short after cleaning, use original
          if (!contestName || contestName.length < 3) {
            contestName = originalName;
          }
          
          logger.info("Normalized contest name", { platform: platform.displayName, originalName, contestName });
          
          allContests.push({
            name: contestName,
            platform: platform.displayName,
            start_time: nextContest.start,
            duration: nextContest.duration || 7200, // Default 2 hours if not provided
            url: nextContest.href || `https://${platform.name}/contests`,
          });
          
          logger.info("Found contest", { platform: platform.displayName, event: nextContest.event });
        } else {
          logger.warn("No contests found", { platform: platform.displayName });
        }
      } catch (platformError) {
        logger.error("Platform contest fetch failed", { platform: platform.displayName, error: platformError.message });
        // Continue to next platform even if one fails
      }
    }

    logger.info("Total contests fetched", { count: allContests.length });

    // Sort by start time
    allContests.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    // If we got contests, cache them
    if (allContests.length > 0) {
      try {
        const rowsForCache = allContests.map((contest) => ({
          contest_name: contest.name,
          platform: contest.platform,
          start_time: contest.start_time,
          duration: contest.duration,
          link: contest.url,
        }));

        await supabase.from("contests_cache").delete().neq('id', 0); // Clear old cache
        await supabase.from("contests_cache").insert(rowsForCache);
        logger.info("Cached contests to database", { count: rowsForCache.length });
      } catch (dbError) {
        logger.error("Database cache error", { error: dbError.message });
        // Don't fail the request if caching fails
      }
    } else {
      // Try to get cached contests if API failed
      logger.warn("Falling back to cached contests");
      try {
        const { data: cachedContests, error: cacheError } = await supabase
          .from("contests_cache")
          .select("contest_name, platform, start_time, duration, link")
          .order("start_time", { ascending: true });
        
        if (!cacheError && cachedContests && cachedContests.length > 0) {
          // Filter to only future contests
          const futureContests = cachedContests
            .filter(c => new Date(c.start_time) > now)
            .map((c) => ({
              name: c.contest_name,
              platform: c.platform,
              start_time: c.start_time,
              duration: c.duration,
              url: c.link,
            }));

          if (futureContests.length > 0) {
            logger.info("Using cached contests", { count: futureContests.length });
            return res.json({ contests: futureContests });
          }
        }
      } catch (cacheReadError) {
        logger.error("Cache read error", { error: cacheReadError.message });
      }
    }

    res.json({ contests: allContests });
  } catch (e) {
    logger.error("Contests API error", { error: e.message });
    return sendError(res, 500, e.message || 'Failed to fetch contests');
  }
}
