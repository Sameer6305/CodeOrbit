import { useEffect, useState } from "react";
import { Code2, TrendingUp, Target, Award, RefreshCw, Zap, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { useStatsStore } from "../store/stats";
import { useProfileStore } from "../store/profile";
import StatCard from "../components/StatCard";
import HeatmapChart from "../components/HeatmapChart";
import ActivityChart from "../components/ActivityChart";
import PlatformRadarChart from "../components/PlatformRadarChart";
import ContestWidget from "../components/ContestWidget";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { streakData, fetchDailyStats, getTotalStats, loading } = useStatsStore();
  
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchDailyStats(user.id);
    }
  }, [user]);

  const { totalSolved, activeDays } = getTotalStats();
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  const handleRefresh = () => {
    if (user?.id) {
      fetchDailyStats(user.id);
    }
  };

  const handleSyncAll = async () => {
    if (!user?.id || !profile) return;

    setSyncing(true);
    setSyncResults([]);
    setShowResults(true);

    const results = [];
    const platforms = [
      { 
        name: 'Codeforces', 
        handle: profile.codeforces_handle, 
        endpoint: '/api/codeforces',
        param: 'handle'
      },
      { 
        name: 'LeetCode', 
        handle: profile.leetcode_username, 
        endpoint: '/api/leetcode',
        param: 'username'
      },
      { 
        name: 'CodeChef', 
        handle: profile.codechef_handle, 
        endpoint: '/api/codechef',
        param: 'handle'
      },
    ];

    // Sync all platforms in parallel
    const syncPromises = platforms
      .filter(p => p.handle) // Only sync platforms with configured handles
      .map(async (platform) => {
        try {
          const response = await fetch(
            `${platform.endpoint}?${platform.param}=${platform.handle}&user_id=${user.id}`
          );
          
          if (!response.ok) {
            // Check if it's a 404 (API route not found in dev)
            if (response.status === 404) {
              throw new Error('API routes only work in production (Vercel). Deploy to test sync.');
            }
            const data = await response.json();
            throw new Error(data.error || 'Sync failed');
          }

          const data = await response.json();

          return {
            platform: platform.name,
            success: true,
            message: `Synced ${Object.keys(data.solved || {}).length || 0} days of data`,
          };
        } catch (error) {
          console.error(`${platform.name} sync error:`, error);
          return {
            platform: platform.name,
            success: false,
            message: error.message || 'Network error',
          };
        }
      });

    const syncResults = await Promise.all(syncPromises);
    setSyncResults(syncResults);
    setSyncing(false);

    // Refresh dashboard data after sync
    setTimeout(() => {
      fetchDailyStats(user.id);
    }, 1000);

    // Hide results after 5 seconds
    setTimeout(() => {
      setShowResults(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}! Here's your coding activity overview.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {profile && (profile.codeforces_handle || profile.leetcode_username || profile.codechef_handle) && (
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition shadow-lg"
            >
              <Zap className={`w-5 h-5 ${syncing ? 'animate-pulse' : ''}`} />
              {syncing ? 'Syncing All...' : 'Sync All Platforms'}
            </button>
          )}
        </div>
      </div>

      {/* Development Notice */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>ℹ️ Development Mode:</strong> The "Sync All Platforms" button requires deployment to Vercel to work. 
            API routes only function in production. See <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">DEVELOPMENT_NOTES.md</code> for details.
          </p>
        </div>
      )}

      {/* Sync Results */}
      {showResults && syncResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sync Results:</h3>
          <div className="space-y-2">
            {syncResults.map((result, index) => (
              <div key={index} className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {result.platform}:
                </span>
                <span className={result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Code2 className="w-8 h-8 text-blue-600" />}
          title="Total Solved"
          value={loading ? "..." : totalSolved.toString()}
          change={`${activeDays} active days`}
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          title="Current Streak"
          value={loading ? "..." : `${currentStreak} days`}
          change={currentStreak > 0 ? "Keep it up!" : "Start solving today!"}
          bgColor="bg-green-50 dark:bg-green-900/20"
          delay={0.1}
        />
        <StatCard
          icon={<Target className="w-8 h-8 text-purple-600" />}
          title="Longest Streak"
          value={loading ? "..." : `${longestStreak} days`}
          change="Personal best"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          delay={0.2}
        />
        <StatCard
          icon={<Award className="w-8 h-8 text-orange-600" />}
          title="This Week"
          value={loading ? "..." : "—"}
          change="Track your progress"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <PlatformRadarChart />
      </div>

      {/* Heatmap */}
      <HeatmapChart />

      {/* Warning if no profiles configured */}
      {profile && !profile.codeforces_handle && !profile.leetcode_username && !profile.codechef_handle && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            No platform handles configured. Go to{" "}
            <a href="/settings" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
              Settings
            </a>{" "}
            to add your Codeforces, LeetCode, or CodeChef usernames.
          </p>
        </div>
      )}

      {/* Contest Widget */}
      <ContestWidget />
    </div>
  );
}
