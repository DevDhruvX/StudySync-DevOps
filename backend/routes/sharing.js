// routes/sharing.js - Public Sharing Routes

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Subject = require('../models/Subject');
const Note = require('../models/Note');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate unique share token
const generateShareToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * @route   POST /api/sharing/subjects/:id/share
 * @desc    Share a subject publicly
 * @access  Private
 */
router.post('/subjects/:id/share', protect, async (req, res) => {
  try {
    const { shareSettings = {} } = req.body;
    
    // Find the subject and ensure it belongs to the authenticated user
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Generate unique share token
    let shareToken;
    let tokenExists = true;
    
    while (tokenExists) {
      shareToken = generateShareToken();
      const existingShare = await Subject.findOne({ shareToken });
      tokenExists = !!existingShare;
    }
    
    // Update subject with sharing info
    subject.isShared = true;
    subject.shareToken = shareToken;
    subject.sharedAt = new Date();
    subject.shareSettings = {
      allowComments: shareSettings.allowComments || false,
      allowDownload: shareSettings.allowDownload !== false, // Default true
      expiresAt: shareSettings.expiresAt ? new Date(shareSettings.expiresAt) : null
    };
    
    await subject.save();
    
    // Generate frontend URL for sharing
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    res.status(200).json({
      success: true,
      message: 'Subject shared successfully',
      data: {
        shareToken,
        shareUrl: `${frontendUrl}/share/${shareToken}`,
        shareSettings: subject.shareSettings
      }
    });
    
  } catch (error) {
    console.error('Share subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not share subject'
    });
  }
});

/**
 * @route   POST /api/sharing/notes/:id/share
 * @desc    Share a note publicly
 * @access  Private
 */
router.post('/notes/:id/share', protect, async (req, res) => {
  try {
    const { shareSettings = {} } = req.body;
    
    // Find the note and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Generate unique share token
    let shareToken;
    let tokenExists = true;
    
    while (tokenExists) {
      shareToken = generateShareToken();
      const existingShare = await Note.findOne({ shareToken });
      tokenExists = !!existingShare;
    }
    
    // Update note with sharing info
    note.isShared = true;
    note.shareToken = shareToken;
    note.sharedAt = new Date();
    note.shareSettings = {
      allowComments: shareSettings.allowComments || false,
      allowDownload: shareSettings.allowDownload !== false, // Default true
      expiresAt: shareSettings.expiresAt ? new Date(shareSettings.expiresAt) : null
    };
    
    await note.save();
    
    // Generate frontend URL for sharing
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    res.status(200).json({
      success: true,
      message: 'Note shared successfully',
      data: {
        shareToken,
        shareUrl: `${frontendUrl}/share/${shareToken}`,
        shareSettings: note.shareSettings
      }
    });
    
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not share note'
    });
  }
});

/**
 * @route   DELETE /api/sharing/subjects/:id/unshare
 * @desc    Stop sharing a subject
 * @access  Private
 */
router.delete('/subjects/:id/unshare', protect, async (req, res) => {
  try {
    // Find the subject and ensure it belongs to the authenticated user
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Remove sharing info
    subject.isShared = false;
    subject.shareToken = undefined;
    subject.sharedAt = undefined;
    subject.shareSettings = undefined;
    
    await subject.save();
    
    res.status(200).json({
      success: true,
      message: 'Subject unshared successfully'
    });
    
  } catch (error) {
    console.error('Unshare subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not unshare subject'
    });
  }
});

/**
 * @route   DELETE /api/sharing/notes/:id/unshare
 * @desc    Stop sharing a note
 * @access  Private
 */
router.delete('/notes/:id/unshare', protect, async (req, res) => {
  try {
    // Find the note and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Remove sharing info
    note.isShared = false;
    note.shareToken = undefined;
    note.sharedAt = undefined;
    note.shareSettings = undefined;
    
    await note.save();
    
    res.status(200).json({
      success: true,
      message: 'Note unshared successfully'
    });
    
  } catch (error) {
    console.error('Unshare note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not unshare note'
    });
  }
});

/**
 * @route   GET /api/sharing/public/:token
 * @desc    Get publicly shared content by token
 * @access  Public
 */
router.get('/public/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Try to find in subjects first
    let content = await Subject.findOne({ 
      shareToken: token, 
      isShared: true,
      isActive: true 
    }).populate('userId', 'name avatar');
    
    let contentType = 'subject';
    
    // If not found in subjects, try notes
    if (!content) {
      content = await Note.findOne({ 
        shareToken: token, 
        isShared: true 
      }).populate('subjectId', 'name color')
        .populate('userId', 'name avatar');
      contentType = 'note';
    }
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Shared content not found'
      });
    }
    
    // Check if share has expired
    if (content.shareSettings?.expiresAt && new Date() > content.shareSettings.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This shared content has expired'
      });
    }
    
    // Get additional data for subjects (notes count)
    let additionalData = {};
    if (contentType === 'subject') {
      const notesCount = await Note.countDocuments({ 
        subjectId: content._id, 
        userId: content.userId 
      });
      additionalData.notesCount = notesCount;
      
      // Get sample notes (first 5) for preview
      const sampleNotes = await Note.find({ 
        subjectId: content._id, 
        userId: content.userId 
      }).select('title content type createdAt')
        .limit(5)
        .sort({ createdAt: -1 });
      additionalData.sampleNotes = sampleNotes;
    }
    
    res.status(200).json({
      success: true,
      data: {
        content,
        contentType,
        shareSettings: content.shareSettings,
        sharedAt: content.sharedAt,
        owner: content.userId,
        ...additionalData
      }
    });
    
  } catch (error) {
    console.error('Get shared content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not get shared content'
    });
  }
});

/**
 * @route   GET /api/sharing/public/:token/notes
 * @desc    Get notes for a shared subject
 * @access  Public
 */
router.get('/public/:token/notes', async (req, res) => {
  try {
    const { token } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Find the shared subject
    const subject = await Subject.findOne({ 
      shareToken: token, 
      isShared: true,
      isActive: true 
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Shared subject not found'
      });
    }
    
    // Check if share has expired
    if (subject.shareSettings?.expiresAt && new Date() > subject.shareSettings.expiresAt) {
      return res.status(410).json({
        success: false,
        message: 'This shared content has expired'
      });
    }
    
    // Get notes for this subject
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notes = await Note.find({ 
      subjectId: subject._id, 
      userId: subject.userId 
    }).select('title content type link files tags isPinned createdAt updatedAt')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Note.countDocuments({ 
      subjectId: subject._id, 
      userId: subject.userId 
    });
    
    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        subject: {
          name: subject.name,
          description: subject.description,
          color: subject.color
        }
      }
    });
    
  } catch (error) {
    console.error('Get shared subject notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not get shared subject notes'
    });
  }
});

/**
 * @route   POST /api/sharing/import/:token
 * @desc    Import shared content to user's account
 * @access  Private
 */
router.post('/import/:token', protect, async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find shared subject
    let sharedSubject = await Subject.findOne({ 
      shareToken: token, 
      isShared: true 
    }).populate('userId', 'name email');
    
    if (sharedSubject) {
      // Check if user already has a subject with this name
      const existingSubject = await Subject.findOne({ 
        userId: req.user._id, 
        name: sharedSubject.name 
      });
      
      let subjectName = sharedSubject.name;
      if (existingSubject) {
        subjectName = `${sharedSubject.name} (Imported)`;
      }
      
      // Create new subject for the importing user
      const newSubject = new Subject({
        name: subjectName,
        description: sharedSubject.description,
        color: sharedSubject.color,
        userId: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newSubject.save();
      
      // Import notes from the shared subject
      const sharedNotes = await Note.find({ subjectId: sharedSubject._id });
      const importedNotes = [];
      
      for (const note of sharedNotes) {
        const newNote = new Note({
          title: note.title,
          content: note.content,
          type: note.type,
          link: note.link,
          subjectId: newSubject._id,
          userId: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newNote.save();
        importedNotes.push(newNote);
      }
      
      return res.json({
        success: true,
        message: `Successfully imported subject "${subjectName}" with ${importedNotes.length} notes`,
        data: {
          subject: newSubject,
          notesCount: importedNotes.length
        }
      });
    }
    
    // Find shared note
    let sharedNote = await Note.findOne({ 
      shareToken: token, 
      isShared: true 
    }).populate('userId', 'name email').populate('subjectId', 'name');
    
    if (sharedNote) {
      // Check if user has a subject to import the note into
      // For now, we'll create a new subject called "Imported Notes"
      let importSubject = await Subject.findOne({
        userId: req.user._id,
        name: 'Imported Notes'
      });
      
      if (!importSubject) {
        importSubject = new Subject({
          name: 'Imported Notes',
          description: 'Notes imported from shared content',
          color: '#6366f1',
          userId: req.user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await importSubject.save();
      }
      
      // Check if user already has a note with this title in the import subject
      let noteTitle = sharedNote.title;
      const existingNote = await Note.findOne({
        userId: req.user._id,
        subjectId: importSubject._id,
        title: sharedNote.title
      });
      
      if (existingNote) {
        noteTitle = `${sharedNote.title} (Imported)`;
      }
      
      // Create new note for the importing user
      const newNote = new Note({
        title: noteTitle,
        content: sharedNote.content,
        type: sharedNote.type,
        link: sharedNote.link,
        subjectId: importSubject._id,
        userId: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newNote.save();
      
      return res.json({
        success: true,
        message: `Successfully imported note "${noteTitle}" to subject "${importSubject.name}"`,
        data: {
          note: newNote,
          subject: importSubject
        }
      });
    }
    
    // No shared content found
    return res.status(404).json({
      success: false,
      message: 'Shared content not found or has expired'
    });
    
  } catch (error) {
    console.error('Import shared content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not import shared content'
    });
  }
});

module.exports = router;