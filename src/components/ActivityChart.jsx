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
  
  // Calculate aggregate stats for all platforms
  const getAggregateStats = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split("T")[0];

    const recentStats = dailyStats.filter((s) => s.date >= startDateStr);
    
    // Group by date and sum across all platforms
    const dateMap = {};
    recentStats.forEach((stat) => {
      if (!dateMap[stat.date]) {
        dateMap[stat.date] = { date: stat.date, total: 0, platforms: {} };
      }
      dateMap[stat.date].platforms[stat.platform] = stat.solved_count;
    });

    // Calculate daily aggregate (sum of latest count from each platform per day)
    return Object.values(dateMap).map(day => ({
      date: day.date,
      solved: Object.values(day.platforms).reduce((sum, count) => sum + count, 0)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  const statsData = data || getAggregateStats();

  // Generate complete 30-day data with filled gaps
  function generateChartData() {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const existing = statsData.find(d => d.date === dateStr);
      days.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        problems: existing ? existing.solved : 0,
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
          Total problems solved across all platforms (LeetCode + CodeChef + Codeforces)
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
            dataKey="problems"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
            name="Problems Solved"
          />
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
