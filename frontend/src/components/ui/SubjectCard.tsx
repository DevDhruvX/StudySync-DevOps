import { motion } from 'framer-motion';
import { Edit3, Trash2, Share2 } from 'lucide-react';
import type { Subject } from '../../services/api';

interface SubjectCardProps {
  subject: Subject;
  index: number;
  progress: number;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onShare: (subject: Subject) => void;
  onClick: (subject: Subject) => void;
}

export const SubjectCard = ({ subject, index, progress, onEdit, onDelete, onShare, onClick }: SubjectCardProps) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick(subject);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleCardClick}
      className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <div className="p-6 space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)`
              }}
            >
              {subject.name.charAt(0).toUpperCase()}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {subject.name}
              </h3>
              <p className="text-purple-300 text-sm">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onShare(subject)}
              className="p-2 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30 backdrop-blur-xl border border-green-500/30 shadow-lg"
              title="Share Subject"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(subject)}
              className="p-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 backdrop-blur-xl border border-blue-500/30 shadow-lg"
              title="Edit Subject"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(subject._id)}
              className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 backdrop-blur-xl border border-red-500/30 shadow-lg"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Description */}
        {subject.description && (
          <p className="text-purple-200 text-sm leading-relaxed line-clamp-2">
            {subject.description}
          </p>
        )}
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-300">Progress</span>
            <span className="text-white font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)`
              }}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
          <span className="text-purple-300">
            {subject.notesCount || 0} notes
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300">Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};