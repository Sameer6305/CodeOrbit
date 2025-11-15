import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { computeStreak } from "../utils/streakCalculator";

export const useStatsStore = create((set, get) => ({
  dailyStats: [],
  streakData: null,
  loading: false,
  error: null,

  // Fetch all daily stats for a user
  fetchDailyStats: async (userId, days = 365) => {
    set({ loading: true, error: null });
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (error) throw error;

      // Group by date and sum across platforms
      const groupedByDate = {};
      data.forEach((stat) => {
        if (!groupedByDate[stat.date]) {
          groupedByDate[stat.date] = { date: stat.date, solved: 0 };
        }
        groupedByDate[stat.date].solved += stat.solved_count;
      });

      const dailyStatsArray = Object.values(groupedByDate);
      
      // Calculate streak data
      const streakData = computeStreak(dailyStatsArray);

      set({ 
        dailyStats: data, 
        streakData,
        loading: false 
      });
      
      return { dailyStats: data, streakData };
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Get stats for a specific platform or all platforms
  getPlatformStats: (platform) => {
    const { dailyStats } = get();
    
    if (platform) {
      // Single platform stats - get latest count
      const stats = dailyStats.filter((s) => s.platform === platform);
      const latestStat = stats.reduce((latest, current) => 
        new Date(current.date) > new Date(latest?.date || '1970-01-01') ? current : latest
      , null);
      const totalSolved = latestStat?.solved_count || 0;
      return { stats, totalSolved };
    }
    
    // All platforms breakdown - get latest count for each
    const platforms = ["codeforces", "leetcode", "codechef"];
    const breakdown = {};
    
    platforms.forEach((p) => {
      const platformStats = dailyStats.filter((s) => s.platform === p);
      const latestStat = platformStats.reduce((latest, current) => 
        new Date(current.date) > new Date(latest?.date || '1970-01-01') ? current : latest
      , null);
      breakdown[p] = latestStat?.solved_count || 0;
    });
    
    return breakdown;
  },

  // Get total stats across all platforms
  getTotalStats: () => {
    const { dailyStats } = get();
    
    // Get the LATEST count for each platform (not sum)
    const latestByPlatform = {};
    dailyStats.forEach((stat) => {
      if (!latestByPlatform[stat.platform] || 
          new Date(stat.date) > new Date(latestByPlatform[stat.platform].date)) {
        latestByPlatform[stat.platform] = stat;
      }
    });
    
    const totalSolved = Object.values(latestByPlatform)
      .reduce((sum, stat) => sum + stat.solved_count, 0);
    
    // Count unique active days (days where ANY platform has data)
    const uniqueDays = new Set(dailyStats.map((s) => s.date));
    const activeDays = uniqueDays.size;
    
    // Calculate average: This should be total problems / total days
    // But since solved_count is cumulative, we can't calculate true daily average
    // Instead, show the current solving rate
    const avgDaily = activeDays > 1 ? (totalSolved / activeDays).toFixed(1) : '0';

    return { totalSolved, activeDays, avgDaily: parseFloat(avgDaily) };
  },

  // Get stats for last N days
  getRecentStats: (days = 30) => {
    const { dailyStats } = get();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    const recentStats = dailyStats.filter((s) => s.date >= startDateStr);
    
    // Group by date for chart
    const groupedByDate = {};
    recentStats.forEach((stat) => {
      if (!groupedByDate[stat.date]) {
        groupedByDate[stat.date] = { date: stat.date, solved: 0 };
      }
      groupedByDate[stat.date].solved += stat.solved_count;
    });

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  },

  // Get platform comparison data for radar chart
  getPlatformComparison: () => {
    const { dailyStats } = get();
    const platforms = ["codeforces", "leetcode", "codechef"];
    
    return platforms.map((platform) => {
      const platformStats = dailyStats.filter((s) => s.platform === platform);
      // Get latest count, not sum
      const latestStat = platformStats.reduce((latest, current) => 
        new Date(current.date) > new Date(latest?.date || '1970-01-01') ? current : latest
      , null);
      const total = latestStat?.solved_count || 0;
      return {
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        solved: total,
      };
    });
  },

  // Get platform breakdown for display
  getPlatformBreakdown: () => {
    const { dailyStats } = get();
    const breakdown = {
      leetcode: 0,
      codeforces: 0,
      codechef: 0,
    };
    
    // Get LATEST count for each platform
    const latestByPlatform = {};
    dailyStats.forEach((stat) => {
      if (!latestByPlatform[stat.platform] || 
          new Date(stat.date) > new Date(latestByPlatform[stat.platform].date)) {
        latestByPlatform[stat.platform] = stat;
      }
    });
    
    Object.entries(latestByPlatform).forEach(([platform, stat]) => {
      if (breakdown.hasOwnProperty(platform)) {
        breakdown[platform] = stat.solved_count;
      }
    });
    
    return breakdown;
  },

  // Get streak data for a specific platform
  getPlatformStreak: (platform) => {
    const { dailyStats } = get();
    
    // Filter and sort stats for this platform by date (newest first)
    const platformStats = dailyStats
      .filter((s) => s.platform === platform)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (platformStats.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    // Since solved_count is cumulative, we detect activity by checking if count increased
    const dailyActivity = [];
    for (let i = 0; i < platformStats.length; i++) {
      const current = platformStats[i];
      const previous = platformStats[i + 1]; // Older entry
      
      // If no previous or count increased, there was activity
      const hadActivity = !previous || current.solved_count > previous.solved_count;
      dailyActivity.push({
        date: current.date,
        active: hadActivity,
        count: current.solved_count
      });
    }
    
    // Calculate current streak (from most recent day backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dailyActivity.length; i++) {
      const activityDate = new Date(dailyActivity[i].date);
      activityDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      // Check if this is the expected consecutive day and had activity
      if (activityDate.getTime() === expectedDate.getTime() && dailyActivity[i].active) {
        currentStreak++;
      } else if (i > 0) {
        // Allow 1 day grace period for "today"
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;
    
    // Go through in chronological order (reverse the array)
    for (let i = dailyActivity.length - 1; i >= 0; i--) {
      const current = dailyActivity[i];
      const currentDate = new Date(current.date);
      
      if (current.active) {
        if (!prevDate) {
          tempStreak = 1;
        } else {
          const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        prevDate = currentDate;
      } else {
        tempStreak = 0;
        prevDate = null;
      }
    }
    
    return { current: currentStreak, longest: longestStreak };
  },

  // Clear stats data
  clearStats: () => {
    set({ dailyStats: [], streakData: null, error: null });
  },
}));
