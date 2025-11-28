import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Trophy, TrendingUp, Target, Award, Code2, ExternalLink, Loader, AlertCircle, CheckCircle, Zap, Flame, Star, BarChart3, GitCompare, Activity } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { useProfileStore } from "../store/profile";
import { useStatsStore } from "../store/stats";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function Benchmark() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { getPlatformBreakdown, getPlatformStreak, loading } = useStatsStore();

  // Persist state in localStorage
  const [compareHandles, setCompareHandles] = useState(() => {
    const saved = localStorage.getItem('benchmark_handles');
    return saved ? JSON.parse(saved) : { codeforces: "", leetcode: "", codechef: "" };
  });

  const [comparisonData, setComparisonData] = useState(() => {
    const saved = localStorage.getItem('benchmark_comparison');
    return saved ? JSON.parse(saved) : null;
  });

  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user]);

  // Save handles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('benchmark_handles', JSON.stringify(compareHandles));
  }, [compareHandles]);

  // Save comparison data to localStorage whenever it changes
  useEffect(() => {
    if (comparisonData) {
      localStorage.setItem('benchmark_comparison', JSON.stringify(comparisonData));
    }
  }, [comparisonData]);

  const myStats = getPlatformBreakdown();
  const myStreaks = {
    codeforces: getPlatformStreak('codeforces'),
    leetcode: getPlatformStreak('leetcode'),
    codechef: getPlatformStreak('codechef')
  };

  const handleCompare = async () => {
    if (!compareHandles.codeforces && !compareHandles.leetcode && !compareHandles.codechef) {
      setError("Please enter at least one profile to compare");
      return;
    }

    setLoadingComparison(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (compareHandles.codeforces) params.append('cf_handle', compareHandles.codeforces);
      if (compareHandles.leetcode) params.append('lc_username', compareHandles.leetcode);
      if (compareHandles.codechef) params.append('cc_handle', compareHandles.codechef);

      console.log('Fetching comparison with params:', params.toString());
      
      const response = await fetch(`/api/compare?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comparison data');
      }

      const data = await response.json();
      console.log('Comparison data received:', data);
      
      // Check if we have any data from the handles that were provided
      const hasValidData = 
        (compareHandles.leetcode && data.leetcode !== undefined) ||
        (compareHandles.codeforces && data.codeforces !== undefined) ||
        (compareHandles.codechef && data.codechef !== undefined);
      
      if (!hasValidData) {
        setError("No data found for the provided handles. Please verify the usernames are correct.");
        setComparisonData(null);
      } else {
        setComparisonData(data);
        setError(""); // Clear any previous errors
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || "Failed to fetch comparison data. Please check the handles and try again.");
      setComparisonData(null); // Clear old data on error
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleClearComparison = () => {
    setCompareHandles({ codeforces: "", leetcode: "", codechef: "" });
    setComparisonData(null);
    setError("");
    localStorage.removeItem('benchmark_handles');
    localStorage.removeItem('benchmark_comparison');
  };

  const getWinner = (myValue, theirValue) => {
    if (myValue > theirValue) return "you";
    if (theirValue > myValue) return "them";
    return "tie";
  };

  // Calculate totals
  const totalMy = myStats.leetcode + myStats.codeforces + myStats.codechef;
  const totalThem = comparisonData ? 
    (comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0) : 0;

  // Prepare radar chart data
  const radarData = comparisonData ? [
    { platform: 'LeetCode', You: myStats.leetcode, Them: comparisonData.leetcode || 0 },
    { platform: 'Codeforces', You: myStats.codeforces, Them: comparisonData.codeforces || 0 },
    { platform: 'CodeChef', You: myStats.codechef, Them: comparisonData.codechef || 0 }
  ] : [];

  // Prepare streak comparison data
  const streakData = comparisonData ? [
    { name: 'LeetCode', You: myStreaks.leetcode.current, Them: comparisonData.streaks?.leetcode || 0 },
    { name: 'Codeforces', You: myStreaks.codeforces.current, Them: comparisonData.streaks?.codeforces || 0 },
    { name: 'CodeChef', You: myStreaks.codechef.current, Them: comparisonData.streaks?.codechef || 0 }
  ] : [];

  // Prepare pie chart data for your stats
  const myPieData = [
    { name: 'LeetCode', value: myStats.leetcode },
    { name: 'Codeforces', value: myStats.codeforces },
    { name: 'CodeChef', value: myStats.codechef }
  ].filter(item => item.value > 0);

  const theirPieData = comparisonData ? [
    { name: 'LeetCode', value: comparisonData.leetcode || 0 },
    { name: 'Codeforces', value: comparisonData.codeforces || 0 },
    { name: 'CodeChef', value: comparisonData.codechef || 0 }
  ].filter(item => item.value > 0) : [];

  // Progress circle component
  const ProgressCircle = ({ value, max, label, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(percentage)}%</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <GitCompare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Benchmark & Compare</h1>
            <p className="text-white/90 mt-2">
              Measure your skills against other competitive programmers
            </p>
          </div>
        </div>
      </div>

      {/* Profile Input Section - Modern Glass Morphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enter Competitor Profiles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-blue-500">🔵</span> Codeforces Handle
            </label>
            <input
              type="text"
              value={compareHandles.codeforces}
              onChange={(e) => setCompareHandles({...compareHandles, codeforces: e.target.value})}
              placeholder="e.g., tourist"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-yellow-500">🟡</span> LeetCode Username
            </label>
            <input
              type="text"
              value={compareHandles.leetcode}
              onChange={(e) => setCompareHandles({...compareHandles, leetcode: e.target.value})}
              placeholder="e.g., username"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-amber-700">🟤</span> CodeChef Handle
            </label>
            <input
              type="text"
              value={compareHandles.codechef}
              onChange={(e) => setCompareHandles({...compareHandles, codechef: e.target.value})}
              placeholder="e.g., username"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleCompare}
            disabled={loadingComparison}
            className="flex-1 md:flex-initial px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
          >
            {loadingComparison ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Analyzing Performance...</span>
              </>
            ) : (
              <>
                <Trophy className="w-6 h-6" />
                <span>Compare Performance</span>
                <Zap className="w-5 h-5" />
              </>
            )}
          </button>

          {(comparisonData || compareHandles.codeforces || compareHandles.leetcode || compareHandles.codechef) && (
            <button
              onClick={handleClearComparison}
              className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Comparison Results */}
      <AnimatePresence>
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`rounded-2xl shadow-2xl p-6 relative overflow-hidden ${
                  getWinner(totalMy, totalThem) === "you" 
                    ? "bg-gradient-to-br from-green-400 to-emerald-600" 
                    : "bg-gradient-to-br from-gray-700 to-gray-900"
                } text-white`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">You</h3>
                    {getWinner(totalMy, totalThem) === "you" && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Trophy className="w-8 h-8 text-yellow-300" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-5xl font-black mb-4">{totalMy}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🟡 LeetCode</span>
                      <span className="font-bold">{myStats.leetcode}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🔵 Codeforces</span>
                      <span className="font-bold">{myStats.codeforces}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🟤 CodeChef</span>
                      <span className="font-bold">{myStats.codechef}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-white"
              >
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="w-14 h-14 mx-auto mb-3 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">Difference</h3>
                  <div className={`text-6xl font-black mb-2 ${totalMy > totalThem ? 'text-green-300' : totalMy < totalThem ? 'text-red-300' : 'text-white'}`}>
                    {totalMy > totalThem ? "+" : ""}{totalMy - totalThem}
                  </div>
                  <p className="text-lg font-semibold bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    {totalMy > totalThem ? "🎉 You're Winning!" : totalMy < totalThem ? "💪 Keep Grinding!" : "🤝 It's a Tie!"}
                  </p>
                </div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`rounded-2xl shadow-2xl p-6 relative overflow-hidden ${
                  getWinner(totalMy, totalThem) === "them" 
                    ? "bg-gradient-to-br from-blue-400 to-cyan-600" 
                    : "bg-gradient-to-br from-gray-700 to-gray-900"
                } text-white`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Opponent</h3>
                    {getWinner(totalMy, totalThem) === "them" && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Trophy className="w-8 h-8 text-yellow-300" />
                      </motion.div>
                    )}
                  </div>
                  <div className="text-5xl font-black mb-4">{totalThem}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🟡 LeetCode</span>
                      <span className="font-bold">{comparisonData.leetcode || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🔵 Codeforces</span>
                      <span className="font-bold">{comparisonData.codeforces || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span>🟤 CodeChef</span>
                      <span className="font-bold">{comparisonData.codechef || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </motion.div>
            </div>

            {/* Platform Progress Circles */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Target className="w-7 h-7 text-purple-600" />
                Performance by Platform
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProgressCircle 
                  value={myStats.leetcode} 
                  max={Math.max(myStats.leetcode, comparisonData.leetcode || 0)} 
                  label="LeetCode" 
                  color="#f59e0b"
                />
                <ProgressCircle 
                  value={myStats.codeforces} 
                  max={Math.max(myStats.codeforces, comparisonData.codeforces || 0)} 
                  label="Codeforces" 
                  color="#3b82f6"
                />
                <ProgressCircle 
                  value={myStats.codechef} 
                  max={Math.max(myStats.codechef, comparisonData.codechef || 0)} 
                  label="CodeChef" 
                  color="#92400e"
                />
              </div>
            </motion.div>

            {/* Advanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Multi-Platform Radar
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="platform" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: 600 }} />
                    <PolarRadiusAxis stroke="#6b7280" />
                    <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} strokeWidth={2} />
                    <Radar name="Them" dataKey="Them" stroke="#ec4899" fill="#ec4899" fillOpacity={0.7} strokeWidth={2} />
                    <Legend iconType="circle" />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Streak Comparison Bar Chart */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-600" />
                  Current Streak Battle
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={streakData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 600 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                      }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="You" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Them" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Your Distribution Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                  Your Platform Distribution
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={myPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {myPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Opponent Distribution Pie Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-pink-600" />
                  Opponent Platform Distribution
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={theirPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {theirPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Platform-wise Leaders with enhanced UI */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-500" />
                Platform-wise Champions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['leetcode', 'codeforces', 'codechef'].map((platform, idx) => {
                  const myScore = myStats[platform];
                  const theirScore = comparisonData[platform] || 0;
                  const winner = getWinner(myScore, theirScore);
                  const platformNames = { leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef' };
                  const platformEmojis = { leetcode: '🟡', codeforces: '🔵', codechef: '🟤' };

                  return (
                    <motion.div 
                      key={platform}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      className={`p-6 rounded-2xl border-4 relative overflow-hidden ${
                        winner === 'you' ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 text-white' :
                        winner === 'them' ? 'bg-gradient-to-br from-blue-400 to-cyan-600 border-blue-300 text-white' :
                        'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-black">
                            {platformEmojis[platform]} {platformNames[platform]}
                          </span>
                          {winner !== 'tie' && <Trophy className="w-7 h-7 text-yellow-300 animate-bounce" />}
                        </div>
                        <div className="text-4xl font-black mb-2">
                          {myScore} vs {theirScore}
                        </div>
                        <div className={`text-lg font-bold px-4 py-2 rounded-xl inline-block ${
                          winner === 'you' ? 'bg-white/30 backdrop-blur-sm' :
                          winner === 'them' ? 'bg-white/30 backdrop-blur-sm' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {winner === 'you' ? '👑 You Dominate!' : winner === 'them' ? '⚡ They Lead!' : '🤝 Even Match!'}
                        </div>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No comparison yet - Enhanced empty state */}
      {!comparisonData && !loadingComparison && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Users className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Benchmark?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Enter your competitor's profile handles above and discover how you stack up against them!
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Platform Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Streak Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Visual Charts</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
