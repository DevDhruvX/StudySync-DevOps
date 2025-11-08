import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Search,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Target,
  LogOut,
  Settings,
  RefreshCw
} from 'lucide-react';
import { subjectApi, sharingApi, type Subject } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { StatCard, SubjectCard, SubjectModal, ShareModal, AnalyticsDashboard } from '../components/ui';

const StudySyncDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [autoRefresh] = useState(true);
  
  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingSubject, setSharingSubject] = useState<Subject | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366F1'
  });

  const colors = [
    '#6366F1', '#EC4899', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16',
    '#F97316', '#3B82F6', '#8B5A2B', '#14B8A6',
    '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Auto-refresh subjects every 30 seconds when enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSubjects();
        setLastRefresh(Date.now());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectApi.getAll();
      if (response.success && response.data) {
        setSubjects(response.data);
        toast.success('Subjects loaded successfully!');
      } else {
        toast.error('Failed to load subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      if (isEditMode && editingSubject) {
        const response = await subjectApi.update(editingSubject._id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          userId: 'default-user'
        });
        if (response.success) {
          toast.success('Subject updated successfully!');
          await fetchSubjects();
        } else {
          toast.error('Failed to update subject');
        }
      } else {
        const response = await subjectApi.create({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          userId: 'default-user'
        });
        if (response.success) {
          toast.success('Subject created successfully!');
          await fetchSubjects();
        } else {
          toast.error('Failed to create subject');
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await subjectApi.delete(id);
      if (response.success) {
        toast.success('Subject deleted successfully!');
        await fetchSubjects();
      } else {
        toast.error('Failed to delete subject');
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    navigate(`/notes/${subject._id}`);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      color: subject.color || '#6366F1'
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingSubject(null);
    setFormData({ name: '', description: '', color: '#6366F1' });
  };

  const handleShare = (subject: Subject) => {
    setSharingSubject(subject);
    setIsShareModalOpen(true);
  };

  const handleShareSubject = async (shareSettings: {
    allowComments: boolean;
    allowDownload: boolean;
    expiresAt?: string;
  }) => {
    if (!sharingSubject) return null;
    
    try {
      const response = await sharingApi.shareSubject(sharingSubject._id, shareSettings);
      if (response.success && response.data) {
        toast.success('Subject shared successfully!');
        return response.data.shareUrl;
      } else {
        toast.error('Failed to share subject');
        return null;
      }
    } catch (error) {
      console.error('Error sharing subject:', error);
      toast.error('Failed to share subject');
      return null;
    }
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSharingSubject(null);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subject.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate progress (mock calculation for now)
  const calculateProgress = () => {
    return Math.floor(Math.random() * 100); // Replace with real progress calculation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Loading StudySync</h2>
            <p className="text-purple-300">Preparing your workspace...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
        }}
      />

      {/* User Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">StudySync</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-white/60 text-sm">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => navigate('/profile')}
                  title="Profile Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 sm:space-x-4"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  StudySync
                </h1>
                <p className="text-purple-300 text-xs sm:text-sm mt-1 hidden sm:block">
                  Your AI-powered learning companion
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fetchSubjects();
                  setLastRefresh(Date.now());
                  toast.success('Dashboard refreshed');
                }}
                className="px-2 sm:px-4 py-2 sm:py-3 bg-white/10 text-white rounded-xl font-semibold flex items-center space-x-1 sm:space-x-2 hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className="px-2 sm:px-4 py-2 sm:py-3 bg-white/10 text-white rounded-xl font-semibold flex items-center space-x-1 sm:space-x-2 hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                title="Global Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Search All</span>
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold flex items-center space-x-1 sm:space-x-2 transition-all duration-300 text-sm sm:text-base ${
                  showAnalytics 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{showAnalytics ? 'Show Subjects' : 'Analytics'}</span>
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold flex items-center space-x-1 sm:space-x-2 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Subject</span>
              </motion.button>

              {/* User Profile Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-white/20"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                  title="Go to Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-500/50"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-500/50">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {user?.name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-white font-medium text-sm">{user?.name}</div>
                    <div className="text-white/60 text-xs">{user?.email}</div>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { icon: Target, label: 'Total Subjects', value: subjects.length, color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'Avg Progress', value: subjects.length > 0 ? Math.round(subjects.reduce((acc) => acc + calculateProgress(), 0) / subjects.length) + '%' : '0%', color: 'from-blue-500 to-cyan-500' },
            { icon: Clock, label: 'Last Updated', value: new Date(lastRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'from-green-500 to-emerald-500' },
            { icon: Star, label: autoRefresh ? 'Auto Refresh ON' : 'Manual Mode', value: '7 days', color: 'from-orange-500 to-yellow-500' },
          ].map((stat, i) => (
            <StatCard
              key={i}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              index={i}
            />
          ))}
        </motion.div>

        {showAnalytics ? (
          /* Analytics Dashboard */
          user && <AnalyticsDashboard user={user} subjects={subjects} />
        ) : (
          <>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subjects..."
                  className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-purple-300" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Subjects Grid */}
            {filteredSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-16 max-w-md mx-auto shadow-2xl">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <BookOpen className="w-24 h-24 text-purple-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {searchQuery ? 'No subjects found' : 'Start Your Journey'}
                  </h3>
                  <p className="text-purple-200 mb-8 text-lg">
                    {searchQuery 
                      ? 'Try adjusting your search' 
                      : 'Create your first subject and begin learning'
                    }
                  </p>
                  {!searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsModalOpen(true)}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
                    >
                      Create First Subject
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredSubjects.map((subject, index) => {
                  const progress = calculateProgress();
                  return (
                    <SubjectCard
                      key={subject._id}
                      subject={subject}
                      index={index}
                      progress={progress}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onShare={handleShare}
                      onClick={handleSubjectClick}
                    />
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        <SubjectModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          formData={formData}
          colors={colors}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onFormChange={(data) => setFormData({ ...formData, ...data })}
        />
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        title={sharingSubject?.name || ''}
        type="subject"
        onShare={handleShareSubject}
      />
    </div>
  );
};

export { StudySyncDashboard as Dashboard };
export default StudySyncDashboard;