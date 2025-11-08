import { motion } from 'framer-motion';
import { Zap, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  index: number;
}

export const StatCard = ({ icon: Icon, label, value, color, index }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <Zap className="w-5 h-5 text-yellow-400" />
      </div>
      <h3 className="text-white/60 text-sm font-medium mb-1">{label}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
};