import { Calendar, Clock, ExternalLink } from "lucide-react";

export default function Contests() {
  const upcomingContests = [
    {
      id: 1,
      name: "Codeforces Round #912",
      platform: "Codeforces",
      startTime: "2024-01-15 20:00",
      duration: "2 hours",
      url: "https://codeforces.com",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Weekly Contest 375",
      platform: "LeetCode",
      startTime: "2024-01-14 08:00",
      duration: "1.5 hours",
      url: "https://leetcode.com",
      color: "bg-yellow-500",
    },
    {
      id: 3,
      name: "Starters 115",
      platform: "CodeChef",
      startTime: "2024-01-17 20:00",
      duration: "3 hours",
      url: "https://codechef.com",
      color: "bg-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upcoming Contests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Never miss a contest across all platforms.
        </p>
      </div>

      <div className="space-y-4">
        {upcomingContests.map((contest) => (
          <div
            key={contest.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`${contest.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                  >
                    {contest.platform}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {contest.name}
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{contest.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{contest.duration}</span>
                  </div>
                </div>
              </div>

              <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                View
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {upcomingContests.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No upcoming contests
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new contests
          </p>
        </div>
      )}
    </div>
  );
}
