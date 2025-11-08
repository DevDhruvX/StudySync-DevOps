import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: {
    name: string;
    description: string;
    color: string;
  };
  colors: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: { name?: string; description?: string; color?: string }) => void;
}

export const SubjectModal = ({
  isOpen,
  isEditMode,
  formData,
  colors,
  onClose,
  onSubmit,
  onFormChange
}: SubjectModalProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Subject' : 'Create New Subject'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-purple-300" />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                placeholder="e.g., Advanced Mathematics"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="Describe what this subject covers..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-purple-200 mb-3">
                Choose Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFormChange({ color })}
                    className={`w-12 h-12 rounded-xl shadow-lg transition-all duration-200 ${
                      formData.color === color 
                        ? 'ring-4 ring-white/50 scale-110' 
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-purple-200 font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Cancel
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
              >
                {isEditMode ? 'Update' : 'Create'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};