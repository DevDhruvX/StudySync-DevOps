// routes/subjects.js - API Routes for Subject Management

const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects for authenticated user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Find all active subjects for the authenticated user with notes count
    const subjects = await Subject.find({ 
      userId: req.user._id, 
      isActive: true 
    })
      .populate('notesCount')
      .sort({ createdAt: -1 });
    
    // Send success response with subjects data
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch subjects'
    });
  }
});

/**
 * @route   GET /api/subjects/:id
 * @desc    Get single subject by ID for authenticated user
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not fetch subject'
    });
  }
});

/**
 * @route   POST /api/subjects
 * @desc    Create new subject for authenticated user
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Check if subject already exists for this user
    const existingSubject = await Subject.findOne({ 
      name: name.trim(),
      userId: req.user._id
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists'
      });
    }
    
    // Create new subject for authenticated user
    const subject = new Subject({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#3B82F6',
      userId: req.user._id
    });
    
    const savedSubject = await subject.save();
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: savedSubject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    
    // Handle validation errors
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
      message: 'Server Error: Could not create subject'
    });
  }
});

/**
 * @route   PUT /api/subjects/:id
 * @desc    Update subject
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    // Find the subject by ID and ensure it belongs to the authenticated user
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Update fields if provided
    if (name) subject.name = name.trim();
    if (description !== undefined) subject.description = description.trim();
    if (color) subject.color = color;
    
    const updatedSubject = await subject.save();
    
    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    
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
      message: 'Server Error: Could not update subject'
    });
  }
});

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Delete subject (soft delete)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find the subject by ID and ensure it belongs to the authenticated user
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    // Soft delete - mark as inactive instead of removing from database
    subject.isActive = false;
    await subject.save();
    
    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: Could not delete subject'
    });
  }
});

// Export the router to use in main server file
module.exports = router;