// models/User.js - User Data Model for Authentication

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure for storing users in MongoDB
 * Handles authentication, profile data, and user preferences
 */
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Email for login (unique)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  // Hashed password
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  
  // Profile image URL
  avatar: {
    type: String,
    default: ''
  },
  
  // User bio/description
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  // User role (for future admin features)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Account verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Password reset token
  resetPasswordToken: {
    type: String,
    select: false
  },
  
  // Password reset token expiry
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  
  // Email verification token
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
      },
      allowDataSharing: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // User statistics (for analytics)
  stats: {
    totalSubjects: {
      type: Number,
      default: 0
    },
    totalNotes: {
      type: Number,
      default: 0
    },
    totalSharedItems: {
      type: Number,
      default: 0
    },
    loginStreak: {
      type: Number,
      default: 0
    },
    lastLoginDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password reset token
userSchema.methods.generateResetToken = function() {
  // Generate token
  const resetToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  // Generate token
  const verificationToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = require('crypto')
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  return verificationToken;
};

// Static method to get user stats
userSchema.statics.getUserStats = async function(userId) {
  const Subject = require('./Subject');
  const Note = require('./Note');
  
  const [subjectCount, noteCount] = await Promise.all([
    Subject.countDocuments({ userId, isActive: true }),
    Note.countDocuments({ userId })
  ]);
  
  return {
    totalSubjects: subjectCount,
    totalNotes: noteCount
  };
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    role: this.role,
    isVerified: this.isVerified,
    stats: this.stats,
    preferences: this.preferences,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, role: 1 });

// Export the model
module.exports = mongoose.model('User', userSchema);