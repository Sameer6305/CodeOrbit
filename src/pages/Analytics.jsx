import { useEffect, useState } from "react";
import { BarChart3, Activity, Calendar, TrendingUp, Award, Code2, Target, Users, Trophy, Loader, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useStatsStore } from "../store/stats";
import { useProfileStore } from "../store/profile";
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function Analytics() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { dailyStats, fetchDailyStats, getTotalStats, getPlatformStats, getPlatformStreak, loading } = useStatsStore();
  const [problemTypes, setProblemTypes] = useState(null);
  
  // Comparison state
  const [showComparison, setShowComparison] = useState(false);
  const [compareHandles, setCompareHandles] = useState({
    codeforces: "",
    leetcode: "",
    codechef: ""
  });
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [comparisonError, setComparisonError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchDailyStats(user.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchProblemTypes = async () => {
      try {
        const response = await fetch('/api/problem-types');
        const data = await response.json();
        setProblemTypes(data);
      } catch (error) {
        console.error('Failed to fetch problem types:', error);
      }
    };

    if (user?.id) {
      fetchProblemTypes();
    }
  }, [user]);

  const handleCompare = async () => {
    if (!compareHandles.codeforces && !compareHandles.leetcode && !compareHandles.codechef) {
      setComparisonError("Please enter at least one profile to compare");
      return;
    }

    setLoadingComparison(true);
    setComparisonError("");

    try {
      const params = new URLSearchParams();
      if (compareHandles.codeforces) params.append('cf_handle', compareHandles.codeforces);
      if (compareHandles.leetcode) params.append('lc_username', compareHandles.leetcode);
      if (compareHandles.codechef) params.append('cc_handle', compareHandles.codechef);

      const response = await fetch(`/api/compare?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch comparison data');

      const data = await response.json();
      setComparisonData(data);
      setShowComparison(true);
    } catch (err) {
      setComparisonError(err.message);
    } finally {
      setLoadingComparison(false);
    }
  };

  const getWinner = (myValue, theirValue) => {
    if (myValue > theirValue) return "you";
    if (theirValue > myValue) return "them";
    return "tie";
  };

  const { totalSolved, activeDays, avgDaily } = getTotalStats();
  const platformStats = getPlatformStats();

  // Get streaks for all platforms
  const streaks = {
    leetcode: getPlatformStreak('leetcode'),
    codeforces: getPlatformStreak('codeforces'),
    codechef: getPlatformStreak('codechef')
  };

  const totalCurrentStreak = streaks.leetcode.current + streaks.codeforces.current + streaks.codechef.current;
  const totalLongestStreak = Math.max(streaks.leetcode.longest, streaks.codeforces.longest, streaks.codechef.longest);

  // Prepare data for weekly trend (last 7 days)
  const last7Days = dailyStats.slice(-7).map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    leetcode: stat.leetcode_count || 0,
    codeforces: stat.codeforces_count || 0,
    codechef: stat.codechef_count || 0
  }));

  // Prepare problem types data for pie chart
  const problemTypesData = problemTypes ? [
    { name: 'Easy', value: problemTypes.easy, color: '#10b981' },
    { name: 'Medium', value: problemTypes.medium, color: '#f59e0b' },
    { name: 'Hard', value: problemTypes.hard, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                {platformStats.leetcode > 0 && <div>🟡 LC: {platformStats.leetcode}</div>}
                {platformStats.codeforces > 0 && <div>🔵 CF: {platformStats.codeforces}</div>}
                {platformStats.codechef > 0 && <div>🟤 CC: {platformStats.codechef}</div>}
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
                Active Days
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : activeDays}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Days with activity
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
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : totalCurrentStreak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Combined platforms
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -3 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Longest Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : totalLongestStreak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Personal best
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Trend */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Last 7 Days Activity
          </h2>
          {last7Days.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="leetcode" fill="#eab308" name="LeetCode" stackId="a" />
                <Bar dataKey="codeforces" fill="#3b82f6" name="Codeforces" stackId="a" />
                <Bar dataKey="codechef" fill="#f97316" name="CodeChef" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
              No activity data available
            </div>
          )}
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Problem Difficulty Distribution
          </h2>
          {problemTypesData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={problemTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {problemTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4 w-full">
                {problemTypesData.map((item, idx) => (
                  <div key={idx} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
              No problem type data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Compare with Others
          </h2>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>
        </div>

        {showComparison && (
          <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Enter profile handles to compare your performance with others
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Codeforces Handle
                  </label>
                  <input
                    type="text"
                    value={compareHandles.codeforces}
                    onChange={(e) => setCompareHandles({...compareHandles, codeforces: e.target.value})}
                    placeholder="e.g., tourist"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LeetCode Username
                  </label>
                  <input
                    type="text"
                    value={compareHandles.leetcode}
                    onChange={(e) => setCompareHandles({...compareHandles, leetcode: e.target.value})}
                    placeholder="e.g., username"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CodeChef Handle
                  </label>
                  <input
                    type="text"
                    value={compareHandles.codechef}
                    onChange={(e) => setCompareHandles({...compareHandles, codechef: e.target.value})}
                    placeholder="e.g., username"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {comparisonError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">{comparisonError}</span>
                </div>
              )}

              <button
                onClick={handleCompare}
                disabled={loadingComparison}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loadingComparison ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    Compare Now
                  </>
                )}
              </button>
            </div>

            {/* Comparison Results */}
            {comparisonData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${
                    getWinner(totalSolved, (comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0)) === "you"
                      ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-500"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">You</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{totalSolved}</div>
                    <div className="text-xs space-y-1">
                      <div>🟡 LeetCode: {platformStats.leetcode}</div>
                      <div>🔵 Codeforces: {platformStats.codeforces}</div>
                      <div>🟤 CodeChef: {platformStats.codechef}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 text-center">
                    <Award className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalSolved - ((comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0)) > 0 ? "+" : ""}
                      {totalSolved - ((comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Difference</p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    getWinner(totalSolved, (comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0)) === "them"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Opponent</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {(comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0)}
                    </div>
                    <div className="text-xs space-y-1">
                      <div>🟡 LeetCode: {comparisonData.leetcode || 0}</div>
                      <div>🔵 Codeforces: {comparisonData.codeforces || 0}</div>
                      <div>🟤 CodeChef: {comparisonData.codechef || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { platform: 'LeetCode', You: platformStats.leetcode, Them: comparisonData.leetcode || 0 },
                      { platform: 'Codeforces', You: platformStats.codeforces, Them: comparisonData.codeforces || 0 },
                      { platform: 'CodeChef', You: platformStats.codechef, Them: comparisonData.codechef || 0 }
                    ]}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="platform" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <PolarRadiusAxis stroke="#6b7280" />
                      <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Radar name="Them" dataKey="Them" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
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
