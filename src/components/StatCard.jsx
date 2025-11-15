import { motion } from "framer-motion";

export default function StatCard({ icon, title, value, change, bgColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -5, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
    >
      <motion.div 
        className={`w-16 h-16 ${bgColor} rounded-lg flex items-center justify-center mb-4`}
        whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
      >
        {icon}
      </motion.div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <motion.p 
        className="text-2xl font-bold text-gray-900 dark:text-white mt-2"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
      >
        {value}
      </motion.p>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {change}
      </div>
    </motion.div>
  );
}
