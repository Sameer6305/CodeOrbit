import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useStatsStore } from "../store/stats";

export default function PlatformRadarChart({ data }) {
  const { getPlatformComparison, loading } = useStatsStore();
  
  // Get platform comparison from store or use provided data
  const platformStats = data || getPlatformComparison();
  
  // Ensure we have data for all platforms
  const radarData = [
    { platform: "LeetCode", solved: 0, fullMark: 200 },
    { platform: "Codeforces", solved: 0, fullMark: 200 },
    { platform: "CodeChef", solved: 0, fullMark: 200 },
  ];
  
  // Merge with actual stats
  platformStats.forEach(stat => {
    const index = radarData.findIndex(r => r.platform === stat.platform);
    if (index !== -1) {
      radarData[index].solved = stat.solved;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Platform Comparison
      </h2>

      {loading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="platform"
              stroke="#6b7280"
              style={{ fontSize: "12px", fill: "#9ca3af" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "dataMax"]}
              stroke="#6b7280"
              style={{ fontSize: "10px" }}
            />
            <Radar
              name="Problems Solved"
              dataKey="solved"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "14px",
                paddingTop: "10px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
