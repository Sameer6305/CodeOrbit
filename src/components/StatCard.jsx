import { motion } from "framer-motion";

export default function StatCard({ icon, title, value, change, bgColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer"
    >
      <div className={`w-16 h-16 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
        {value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{change}</p>
    </motion.div>
  );
}
