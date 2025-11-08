// models/Subject.js - Subject Data Model

const mongoose = require('mongoose');

/**
 * Subject Schema
 * Defines the structure for storing subjects in MongoDB
 * Each subject represents a course or topic (e.g., Math, Science, History)
 */
const subjectSchema = new mongoose.Schema({
  // Subject name (required)
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true, // Remove whitespace
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  
  // User who created this subject
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    default: 'default-user' // For now, we'll use a default user
  },
  
  // Optional description
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Color for UI (hex color code)
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  
  // Public sharing functionality
  isShared: {
    type: Boolean,
    default: false
  },
  
  shareToken: {
    type: String,
    unique: true,
    sparse: true // Only enforce uniqueness for non-null values
  },
  
  sharedAt: {
    type: Date
  },
  
  shareSettings: {
    allowComments: {
      type: Boolean,
      default: false
    },
    allowDownload: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date
    }
  },
  
  // Soft delete flag
  isActive: {
    type: Boolean,
    default: true
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

// Middleware to update the updatedAt field before saving
subjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for notes count
subjectSchema.virtual('notesCount', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'subjectId',
  count: true
});

// Ensure virtual fields are serialized
subjectSchema.set('toJSON', { virtuals: true });

// Export the model
module.exports = mongoose.model('Subject', subjectSchema);