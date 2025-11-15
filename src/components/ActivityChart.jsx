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
  const { getRecentStats, loading } = useStatsStore();
  
  // Use provided data or fetch from store
  const statsData = data || getRecentStats(30);

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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        30-Day Activity
      </h2>

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
