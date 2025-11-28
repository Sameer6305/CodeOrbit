import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, TrendingUp, Target, Award, Code2, ExternalLink, Loader, AlertCircle, CheckCircle } from "lucide-react";
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
  ResponsiveContainer 
} from "recharts";

export default function Benchmark() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { getPlatformBreakdown, getPlatformStreak, loading } = useStatsStore();

  const [compareHandles, setCompareHandles] = useState({
    codeforces: "",
    leetcode: "",
    codechef: ""
  });

  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user]);

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

      const response = await fetch(`/api/compare?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch comparison data');

      const data = await response.json();
      setComparisonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingComparison(false);
    }
  };

  const getWinner = (myValue, theirValue) => {
    if (myValue > theirValue) return "you";
    if (theirValue > myValue) return "them";
    return "tie";
  };

  // Prepare radar chart data
  const radarData = comparisonData ? [
    {
      platform: 'LeetCode',
      You: myStats.leetcode,
      Them: comparisonData.leetcode || 0
    },
    {
      platform: 'Codeforces',
      You: myStats.codeforces,
      Them: comparisonData.codeforces || 0
    },
    {
      platform: 'CodeChef',
      You: myStats.codechef,
      Them: comparisonData.codechef || 0
    }
  ] : [];

  // Prepare streak comparison data
  const streakData = comparisonData ? [
    {
      name: 'LeetCode',
      You: myStreaks.leetcode.current,
      Them: comparisonData.streaks?.leetcode || 0
    },
    {
      name: 'Codeforces',
      You: myStreaks.codeforces.current,
      Them: comparisonData.streaks?.codeforces || 0
    },
    {
      name: 'CodeChef',
      You: myStreaks.codechef.current,
      Them: comparisonData.streaks?.codechef || 0
    }
  ] : [];

  const totalMy = myStats.leetcode + myStats.codeforces + myStats.codechef;
  const totalThem = comparisonData ? 
    (comparisonData.leetcode || 0) + (comparisonData.codeforces || 0) + (comparisonData.codechef || 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Benchmark & Compare
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Compare your performance with other coders across platforms
        </p>
      </div>

      {/* Profile Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Platform Profiles to Compare
          </h2>
        </div>

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

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
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
              Compare Performance
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
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl shadow-lg p-6 ${
                getWinner(totalMy, totalThem) === "you" 
                  ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-500" 
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">You</h3>
                {getWinner(totalMy, totalThem) === "you" && (
                  <Trophy className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Solved:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalMy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🟡 LeetCode:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{myStats.leetcode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🔵 Codeforces:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{myStats.codeforces}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🟤 CodeChef:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{myStats.codechef}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border-2 border-purple-300 dark:border-purple-700"
            >
              <div className="text-center">
                <Award className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Comparison
                </h3>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {totalMy > totalThem ? "+" : ""}{totalMy - totalThem}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {totalMy > totalThem ? "You're ahead!" : totalMy < totalThem ? "Keep pushing!" : "Equal performance!"}
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl shadow-lg p-6 ${
                getWinner(totalMy, totalThem) === "them" 
                  ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-500" 
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Opponent</h3>
                {getWinner(totalMy, totalThem) === "them" && (
                  <Trophy className="w-6 h-6 text-yellow-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Solved:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{totalThem}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🟡 LeetCode:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{comparisonData.leetcode || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🔵 Codeforces:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{comparisonData.codeforces || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">🟤 CodeChef:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{comparisonData.codechef || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Platform Performance Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="platform" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Them" dataKey="Them" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Streak Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Current Streak Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                  <Bar dataKey="You" fill="#3b82f6" />
                  <Bar dataKey="Them" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Winners */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Platform-wise Leaders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['leetcode', 'codeforces', 'codechef'].map((platform) => {
                const myScore = myStats[platform];
                const theirScore = comparisonData[platform] || 0;
                const winner = getWinner(myScore, theirScore);
                const platformNames = { leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef' };
                const platformEmojis = { leetcode: '🟡', codeforces: '🔵', codechef: '🟤' };

                return (
                  <div key={platform} className={`p-4 rounded-lg border-2 ${
                    winner === 'you' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                    winner === 'them' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                    'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {platformEmojis[platform]} {platformNames[platform]}
                      </span>
                      {winner !== 'tie' && <Trophy className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {myScore} vs {theirScore}
                    </div>
                    <div className={`text-sm font-medium ${
                      winner === 'you' ? 'text-green-600 dark:text-green-400' :
                      winner === 'them' ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {winner === 'you' ? '🏆 You lead!' : winner === 'them' ? '💪 They lead!' : '🤝 Tied!'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* No comparison yet */}
      {!comparisonData && !loadingComparison && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Comparison
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter profile handles above and click "Compare Performance" to see detailed analytics
          </p>
        </div>
      )}
    </div>
  );
}
