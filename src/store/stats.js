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

  // Get stats for a specific platform
  getPlatformStats: (platform) => {
    const stats = get().dailyStats.filter((s) => s.platform === platform);
    const totalSolved = stats.reduce((sum, s) => sum + s.solved_count, 0);
    return { stats, totalSolved };
  },

  // Get total stats across all platforms
  getTotalStats: () => {
    const { dailyStats } = get();
    const totalSolved = dailyStats.reduce((sum, s) => sum + s.solved_count, 0);
    
    // Count unique active days
    const uniqueDays = new Set(dailyStats.map((s) => s.date));
    const activeDays = uniqueDays.size;

    return { totalSolved, activeDays };
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

  // Clear stats data
  clearStats: () => {
    set({ dailyStats: [], streakData: null, error: null });
  },
}));
