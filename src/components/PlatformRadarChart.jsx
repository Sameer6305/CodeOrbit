import { motion } from "framer-motion";
import { useStatsStore } from "../store/stats";

export default function PlatformRadarChart({ data }) {
  const { getPlatformComparison, loading } = useStatsStore();
  
  // Get platform comparison from store or use provided data
  const platformStats = data || getPlatformComparison();
  
  // Find max value for scaling
  const maxValue = Math.max(...platformStats.map(p => p.solved), 1);
  
  // Platform colors
  const platformColors = {
    'LeetCode': { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-600' },
    'Codeforces': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
    'CodeChef': { bg: 'bg-amber-700', border: 'border-amber-700', text: 'text-amber-700' }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Platform Comparison
      </h2>

      {loading ? (
        <div className="h-[350px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {platformStats.map((platform, index) => {
            const percentage = maxValue > 0 ? (platform.solved / maxValue) * 100 : 0;
            const colors = platformColors[platform.platform] || platformColors['LeetCode'];
            
            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {platform.platform}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${colors.text} dark:text-gray-300`}>
                    {platform.solved}
                  </span>
                </div>
                
                {/* Heatmap-style bar */}
                <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <motion.div
                    className={`h-full ${colors.bg} opacity-80 flex items-center justify-end pr-4`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
                  >
                    {percentage > 20 && (
                      <span className="text-white font-bold text-sm">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </motion.div>
                  {percentage <= 20 && percentage > 0 && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 ${colors.text} font-bold text-sm`}>
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
                
                {/* Grid pattern overlay for heatmap effect */}
                <div className="mt-2 grid grid-cols-10 gap-1">
                  {[...Array(10)].map((_, i) => {
                    const cellActive = (i + 1) * 10 <= percentage;
                    return (
                      <motion.div
                        key={i}
                        className={`h-2 rounded-sm ${
                          cellActive 
                            ? `${colors.bg} opacity-60` 
                            : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.1 + i * 0.05 + 0.5 
                        }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
          
          {platformStats.every(p => p.solved === 0) && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-lg">No data yet</p>
              <p className="text-sm mt-2">Sync your platforms to see comparison</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
