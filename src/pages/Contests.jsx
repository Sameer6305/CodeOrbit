import { useState, useEffect } from "react";
import { Calendar, Clock, ExternalLink, Loader, RefreshCw, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/contests");
      
      if (!response.ok) {
        throw new Error("Failed to fetch contests");
      }

      const data = await response.json();
      
      // Group contests by platform and show next upcoming for each
      const contestsByPlatform = {};
      (data.contests || []).forEach(contest => {
        if (!contestsByPlatform[contest.platform]) {
          contestsByPlatform[contest.platform] = [];
        }
        contestsByPlatform[contest.platform].push(contest);
      });
      
      // Get the next 3 contests from each platform
      const selectedContests = [];
      Object.values(contestsByPlatform).forEach(platformContests => {
        selectedContests.push(...platformContests.slice(0, 3));
      });
      
      // Sort by start time
      selectedContests.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      
      setContests(selectedContests);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function getTimeRemaining(timeString) {
    const startTime = new Date(timeString);
    const now = new Date();
    const diffMs = startTime - now;
    
    if (diffMs < 0) {
      return "Started";
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `Starts in ${days}d ${hours}h`;
    } else if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`;
    } else {
      return `Starts in ${minutes}m`;
    }
  }

  function formatStartTime(timeString) {
    const date = new Date(timeString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
    
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    let relativeTime = "";
    if (diffDays === 0) relativeTime = "Today";
    else if (diffDays === 1) relativeTime = "Tomorrow";
    else if (diffDays > 1 && diffDays <= 7) relativeTime = `In ${diffDays} days`;
    
    return { dateStr, timeStr, relativeTime };
  }

  function getPlatformColor(platform) {
    const colors = {
      Codeforces: "bg-blue-500",
      LeetCode: "bg-yellow-500",
      CodeChef: "bg-amber-700",
      AtCoder: "bg-gray-600",
      HackerRank: "bg-green-600",
    };
    return colors[platform] || "bg-gray-500";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Upcoming Contests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Never miss a contest across all platforms.
          </p>
        </div>
        <button
          onClick={fetchContests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchContests}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No upcoming contests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new contests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest, index) => {
            const timeInfo = formatStartTime(contest.start_time);
            const timeRemaining = getTimeRemaining(contest.start_time);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`${getPlatformColor(contest.platform)} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                      >
                        {contest.platform}
                      </span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                        ⏰ {timeRemaining}
                      </span>
                      {timeInfo.relativeTime && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                          {timeInfo.relativeTime}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {contest.name}
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{timeInfo.dateStr} at {timeInfo.timeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(contest.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex-shrink-0"
                  >
                    Register
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
