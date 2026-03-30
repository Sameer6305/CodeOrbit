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
import { getAuthHeaders, fetchWithTimeout } from "../utils/apiClient";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { streakData, fetchDailyStats, getTotalStats, getPlatformBreakdown, getPlatformStreak, loading, clearCache } = useStatsStore();
  
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [syncResults, setSyncResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [problemTypes, setProblemTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [badges, setBadges] = useState({ leetcode: 0, codechef: 0, total: 0 });
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [contestRefreshTrigger, setContestRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchDailyStats(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (profile && (profile.codeforces_handle || profile.leetcode_username || profile.codechef_handle)) {
      fetchProblemTypes();
      fetchBadges();
    }
  }, [profile]);

  const totalStats = getTotalStats();
  const totalSolved = totalStats?.totalSolved || 0;
  const activeDays = totalStats?.activeDays || 0;
  const platformBreakdown = getPlatformBreakdown() || { leetcode: 0, codeforces: 0, codechef: 0 };
  
  console.log('📊 Dashboard Display Data:', {
    totalSolved,
    activeDays,
    platformBreakdown,
    rawTotalStats: totalStats
  });
  
  // Get streak data for each platform
  const cfStreak = getPlatformStreak('codeforces') || { current: 0, longest: 0 };
  const lcStreak = getPlatformStreak('leetcode') || { current: 0, longest: 0 };
  const ccStreak = getPlatformStreak('codechef') || { current: 0, longest: 0 };
  
  // Get all platform streaks for display
  const platformStreaks = [
    { platform: 'LeetCode', current: lcStreak.current, emoji: '🟡', handle: profile?.leetcode_username },
    { platform: 'Codeforces', current: cfStreak.current, emoji: '🔵', handle: profile?.codeforces_handle },
    { platform: 'CodeChef', current: ccStreak.current, emoji: '🟤', handle: profile?.codechef_handle }
  ].filter(s => s.handle); // Only show configured platforms

  const handleRefresh = () => {
    if (user?.id) {
      clearCache(); // Clear cache before fetching
      fetchDailyStats(user.id);
    }
  };

  const fetchProblemTypes = async () => {
    if (!profile) return;
    
    setLoadingTypes(true);
    try {
      const params = new URLSearchParams();
      if (profile.codeforces_handle) params.append('codeforces_handle', profile.codeforces_handle);
      if (profile.leetcode_username) params.append('leetcode_username', profile.leetcode_username);
      if (profile.codechef_handle) params.append('codechef_handle', profile.codechef_handle);
      
      const response = await fetch(`/api/problem-types?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // topTypes now includes objects with { type, count }
        setProblemTypes(data.topTypes || []);
      }
    } catch (error) {
      console.error('Error fetching problem types:', error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchBadges = async () => {
    if (!profile) return;
    
    setLoadingBadges(true);
    try {
      const params = new URLSearchParams();
      if (profile.codeforces_handle) params.append('codeforces_handle', profile.codeforces_handle);
      if (profile.leetcode_username) params.append('leetcode_username', profile.leetcode_username);
      if (profile.codechef_handle) params.append('codechef_handle', profile.codechef_handle);
      
      const response = await fetch(`/api/badges?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || { leetcode: 0, codechef: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoadingBadges(false);
    }
  };

  const handleSyncAll = async () => {
    if (!user?.id || !profile) return;

    setSyncing(true);
    setSyncProgress({ done: 0, total: 0 });
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
    const configuredPlatforms = platforms.filter(p => p.handle);
    setSyncProgress({ done: 0, total: configuredPlatforms.length });

    const syncPromises = configuredPlatforms
      .map(async (platform) => {
        try {
          const authHeaders = await getAuthHeaders();
          const response = await fetchWithTimeout(
            `${platform.endpoint}?${platform.param}=${platform.handle}&user_id=${user.id}&t=${Date.now()}`,
            {
              headers: {
                ...authHeaders,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            },
            15000
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
            message: `Synced successfully - ${data.solved || 0} problems`,
          };
        } catch (error) {
          console.error(`${platform.name} sync error:`, error);
          return {
            platform: platform.name,
            success: false,
            message: error.message || 'Network error',
          };
        } finally {
          setSyncProgress((prev) => ({ ...prev, done: prev.done + 1 }));
        }
      });

    const syncResults = await Promise.all(syncPromises);
    setSyncResults(syncResults);
    setSyncing(false);
    setSyncProgress({ done: syncResults.length, total: syncResults.length });

    // Refresh all dashboard data after sync (wait longer for database to update)
    setTimeout(() => {
      clearCache(); // Clear cache before fetching
      fetchDailyStats(user.id);
      fetchProblemTypes();
      fetchBadges();
      setContestRefreshTrigger(prev => prev + 1); // Trigger contest refresh
    }, 2000);

    // Hide results after 5 seconds
    setTimeout(() => {
      setShowResults(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">
                🚀 Dashboard
              </h1>
              <p className="text-white/90 text-lg">
                Welcome back, <span className="font-bold">{user?.email?.split('@')[0] || 'User'}</span>! Here's your coding activity overview.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-white/30"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {profile && (profile.codeforces_handle || profile.leetcode_username || profile.codechef_handle) && (
                <button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/95 disabled:bg-white/50 text-purple-600 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <Zap className={`w-5 h-5 ${syncing ? 'animate-pulse' : ''}`} />
                  {syncing
                    ? `Syncing (${syncProgress.done}/${syncProgress.total || 0})...`
                    : 'Sync All Platforms'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* No data notice */}
      {!loading && totalSolved === 0 && profile && (profile.codeforces_handle || profile.leetcode_username || profile.codechef_handle) && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
            <strong className="text-base">ℹ️ Getting Started:</strong> Click the "Sync All Platforms" button above to fetch your coding statistics from all configured platforms.
          </p>
        </div>
      )}

      {/* Sync Results */}
      {showResults && syncResults.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-6 border-l-4 border-blue-500 backdrop-blur-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-500" />
            Sync Results:
          </h3>
          <div className="space-y-3">
            {syncResults.map((result, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
                <span className="font-bold text-gray-900 dark:text-white">
                  {result.platform}:
                </span>
                <span className={`font-medium ${result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
          change={
            <div className="space-y-0.5 text-xs mt-1">
              {platformBreakdown.leetcode > 0 && <div>🟡 LeetCode: {platformBreakdown.leetcode}</div>}
              {platformBreakdown.codeforces > 0 && <div>🔵 Codeforces: {platformBreakdown.codeforces}</div>}
              {platformBreakdown.codechef > 0 && <div>🟤 CodeChef: {platformBreakdown.codechef}</div>}
              {!platformBreakdown.leetcode && !platformBreakdown.codeforces && !platformBreakdown.codechef && "No data yet"}
            </div>
          }
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-green-600" />}
          title="Current Streaks"
          value={loading ? "..." : ""}
          change={
            <div className="space-y-1 text-sm mt-1">
              {platformStreaks.length > 0 ? (
                platformStreaks.map((streak, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>{streak.emoji} {streak.platform}:</span>
                    <span className="font-bold">{streak.current} days</span>
                  </div>
                ))
              ) : (
                <div className="text-xs">Add platforms in Settings</div>
              )}
            </div>
          }
          bgColor="bg-green-50 dark:bg-green-900/20"
          delay={0.1}
        />
        <StatCard
          icon={<Target className="w-8 h-8 text-purple-600" />}
          title="Top Problem Types"
          value={loadingTypes ? "..." : problemTypes.length > 0 ? `${problemTypes.length} total` : "0"}
          change={
            <div className="space-y-0.5 text-xs mt-1">
              {problemTypes.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="truncate text-gray-700 dark:text-gray-300">📚 {item.type}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">{item.count}</span>
                </div>
              ))}
              {problemTypes.length > 5 && <div className="text-gray-400 text-center mt-1">+{problemTypes.length - 5} more types</div>}
              {problemTypes.length === 0 && "Solve problems to discover"}
            </div>
          }
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          delay={0.2}
        />
        <StatCard
          icon={<Award className="w-8 h-8 text-orange-600" />}
          title="Badges & Achievements"
          value={loadingBadges ? "..." : badges.total.toString()}
          change={
            <div className="space-y-0.5 text-xs mt-1">
              {profile?.leetcode_username && badges.leetcode > 0 && <div>🟡 LeetCode: {badges.leetcode}</div>}
              {profile?.codechef_handle && badges.codechef > 0 && <div>🟤 CodeChef: {badges.codechef}</div>}
              {badges.total === 0 && "Earn badges by solving!"}
            </div>
          }
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
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-8 text-center shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-yellow-900 dark:text-yellow-100 font-bold text-lg mb-2">
            No Platform Handles Configured
          </p>
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            Go to{" "}
            <a href="/settings" className="underline hover:text-yellow-900 dark:hover:text-yellow-100 font-bold">
              Settings ⚙️
            </a>{" "}
            to add your Codeforces, LeetCode, or CodeChef usernames.
          </p>
        </div>
      )}

      {/* Contest Widget */}
      <ContestWidget refreshTrigger={contestRefreshTrigger} />
    </div>
  );
}
