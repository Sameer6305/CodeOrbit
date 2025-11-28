import { motion } from "framer-motion";

export default function StatCard({ icon, title, value, change, bgColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-2xl opacity-50"></div>
      
      <div className="relative z-10">
        <motion.div 
          className={`w-16 h-16 ${bgColor} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1, transition: { duration: 0.5 } }}
        >
          {icon}
        </motion.div>
        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        <motion.p 
          className="text-3xl font-black text-gray-900 dark:text-white mt-2"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2, type: "spring" }}
        >
          {value}
        </motion.p>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
          {change}
        </div>
      </div>
    </motion.div>
  );
}
