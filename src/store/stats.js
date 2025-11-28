import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { computeStreak } from "../utils/streakCalculator";

export const useStatsStore = create((set, get) => ({
  dailyStats: [],
  streakData: null,
  loading: false,
  error: null,

  // Fetch all daily stats for a user
  fetchDailyStats: async (userId) => {
    set({ loading: true, error: null });
    try {
      // Fetch ALL historical data (no date limit) for accurate longest streak
      const { data, error } = await supabase
        .from("daily_stats")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      console.log('📊 Raw data from Supabase:', data);

      // Since we store cumulative totals, we need to calculate daily changes for streaks
      const platformData = {};
      
      // Group by platform and sort by date
      data.forEach((stat) => {
        if (!platformData[stat.platform]) {
          platformData[stat.platform] = [];
        }
        platformData[stat.platform].push(stat);
      });

      // Sort each platform's data by date ascending
      Object.keys(platformData).forEach((platform) => {
        platformData[platform].sort((a, b) => new Date(a.date) - new Date(b.date));
      });

      console.log('📊 Platform data grouped:', platformData);

      // Calculate daily changes (for streak calculation)
      const dailyChanges = [];
      Object.keys(platformData).forEach((platform) => {
        const stats = platformData[platform];
        for (let i = 0; i < stats.length; i++) {
          const current = stats[i];
          const previous = stats[i - 1];
          const change = previous ? current.solved_count - previous.solved_count : current.solved_count;
          
          if (change > 0) {
            dailyChanges.push({
              date: current.date,
              platform: platform,
              change: change,
              total: current.solved_count
            });
          }
        }
      });

      // Group changes by date for streak calculation
      const groupedByDate = {};
      dailyChanges.forEach((change) => {
        if (!groupedByDate[change.date]) {
          groupedByDate[change.date] = { date: change.date, solved: 0 };
        }
        groupedByDate[change.date].solved += change.change;
      });

      const dailyStatsArray = Object.values(groupedByDate);
      console.log('📊 Daily changes for streak:', dailyStatsArray);
      
      // Calculate streak data
      const streakData = computeStreak(dailyStatsArray);
      console.log('📊 Streak data:', streakData);

      set({ 
        dailyStats: data, 
        streakData,
        loading: false 
      });
      
      return { dailyStats: data, streakData };
    } catch (error) {
      console.error('❌ fetchDailyStats error:', error);
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
      if (stats.length === 0) {
        return { stats: [], totalSolved: 0 };
      }
      const latestStat = stats.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      }, null);
      const totalSolved = latestStat?.solved_count || 0;
      return { stats, totalSolved };
    }
    
    // All platforms breakdown - get latest count for each
    const platforms = ["codeforces", "leetcode", "codechef"];
    const breakdown = {};
    
    platforms.forEach((p) => {
      const platformStats = dailyStats.filter((s) => s.platform === p);
      if (platformStats.length === 0) {
        breakdown[p] = 0;
        return;
      }
      const latestStat = platformStats.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      }, null);
      breakdown[p] = latestStat?.solved_count || 0;
    });
    
    console.log('getPlatformStats breakdown:', breakdown); // Debug log
    
    return breakdown;
  },

  // Get total stats across all platforms
  getTotalStats: () => {
    const { dailyStats } = get();
    
    if (dailyStats.length === 0) {
      return { totalSolved: 0, activeDays: 0, avgDaily: 0 };
    }
    
    // Get the LATEST count for each platform (not sum)
    const latestByPlatform = {};
    dailyStats.forEach((stat) => {
      const platform = stat.platform;
      if (!latestByPlatform[platform]) {
        latestByPlatform[platform] = stat;
      } else {
        // Compare dates and keep the most recent
        const currentDate = new Date(stat.date);
        const existingDate = new Date(latestByPlatform[platform].date);
        if (currentDate > existingDate) {
          latestByPlatform[platform] = stat;
        }
      }
    });
    
    console.log('Latest by platform:', latestByPlatform); // Debug log
    
    const totalSolved = Object.values(latestByPlatform)
      .reduce((sum, stat) => sum + stat.solved_count, 0);
    
    // Count unique active days (days where ANY platform has data)
    const uniqueDays = new Set(dailyStats.map((s) => s.date));
    const activeDays = uniqueDays.size;
    
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
    
    // Calculate daily changes (not cumulative sums)
    const platformData = {};
    
    // Group by platform
    recentStats.forEach((stat) => {
      if (!platformData[stat.platform]) {
        platformData[stat.platform] = [];
      }
      platformData[stat.platform].push(stat);
    });

    // Sort each platform's data by date
    Object.keys(platformData).forEach((platform) => {
      platformData[platform].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    // Calculate daily changes for each platform
    const dailyChanges = {};
    Object.keys(platformData).forEach((platform) => {
      const stats = platformData[platform];
      for (let i = 0; i < stats.length; i++) {
        const current = stats[i];
        const previous = stats[i - 1];
        const change = previous ? current.solved_count - previous.solved_count : 0;
        
        if (!dailyChanges[current.date]) {
          dailyChanges[current.date] = { date: current.date, solved: 0 };
        }
        dailyChanges[current.date].solved += change > 0 ? change : 0;
      }
    });

    return Object.values(dailyChanges).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  },

  // Get platform comparison data for radar chart
  getPlatformComparison: () => {
    const { dailyStats } = get();
    const platforms = ["codeforces", "leetcode", "codechef"];
    
    return platforms.map((platform) => {
      const platformStats = dailyStats.filter((s) => s.platform === platform);
      if (platformStats.length === 0) {
        return {
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          solved: 0,
        };
      }
      // Get latest count, not sum
      const latestStat = platformStats.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      }, null);
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
    
    if (dailyStats.length === 0) {
      return breakdown;
    }
    
    // Get LATEST count for each platform
    const latestByPlatform = {};
    dailyStats.forEach((stat) => {
      const platform = stat.platform;
      if (!latestByPlatform[platform]) {
        latestByPlatform[platform] = stat;
      } else {
        const currentDate = new Date(stat.date);
        const existingDate = new Date(latestByPlatform[platform].date);
        if (currentDate > existingDate) {
          latestByPlatform[platform] = stat;
        }
      }
    });
    
    console.log('Platform breakdown - latest:', latestByPlatform); // Debug log
    
    Object.entries(latestByPlatform).forEach(([platform, stat]) => {
      if (breakdown.hasOwnProperty(platform)) {
        breakdown[platform] = stat.solved_count;
      }
    });
    
    return breakdown;
  },

  // Get streak data for a specific platform using submission calendar
  getPlatformStreak: (platform) => {
    const { dailyStats } = get();
    
    // Filter and sort stats for this platform by date (oldest first)
    const platformStats = dailyStats
      .filter((s) => s.platform === platform)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (platformStats.length === 0) {
      return { current: 0, longest: 0 };
    }

    console.log(`🔥 Getting streak for ${platform}:`, platformStats.length, 'records');

    // Use the most recent streak value stored in the database
    const latestStat = platformStats[platformStats.length - 1];
    const currentStreak = latestStat.streak || 0;

    // Calculate longest streak from historical data
    let longestStreak = 0;
    for (const stat of platformStats) {
      if (stat.streak && stat.streak > longestStreak) {
        longestStreak = stat.streak;
      }
    }

    // If no historical max, use current
    if (longestStreak === 0) {
      longestStreak = currentStreak;
    }

    console.log(`🔥 ${platform} streaks - Current: ${currentStreak}, Longest: ${longestStreak}`);

    return { current: currentStreak, longest: longestStreak };
  },

  // Clear stats data
  clearStats: () => {
    set({ dailyStats: [], streakData: null, error: null });
  },
}));
