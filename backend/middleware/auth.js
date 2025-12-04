import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found or inactive' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Authentication error' 
      });
    }
  }
};

// Optional authentication - continues even if no token
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
      attributes: { exclude: ['password'] }
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};