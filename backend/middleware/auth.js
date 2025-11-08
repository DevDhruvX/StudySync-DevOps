// middleware/auth.js - Authentication Middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'studysync-secret-key');
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error: Authentication failed'
    });
  }
};

/**
 * Middleware to authorize user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for routes that work for both authenticated and non-authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If no token, continue without authentication
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'studysync-secret-key');
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
    
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};