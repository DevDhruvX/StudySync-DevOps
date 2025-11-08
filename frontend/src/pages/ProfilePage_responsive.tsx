import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  BookOpen,
  FileText,
  Share2,
  Target,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await updateProfile(formData);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just use a placeholder
      // In production, you'd upload to Cloudinary or similar
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, avatar: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors self-start sm:self-auto"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-white/70 text-sm sm:text-base">Manage your account and track your study progress</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Personal Information</h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white border-0 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white border-0 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: isEditing ? 1.05 : 1 }}
                      className={`relative ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={handleAvatarClick}
                    >
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Profile"
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-purple-500/50"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-purple-500/50">
                          <span className="text-white font-bold text-lg sm:text-xl">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{user.name}</h3>
                    <p className="text-white/60 text-sm">{user.email}</p>
                    {isEditing && (
                      <p className="text-white/40 text-xs mt-1">Click avatar to change photo</p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-purple-500 text-sm sm:text-base"
                        required
                      />
                    ) : (
                      <div className="p-2 sm:p-3 bg-white/5 rounded-lg text-white text-sm sm:text-base">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email Address
                    </label>
                    <div className="p-2 sm:p-3 bg-white/5 rounded-lg text-white/70 text-sm sm:text-base">
                      {user.email}
                      <span className="text-xs text-white/50 block">Cannot be changed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-2 sm:px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-500 focus:outline-none resize-none text-sm sm:text-base"
                    />
                  ) : (
                    <div className="p-2 sm:p-3 bg-white/5 rounded-lg text-white min-h-[80px] sm:min-h-[100px] text-sm sm:text-base">
                      {user.bio || (
                        <span className="text-white/50 italic">No bio added yet</span>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-2 sm:py-3 font-medium text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </Button>
                )}
              </form>

              {/* Account Info */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium text-white mb-3 sm:mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-white/60">Member since:</span>
                      <div className="text-white">{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-white/60">Last login:</span>
                      <div className="text-white">{formatDate(user.lastLogin)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            
            {/* Usage Statistics */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-400" />
                Usage Statistics
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base">{user.stats?.totalSubjects || 0}</div>
                      <div className="text-white/60 text-xs sm:text-sm">Subjects</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base">{user.stats?.totalNotes || 0}</div>
                      <div className="text-white/60 text-xs sm:text-sm">Notes</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base">{user.stats?.totalSharedItems || 0}</div>
                      <div className="text-white/60 text-xs sm:text-sm">Shared Items</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 sm:p-2 bg-orange-500/20 rounded-lg">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm sm:text-base">{user.stats?.loginStreak || 0}</div>
                      <div className="text-white/60 text-xs sm:text-sm">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-3 sm:mb-4">Account Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Email Verified</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isVerified 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Account Type</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 capitalize">
                    {user.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Theme</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 capitalize">
                    {user.preferences?.theme || 'dark'}
                  </span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;