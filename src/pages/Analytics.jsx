import { useEffect } from "react";
import { BarChart3, Activity, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useStatsStore } from "../store/stats";
import { useProfileStore } from "../store/profile";

export default function Analytics() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { dailyStats, fetchDailyStats, getTotalStats, getPlatformStats, loading } = useStatsStore();

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchDailyStats(user.id);
    }
  }, [user]);

  const { totalSolved, activeDays, avgDaily } = getTotalStats();
  const platformStats = getPlatformStats();

  // Check if user has configured any platforms
  const hasProfiles = profile && (profile.codeforces_handle || profile.leetcode_username || profile.codechef_handle);

  // If no profiles configured, show message
  if (!loading && !hasProfiles) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Deep dive into your coding statistics and trends.
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
          <Calendar className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            No Platform Configured
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Add your Codeforces, LeetCode, or CodeChef profile URLs in Settings to see your analytics.
          </p>
          <Link
            to="/settings"
            className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Deep dive into your coding statistics and trends.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Problems
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : totalSolved}
              </p>
              <div className="mt-1 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                {platformStats.leetcode > 0 && <div>🟡 LeetCode: {platformStats.leetcode}</div>}
                {platformStats.codeforces > 0 && <div>🔵 Codeforces: {platformStats.codeforces}</div>}
                {platformStats.codechef > 0 && <div>🟤 CodeChef: {platformStats.codechef}</div>}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Across Platforms
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : totalSolved}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Combined from all sources
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Days
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : activeDays}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Platform Breakdown */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Platform Breakdown
        </h2>
        <div className="space-y-4">
          {profile?.leetcode_username && platformStats.leetcode > 0 && (
            <PlatformBar 
              platform="LeetCode" 
              solved={platformStats.leetcode} 
              total={platformStats.leetcode} 
              color="bg-yellow-500"
              delay={0.5}
            />
          )}
          {profile?.codeforces_handle && platformStats.codeforces > 0 && (
            <PlatformBar 
              platform="Codeforces" 
              solved={platformStats.codeforces} 
              total={platformStats.codeforces} 
              color="bg-blue-500"
              delay={0.6}
            />
          )}
          {profile?.codechef_handle && platformStats.codechef > 0 && (
            <PlatformBar 
              platform="CodeChef" 
              solved={platformStats.codechef} 
              total={platformStats.codechef} 
              color="bg-orange-500"
              delay={0.7}
            />
          )}
          {(!profile?.leetcode_username && !profile?.codeforces_handle && !profile?.codechef_handle) && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No platform data available. Add platforms in Settings and sync your data.
            </p>
          )}
        </div>
      </motion.div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Weekly Trend
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            Line chart will be rendered here
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Difficulty Distribution
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            Pie chart will be rendered here
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PlatformBar({ platform, solved, total, color, delay = 0 }) {
  const percentage = 100; // Always show full bar since we're showing actual count

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {platform}
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {solved} problems
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <motion.div
          className={`${color} h-4 rounded-full flex items-center justify-center`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
        >
          <span className="text-white text-xs font-semibold px-2">
            {solved}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
