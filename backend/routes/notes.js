// routes/notes.js - API Routes for Note Management

const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { upload, handleUploadError } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/notes/:subjectId
 * @desc    Get all notes for a specific subject
 * @access  Private
 */
router.get('/:subjectId', protect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query to find notes for the subject and authenticated user
    const query = { subjectId, userId: req.user._id };

    // Add search functionality if search term provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
        { content: { $regex: search, $options: 'i' } }, // Case-insensitive search in content
        { tags: { $in: [new RegExp(search, 'i')] } } // Search in tags
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get notes with pagination and populate subject info
    const notes = await Note.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('subjectId', 'name color'); // Get subject name and color

    // Get total count for pagination info
    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch notes'
    });
  }
});

/**
 * @route   GET /api/notes/note/:id
 * @desc    Get single note by ID
 * @access  Private
 */
router.get('/note/:id', protect, async (req, res) => {
  try {
    // Find note by ID and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('subjectId', 'name color');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch note'
    });
  }
});

/**
 * @route   POST /api/notes
 * @desc    Create new note
 * @access  Private
 */
router.post('/', protect, upload.array('files', 5), async (req, res) => {
  try {
    console.log('POST /notes - Request received');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('Files length:', req.files ? req.files.length : 0);

    const { subjectId, title, content, link, type, linkType, tags, isPublic, isPinned, color } = req.body;

    // Auto-detect resource type and link type if not provided
    let detectedType = type;
    let detectedLinkType = linkType;

    // If files are uploaded, set type to 'file'
    if (req.files && req.files.length > 0) {
      detectedType = 'file';
      detectedLinkType = 'document';
    } else if (link && !type) {
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        detectedType = 'youtube';
        detectedLinkType = 'youtube';
      } else if (link.includes('.pdf')) {
        detectedType = 'document';
        detectedLinkType = 'document';
      } else {
        detectedType = 'link';
        detectedLinkType = 'article';
      }
    } else if (!link) {
      detectedType = 'note';
    }

    // Process uploaded files
    const files = [];
    console.log('Processing uploaded files...');
    if (req.files && req.files.length > 0) {
      console.log(`Found ${req.files.length} files to process`);
      req.files.forEach((file, index) => {
        console.log(`Processing file ${index + 1}:`, {
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path
        });
        files.push({
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype
        });
      });
    } else {
      console.log('No files found in request');
    }
    console.log('Processed files array:', files);

    // Parse links if provided (support multipart/form-data where each link may be JSON-stringified)
    let parsedLinks = [];
    if (req.body.links) {
      console.log('Raw links received:', req.body.links);
      const rawLinks = Array.isArray(req.body.links) ? req.body.links : [req.body.links];
      console.log('Raw links array:', rawLinks);
      rawLinks.forEach(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item;
          console.log('Parsed link item:', parsed);
          
          // Check if parsed is an array (multiple links in one JSON string)
          if (Array.isArray(parsed)) {
            parsed.forEach(linkObj => {
              if (linkObj && linkObj.url) {
                parsedLinks.push(linkObj);
                console.log('Added array link to parsedLinks:', linkObj);
              }
            });
          } 
          // Or a single link object
          else if (parsed && parsed.url) {
            parsedLinks.push(parsed);
            console.log('Added single link to parsedLinks:', parsed);
          }
        } catch (err) {
          console.log('JSON parse failed, treating as raw URL:', item);
          // If parsing fails, assume the item is a raw URL string
          if (typeof item === 'string' && item.trim()) {
            parsedLinks.push({ url: item.trim() });
            console.log('Added raw URL to parsedLinks:', item.trim());
          }
        }
      });
    }
    console.log('Final parsedLinks array:', parsedLinks);

    console.log('Creating note with data:', {
      subjectId,
      title,
      content,
      link,
      type: detectedType,
      linkType: detectedLinkType,
      tags,
      files,
      filesCount: files.length,
      isPublic,
      isPinned,
      userId: req.user._id
    });

    // Create new note (include parsedLinks when available)
    const note = new Note({
      subjectId,
      title: title.trim(),
      content: content?.trim(),
      link: link?.trim(),
      links: parsedLinks.length > 0 ? parsedLinks : undefined,
      type: detectedType,
      linkType: detectedLinkType,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      files: files,
      color: color,
      isPublic: isPublic || false,
      isPinned: isPinned || false,
      userId: req.user._id  // Use authenticated user's ID
    });

    const savedNote = await note.save();

    // Get the note with populated subject info
    const populatedNote = await Note.findById(savedNote._id)
      .populate('subjectId', 'name color');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: populatedNote
    });
  } catch (error) {
    console.error('Error creating note:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Could not create note'
    });
  }
});

/**
 * @route   PUT /api/notes/:id
 * @desc    Update note
 * @access  Private
 */
router.put('/:id', protect, upload.array('files', 5), async (req, res) => {
  try {
    const { title, content, link, linkType, tags, isPublic, isPinned, color } = req.body;

    // Find note by ID and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update fields if provided
    if (title) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (link !== undefined) note.link = link.trim();
    if (linkType) note.linkType = linkType;
    if (tags) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPublic !== undefined) note.isPublic = isPublic;
    if (isPinned !== undefined) note.isPinned = isPinned;

    // Support updating links (expecting either an array of objects or JSON-stringified items)
    if (req.body.links !== undefined) {
      let parsedLinks = [];
      try {
        console.log('PUT - Raw links received:', req.body.links);
        const rawLinks = Array.isArray(req.body.links) ? req.body.links : [req.body.links];
        console.log('PUT - Raw links array:', rawLinks);
        rawLinks.forEach(item => {
          try {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            console.log('PUT - Parsed link item:', parsed);
            
            // Check if parsed is an array (multiple links in one JSON string)
            if (Array.isArray(parsed)) {
              parsed.forEach(linkObj => {
                if (linkObj && linkObj.url) {
                  parsedLinks.push(linkObj);
                  console.log('PUT - Added array link to parsedLinks:', linkObj);
                }
              });
            } 
            // Or a single link object
            else if (parsed && parsed.url) {
              parsedLinks.push(parsed);
              console.log('PUT - Added single link to parsedLinks:', parsed);
            }
          } catch (err) {
            console.log('PUT - JSON parse failed, treating as raw URL:', item);
            if (typeof item === 'string' && item.trim()) {
              parsedLinks.push({ url: item.trim() });
              console.log('PUT - Added raw URL to parsedLinks:', item.trim());
            }
          }
        });
      } catch (err) {
        // ignore and leave parsedLinks empty
      }
      console.log('PUT - Final parsedLinks array:', parsedLinks);
      note.links = parsedLinks;
    }

    // Handle file uploads for updates
    if (req.files && req.files.length > 0) {
      console.log('Processing files in update - count:', req.files.length);
      const newFiles = [];
      req.files.forEach((file, index) => {
        console.log(`Processing file ${index + 1}:`, {
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path
        });
        newFiles.push({
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype
        });
      });

      // Append new files to existing files (don't replace, add to them)
      if (!note.files) note.files = [];
      note.files.push(...newFiles);
      console.log('Updated files array:', note.files);
    }

    const updatedNote = await note.save();

    // Get updated note with populated subject info
    const populatedNote = await Note.findById(updatedNote._id)
      .populate('subjectId', 'name color');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: populatedNote
    });
  } catch (error) {
    console.error('Error updating note:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error: Could not update note'
    });
  }
});

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find note by ID and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Hard delete - completely remove from database
    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not delete note'
    });
  }
});

/**
 * @route   PATCH /api/notes/:id/pin
 * @desc    Toggle note pin status
 * @access  Public
 */
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Toggle pin status
    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { isPinned: note.isPinned }
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not update pin status'
    });
  }
});

/**
 * @route   GET /api/notes/files/:filename
 * @desc    Serve uploaded files
 * @access  Private
 */
router.get('/files/:filename', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Find the note that contains this file to get the correct mimeType
    const note = await Note.findOne({ 'files.fileName': filename });
    let contentType = 'application/octet-stream';
    
    if (note) {
      const fileInfo = note.files.find(f => f.fileName === filename);
      if (fileInfo && fileInfo.mimeType) {
        contentType = fileInfo.mimeType;
      }
    }
    
    // Fallback to extension-based detection if no mimeType in database
    if (contentType === 'application/octet-stream') {
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      contentType = mimeTypes[ext] || 'application/octet-stream';
    }

    console.log(`Serving file: ${filename}, Content-Type: ${contentType}`);
    res.setHeader('Content-Type', contentType);

    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not serve file'
    });
  }
});

/**
 * @route   GET /api/notes/files/:filename/download
 * @desc    Download uploaded files
 * @access  Private
 */
router.get('/files/:filename/download', protect, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Find the note that contains this file to get original name
    const note = await Note.findOne({ 'files.fileName': filename });
    const fileInfo = note?.files.find(f => f.fileName === filename);
    const originalName = fileInfo?.originalName || filename;

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not download file'
    });
  }
});

/**
 * @route   DELETE /api/notes/:id/files/:filename
 * @desc    Delete a file from a note
 * @access  Private
 */
router.delete('/:id/files/:filename', protect, async (req, res) => {
  try {
    const { id, filename } = req.params;

    // Find the note and ensure it belongs to the authenticated user
    const note = await Note.findOne({ _id: id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Find the file in the note
    const fileIndex = note.files.findIndex(f => f.fileName === filename);
    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found in note'
      });
    }

    // Get file path
    const filePath = note.files[fileIndex].filePath;

    // Remove file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file from note
    note.files.splice(fileIndex, 1);

    // If no files left and type was 'file', change type back to 'note'
    if (note.files.length === 0 && note.type === 'file') {
      note.type = 'note';
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: note
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not delete file'
    });
  }
});

// Add error handling middleware
router.use(handleUploadError);

// Export the router
module.exports = router;