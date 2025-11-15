import { useState, useEffect } from "react";
import { Calendar, Clock, ExternalLink, Loader, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { getContestsUrl } from "../utils/platformHelpers";

export default function ContestWidget() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contests");
      
      if (!response.ok) {
        throw new Error("Failed to fetch contests");
      }

      const data = await response.json();
      // Take only upcoming 5 contests
      setContests(data.contests?.slice(0, 5) || getSampleContests());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setContests(getSampleContests());
      setLoading(false);
    }
  };

  function getSampleContests() {
    return [
      {
        name: "Codeforces Round #912",
        platform: "Codeforces",
        start_time: "2024-01-20T20:00:00",
        duration: 7200,
        url: "https://codeforces.com",
      },
      {
        name: "Weekly Contest 375",
        platform: "LeetCode",
        start_time: "2024-01-21T08:00:00",
        duration: 5400,
        url: "https://leetcode.com",
      },
      {
        name: "Starters 115",
        platform: "CodeChef",
        start_time: "2024-01-22T20:00:00",
        duration: 10800,
        url: "https://codechef.com",
      },
    ];
  }

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function formatStartTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Upcoming Contests
        </h2>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2 text-xs">
            <a
              href={getContestsUrl('codeforces')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              CF <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-400">·</span>
            <a
              href={getContestsUrl('leetcode')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              LC <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-400">·</span>
            <a
              href={getContestsUrl('codechef')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              CC <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={fetchContests}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            Showing sample data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contests.map((contest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`${getPlatformColor(
                        contest.platform
                      )} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                    >
                      {contest.platform}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {contest.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatStartTime(contest.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(contest.duration)}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition flex-shrink-0"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
