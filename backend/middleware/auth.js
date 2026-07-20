const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production!');
  process.exit(1);
}

const ACTUAL_SECRET = JWT_SECRET || 'supersecretkeyforjwt';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACTUAL_SECRET);
    const user = await User.findById(decoded.id); // Updated from findByPk to findById for Mongoose
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid or user not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
  JWT_SECRET: ACTUAL_SECRET
};
