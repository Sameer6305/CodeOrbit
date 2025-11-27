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
  
  // Generate complete 30-day data with separate lines for each platform
  function generateChartData() {
    const days = [];
    const today = new Date();
    
    // Get last 30 days
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split("T")[0];
    
    // Filter stats for last 30 days
    const recentStats = dailyStats.filter((s) => s.date >= startDateStr);
    
    // Group by date and platform
    const dateMap = {};
    recentStats.forEach((stat) => {
      if (!dateMap[stat.date]) {
        dateMap[stat.date] = {
          leetcode: 0,
          codeforces: 0,
          codechef: 0
        };
      }
      dateMap[stat.date][stat.platform] = stat.solved_count;
    });
    
    // Generate data for each day
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const platformData = dateMap[dateStr] || {
        leetcode: 0,
        codeforces: 0,
        codechef: 0
      };
      
      days.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        LeetCode: platformData.leetcode,
        Codeforces: platformData.codeforces,
        CodeChef: platformData.codechef,
      });
    }
    
    return days;
  }

  const chartData = generateChartData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          30-Day Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total problems solved per platform (LeetCode, CodeChef, Codeforces)
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
            dataKey="date"
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
