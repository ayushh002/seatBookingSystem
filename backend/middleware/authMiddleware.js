const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new AppError('Not authenticated', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const blacklisted = await redisClient.get(`token:${token}`);
  if (blacklisted) return next(new AppError('Not authenticated', 401));

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User not found', 401));

  req.user = user;
  next();
});

module.exports = { protect };