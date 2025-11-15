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
      // Single platform stats
      const stats = dailyStats.filter((s) => s.platform === platform);
      const totalSolved = stats.reduce((sum, s) => sum + s.solved_count, 0);
      return { stats, totalSolved };
    }
    
    // All platforms breakdown
    const platforms = ["codeforces", "leetcode", "codechef"];
    const breakdown = {};
    
    platforms.forEach((p) => {
      const platformStats = dailyStats.filter((s) => s.platform === p);
      breakdown[p] = platformStats.reduce((sum, s) => sum + s.solved_count, 0);
    });
    
    return breakdown;
  },

  // Get total stats across all platforms
  getTotalStats: () => {
    const { dailyStats } = get();
    const totalSolved = dailyStats.reduce((sum, s) => sum + s.solved_count, 0);
    
    // Count unique active days
    const uniqueDays = new Set(dailyStats.map((s) => s.date));
    const activeDays = uniqueDays.size;
    
    // Calculate average daily
    const avgDaily = activeDays > 0 ? totalSolved / activeDays : 0;

    return { totalSolved, activeDays, avgDaily };
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
      const total = platformStats.reduce((sum, s) => sum + s.solved_count, 0);
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
    
    dailyStats.forEach((stat) => {
      if (breakdown.hasOwnProperty(stat.platform)) {
        breakdown[stat.platform] += stat.solved_count;
      }
    });
    
    return breakdown;
  },

  // Get streak data for a specific platform
  getPlatformStreak: (platform) => {
    const { dailyStats } = get();
    
    // Filter stats for this platform and sort by date
    const platformStats = dailyStats
      .filter((s) => s.platform === platform)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (platformStats.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < platformStats.length; i++) {
      const statDate = new Date(platformStats[i].date);
      statDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (statDate.getTime() === expectedDate.getTime() && platformStats[i].solved_count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = platformStats.length - 1; i >= 0; i--) {
      if (platformStats[i].solved_count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    return { current: currentStreak, longest: longestStreak };
  },

  // Clear stats data
  clearStats: () => {
    set({ dailyStats: [], streakData: null, error: null });
  },
}));
