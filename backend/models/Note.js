// models/Note.js - Note Data Model

const mongoose = require('mongoose');

/**
 * Note Schema
 * Defines the structure for storing notes in MongoDB
 * Each note belongs to a subject and can contain text, links, etc.
 */
const noteSchema = new mongoose.Schema({
  // Reference to the subject this note belongs to
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject', // Reference to Subject model
    required: [true, 'Subject ID is required']
  },

  // Note title (required)
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  // Note content/description
  content: {
    type: String,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },

  // External link (YouTube, articles, etc.) - kept for backwards compatibility
  link: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) return true; // Allow empty links
        return /^https?:\/\/.+/.test(v); // Validate URL format
      },
      message: 'Please provide a valid URL'
    }
  },

  // Multiple external links
  links: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v); // Validate URL format
        },
        message: 'Please provide a valid URL'
      }
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Link title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Link description cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: ['youtube', 'github', 'stackoverflow', 'article', 'documentation', 'google-docs', 'notion', 'website', 'other'],
      default: 'website'
    },
    preview: {
      title: String,
      description: String,
      image: String,
      siteName: String
    }
  }],

  // Type of resource for better organization
  type: {
    type: String,
    enum: ['note', 'youtube', 'article', 'document', 'link', 'file', 'other'],
    default: 'note'
  },

  // Custom color for the note
  color: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) return true; // Allow empty color
        return /^#([0-9A-F]{3}){1,2}$/i.test(v); // Validate hex color format
      },
      message: 'Please provide a valid hex color'
    }
  },

  // File attachments
  files: [{
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Type of link for better organization (kept for compatibility)
  linkType: {
    type: String,
    enum: ['youtube', 'article', 'document', 'other'],
    default: 'other'
  },

  // Tags for better searchability
  tags: [{
    type: String,
    trim: true
  }],

  // Visibility setting
  isPublic: {
    type: Boolean,
    default: false
  },

  // Pin important notes
  isPinned: {
    type: Boolean,
    default: false
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

  // User who created this note
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    default: 'default-user'
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
noteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
noteSchema.index({ subjectId: 1, createdAt: -1 }); // For getting notes by subject
noteSchema.index({ userId: 1 }); // For getting notes by user

// Export the model
module.exports = mongoose.model('Note', noteSchema);