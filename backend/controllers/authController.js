const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, squad, batch, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('User already exists', 400));

  const hashedPassword = await bcrypt.hash(password, 10);

  let userBatch = batch;
  if (!userBatch && squad) {
    userBatch = squad <= 5 ? 1 : 2;
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    squad,
    batch: userBatch,
    role: role || 'employee'
  });

  const token = user.generateJWT();

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        squad: user.squad,
        batch: user.batch,
        role: user.role
      }
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = user.generateJWT();

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        squad: user.squad,
        batch: user.batch,
        role: user.role
      }
    }
  });
});

const logout = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      // Blacklist token with expiration matching JWT expiry
      await redisClient.set(`token:${token}`, 'blacklisted', {
        EX: decoded.exp - Math.floor(Date.now() / 1000)
      });
    }
  }

  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

const checkAuth = catchAsync(async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(200).json({ data: { user: null } });
    }

    // Use JWT_SECRET consistently
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const isInvalid = await redisClient.exists(`token:${token}`);
    if (isInvalid) {
      return res.status(200).json({ data: { user: null } });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(200).json({ data: { user: null } });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          squad: user.squad,
          batch: user.batch,
          role: user.role
        }
      }
    });
  } catch (err) {
    return res.status(200).json({ data: { user: null } });
  }
});

module.exports = { register, login, logout, checkAuth };