import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";
import { useStatsStore } from "../store/stats";

export default function HeatmapChart({ data }) {
  const { dailyStats, loading } = useStatsStore();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  // Transform daily stats to heatmap format
  function generateHeatmapData() {
    const values = [];
    const today = new Date();
    
    // Generate last 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      // Sum all platforms for this date
      const dayStats = dailyStats.filter(s => s.date === dateStr);
      const count = dayStats.reduce((sum, s) => sum + s.solved_count, 0);
      
      values.push({
        date: dateStr,
        count: count,
      });
    }
    return values;
  }

  const heatmapData = data || generateHeatmapData();

  function getColor(count) {
    if (count === 0) return "color-empty";
    if (count < 3) return "color-scale-1";
    if (count < 6) return "color-scale-2";
    if (count < 9) return "color-scale-3";
    return "color-scale-4";
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Contribution Heatmap
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your activity over the past year across all platforms
        </p>
      </div>
      
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={heatmapData}
          classForValue={(value) => {
            if (!value) return "color-empty";
            return getColor(value.count);
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) return {};
            return {
              "data-tooltip-id": "heatmap-tooltip",
              "data-tooltip-content": `${value.date}: ${value.count || 0} problems`,
            };
          }}
          showWeekdayLabels
        />
        </div>
      )}

      <Tooltip id="heatmap-tooltip" />

      <style>{`
        .react-calendar-heatmap {
          width: 100%;
        }
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        .dark .react-calendar-heatmap .color-empty {
          fill: #374151;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #9be9a8;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #40c463;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #30a14e;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #216e39;
        }
        .react-calendar-heatmap text {
          fill: #6b7280;
          font-size: 10px;
        }
        .dark .react-calendar-heatmap text {
          fill: #9ca3af;
        }
      `}</style>
    </div>
  );
}
