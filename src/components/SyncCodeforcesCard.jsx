import { useState } from "react";
import { CheckCircle, Loader, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SyncCodeforcesCard({ handle, userId, onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [solvedData, setSolvedData] = useState(null);

  const handleSync = async () => {
    if (!handle || !userId) {
      setError("Handle and User ID are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `/api/codeforces?handle=${handle}&user_id=${userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync Codeforces data");
      }

      setSolvedData(data.solved);
      setSuccess(true);
      setLoading(false);

      // Call parent callback to refresh dashboard
      if (onSyncComplete) {
        onSyncComplete(data);
      }

      // Reset success state after animation
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-blue-100 dark:border-blue-900/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg
              className="w-7 h-7 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9C6 9.828 5.328 10.5 4.5 10.5C3.672 10.5 3 9.828 3 9C3 8.172 3.672 7.5 4.5 7.5M9 9.75H21V8.25H9M4.5 13.5C5.328 13.5 6 14.172 6 15C6 15.828 5.328 16.5 4.5 16.5C3.672 16.5 3 15.828 3 15C3 14.172 3.672 13.5 4.5 13.5M9 15.75H21V14.25H9V15.75Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Codeforces
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {handle ? `@${handle}` : "Not connected"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={loading || !handle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            loading
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              : success
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Syncing...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Synced!
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solved Stats */}
      {solvedData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total Problems Synced
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {Object.values(solvedData).reduce((sum, count) => sum + count, 0)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {Object.entries(solvedData)
              .slice(0, 4)
              .map(([date, count]) => (
                <div
                  key={date}
                  className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {date}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {count}
                  </p>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              </motion.div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Sync Complete!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Data updated successfully
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
