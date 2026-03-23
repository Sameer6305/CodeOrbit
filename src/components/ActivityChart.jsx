import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { useStatsStore } from "../store/stats";
import { useProfileStore } from "../store/profile";
import { useAuthStore } from "../store/auth";
import { TrendingUp, Calendar, BarChart3, Activity } from "lucide-react";

export default function ActivityChart({ data }) {
  const { dailyStats, loading } = useStatsStore();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState("12months"); // 12months, 6months, all
  const [chartType, setChartType] = useState("line"); // line, area
  const [submissionData, setSubmissionData] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  
  // Fetch submission calendar data from all platforms
  useEffect(() => {
    async function fetchSubmissionCalendar() {
      if (!profile || !user) return;
      
      setLoadingCalendar(true);
      try {
        const params = new URLSearchParams();
        if (user.id) params.append('user_id', user.id);
        if (profile.leetcode_username) params.append('lc_username', profile.leetcode_username);
        if (profile.codeforces_handle) params.append('cf_handle', profile.codeforces_handle);
        if (profile.codechef_handle) params.append('cc_username', profile.codechef_handle);
        
        if (params.toString()) {
          const response = await fetch(`/api/submission-calendar?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            console.log('📊 Submission calendar data:', data);
            setSubmissionData(data);
          } else {
            console.error('Failed to fetch submission calendar:', response.status);
            // Fall back to using dailyStats
            setSubmissionData(null);
          }
        }
      } catch (error) {
        console.error('Error fetching submission calendar:', error);
        // Fall back to using dailyStats
        setSubmissionData(null);
      } finally {
        setLoadingCalendar(false);
      }
    }
    
    fetchSubmissionCalendar();
  }, [profile, user]);

  function toSafeCount(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }
  
  // Generate chart data based on selected time range using submission calendar
  function generateChartData() {
    // If submission calendar data is available, use it
    if (submissionData && (
      Object.keys(submissionData.leetcode || {}).length > 0 ||
      Object.keys(submissionData.codeforces || {}).length > 0 ||
      Object.keys(submissionData.codechef || {}).length > 0
    )) {
      return generateChartDataFromSubmissions();
    }
    
    // Fallback: use dailyStats
    if (dailyStats && dailyStats.length > 0) {
      return generateChartDataFromDailyStats();
    }
    
    return [];
  }
  
  // Generate chart data from submission calendar
  function generateChartDataFromSubmissions() {
    if (!submissionData) return [];
    
    console.log('📊 Generating activity chart from submissions:', {
      leetcode_dates: Object.keys(submissionData.leetcode || {}).length,
      codeforces_dates: Object.keys(submissionData.codeforces || {}).length,
      codechef_dates: Object.keys(submissionData.codechef || {}).length
    });
    
    const today = new Date();
    let startDate;
    
    // Determine start date based on time range
    switch (timeRange) {
      case "6months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        break;
      case "12months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        break;
      case "all":
        // Find the earliest date across all platforms
        const allDates = [
          ...Object.keys(submissionData.leetcode || {}),
          ...Object.keys(submissionData.codeforces || {}),
          ...Object.keys(submissionData.codechef || {})
        ].map(d => new Date(d));
        
        if (allDates.length === 0) return [];
        
        startDate = new Date(Math.min(...allDates));
        // Round to start of month
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    }
    
    // Group submissions by month
    const monthMap = {};
    
    // Process LeetCode data
    Object.entries(submissionData.leetcode || {}).forEach(([date, count]) => {
      const d = new Date(date);
      if (d >= startDate) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { leetcode: 0, codeforces: 0, codechef: 0 };
        }
        monthMap[monthKey].leetcode += toSafeCount(count);
      }
    });
    
    // Process Codeforces data
    Object.entries(submissionData.codeforces || {}).forEach(([date, count]) => {
      const d = new Date(date);
      if (d >= startDate) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { leetcode: 0, codeforces: 0, codechef: 0 };
        }
        monthMap[monthKey].codeforces += toSafeCount(count);
      }
    });
    
    // Process CodeChef data
    Object.entries(submissionData.codechef || {}).forEach(([date, count]) => {
      const d = new Date(date);
      if (d >= startDate) {
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { leetcode: 0, codeforces: 0, codechef: 0 };
        }
        monthMap[monthKey].codechef += toSafeCount(count);
      }
    });
    
    console.log('📊 Monthly data merged from all platforms:', monthMap);
    
    // Generate data for each month
    const months = [];
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let iterDate = new Date(startDate);
    
    while (iterDate <= currentMonth) {
      const monthKey = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
      const monthData = monthMap[monthKey] || { leetcode: 0, codeforces: 0, codechef: 0 };
      
      months.push({
        month: iterDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        fullDate: new Date(iterDate),
        LeetCode: toSafeCount(monthData.leetcode),
        Codeforces: toSafeCount(monthData.codeforces),
        CodeChef: toSafeCount(monthData.codechef),
      });
      
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    
    return months;
  }
  
  // Fallback: Generate chart data from dailyStats
  function generateChartDataFromDailyStats() {
    if (!dailyStats || dailyStats.length === 0) return [];
    
    const today = new Date();
    let startDate;
    
    // Determine start date based on time range
    switch (timeRange) {
      case "6months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        break;
      case "12months":
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        break;
      case "all":
        const dates = dailyStats.map(s => new Date(s.date));
        startDate = new Date(Math.min(...dates));
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    }
    
    const startDateStr = startDate.toISOString().split("T")[0];
    const recentStats = dailyStats.filter((s) => s.date >= startDateStr);
    
    // Group by month and platform, track changes (not cumulative)
    const monthMap = {};
    const platformData = {};
    
    // Group by platform first
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
    
    // Calculate daily changes for each platform and group by month
    Object.keys(platformData).forEach((platform) => {
      const stats = platformData[platform];
      let prevCount = 0;
      
      stats.forEach((stat, index) => {
        const change = index === 0 ? stat.solved_count : stat.solved_count - prevCount;
        if (change > 0) {
          const date = new Date(stat.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthMap[monthKey]) {
            monthMap[monthKey] = { leetcode: 0, codeforces: 0, codechef: 0 };
          }
          
          monthMap[monthKey][platform] = (monthMap[monthKey][platform] || 0) + change;
        }
        prevCount = stat.solved_count;
      });
    });
    
    // Generate data for each month
    const months = [];
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let iterDate = new Date(startDate);
    
    while (iterDate <= currentMonth) {
      const monthKey = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
      const monthData = monthMap[monthKey] || { leetcode: 0, codeforces: 0, codechef: 0 };
      
      months.push({
        month: iterDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        fullDate: new Date(iterDate),
        LeetCode: monthData.leetcode || 0,
        Codeforces: monthData.codeforces || 0,
        CodeChef: monthData.codechef || 0,
      });
      
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    
    return months;
  }

  const chartData = generateChartData();
  
  // Calculate statistics
  const totalSubmissions = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.LeetCode + d.Codeforces + d.CodeChef, 0)
    : 0;
  
  const avgPerMonth = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.LeetCode + d.Codeforces + d.CodeChef, 0) / chartData.length)
    : 0;
  
  const peakMonth = chartData.length > 0
    ? chartData.reduce((max, d) => {
        const total = d.LeetCode + d.Codeforces + d.CodeChef;
        return total > (max.LeetCode + max.Codeforces + max.CodeChef) ? d : max;
      }, chartData[0])
    : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-gray-900 dark:bg-gray-800 border-2 border-gray-700 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-300 text-sm">{entry.name}:</span>
              </span>
              <span className="text-white font-bold">{entry.value} submissions</span>
            </div>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total:</span>
              <span className="text-white font-bold">{total} submissions</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Submission History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total submissions across all platforms over time
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              <span>Peak Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {peakMonth ? peakMonth.month : "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {peakMonth ? `${peakMonth.LeetCode + peakMonth.Codeforces + peakMonth.CodeChef} submissions` : ""}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <BarChart3 className="w-3 h-3" />
              <span>Avg/Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgPerMonth}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              submissions/month
            </div>
          </div>

          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Activity className="w-3 h-3" />
              <span>Total Months</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {chartData.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              active period
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("6months")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "6months"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange("12months")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "12months"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "all"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              All Time
            </button>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setChartType("line")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                chartType === "line"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              📈 Line
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                chartType === "area"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              📊 Area
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading || loadingCalendar ? (
        <div className="h-[400px] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading submission data...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center">
          <Activity className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No submission data yet</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start solving problems to see your progress!</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeetCode" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA116" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFA116" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCodeforces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCodeChef" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B4513" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B4513" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: "12px", fontWeight: 600 }}
                    label={{ value: 'Submissions', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px", fontWeight: 600 }} 
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="LeetCode"
                    stroke="#FFA116"
                    strokeWidth={3}
                    dot={{ fill: "#FFA116", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="🟡 LeetCode"
                  />
                  <Line
                    type="monotone"
                    dataKey="Codeforces"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="🔵 Codeforces"
                  />
                  <Line
                    type="monotone"
                    dataKey="CodeChef"
                    stroke="#8B4513"
                    strokeWidth={3}
                    dot={{ fill: "#8B4513", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name="🟤 CodeChef"
                  />
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeetCode" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA116" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFA116" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCodeforces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCodeChef" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B4513" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B4513" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: "12px", fontWeight: 600 }}
                    label={{ value: 'Submissions', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: "14px", paddingTop: "20px", fontWeight: 600 }} 
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="LeetCode"
                    stroke="#FFA116"
                    strokeWidth={2}
                    fill="url(#colorLeetCode)"
                    name="🟡 LeetCode"
                  />
                  <Area
                    type="monotone"
                    dataKey="Codeforces"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorCodeforces)"
                    name="🔵 Codeforces"
                  />
                  <Area
                    type="monotone"
                    dataKey="CodeChef"
                    stroke="#8B4513"
                    strokeWidth={2}
                    fill="url(#colorCodeChef)"
                    name="🟤 CodeChef"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Legend Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Tip: Hover over the chart to see detailed statistics for each month
        </p>
      </div>
    </motion.div>
  );
}

