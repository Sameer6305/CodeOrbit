import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStatsStore } from "../store/stats";

export default function ActivityChart({ data }) {
  const { dailyStats, loading } = useStatsStore();
  
  // Generate monthly data for the whole year with separate lines for each platform
  function generateChartData() {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Get start date (12 months ago)
    const startDate = new Date(currentYear, today.getMonth() - 11, 1);
    
    // Filter stats for last 12 months
    const startDateStr = startDate.toISOString().split("T")[0];
    const recentStats = dailyStats.filter((s) => s.date >= startDateStr);
    
    // Group by month and platform
    const monthMap = {};
    recentStats.forEach((stat) => {
      const date = new Date(stat.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          leetcode: {},
          codeforces: {},
          codechef: {}
        };
      }
      
      // Store the latest count for each day in the month
      const dateKey = stat.date;
      monthMap[monthKey][stat.platform][dateKey] = stat.solved_count;
    });
    
    // Generate data for each month (last 12 months)
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const monthData = monthMap[monthKey];
      
      // Calculate the max count for each platform in this month
      const getMonthMax = (platformData) => {
        const counts = Object.values(platformData);
        return counts.length > 0 ? Math.max(...counts) : 0;
      };
      
      months.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        LeetCode: monthData ? getMonthMax(monthData.leetcode) : 0,
        Codeforces: monthData ? getMonthMax(monthData.codeforces) : 0,
        CodeChef: monthData ? getMonthMax(monthData.codechef) : 0,
      });
    }
    
    return months;
  }

  const chartData = generateChartData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          12-Month Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total problems solved per platform over the past year (LeetCode, CodeChef, Codeforces)
        </p>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            className="dark:stroke-gray-600"
          />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "20px" }} />
          <Line
            type="monotone"
            dataKey="LeetCode"
            stroke="#FFA116"
            strokeWidth={2}
            dot={{ fill: "#FFA116", r: 3 }}
            activeDot={{ r: 5 }}
            name="LeetCode"
          />
          <Line
            type="monotone"
            dataKey="Codeforces"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 3 }}
            activeDot={{ r: 5 }}
            name="Codeforces"
          />
          <Line
            type="monotone"
            dataKey="CodeChef"
            stroke="#8B4513"
            strokeWidth={2}
            dot={{ fill: "#8B4513", r: 3 }}
            activeDot={{ r: 5 }}
            name="CodeChef"
          />
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
