const Booking = require('../models/Booking');
const User = require('../models/User');
const redisClient = require('../config/redis');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment');

const TOTAL_SEATS = 50;

const getAvailableSeats = async (date) => {
  const start = moment(date).startOf('day').toDate();
  const end = moment(date).endOf('day').toDate();
  const booked = await Booking.countDocuments({ date: { $gte: start, $lte: end }, status: 'booked' });
  return TOTAL_SEATS - booked;
};

const getAllBookings = catchAsync(async (req, res, next) => {
  const { date } = req.query;
  let filter = { status: 'booked' };
  if (date) {
    const start = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
    const end = moment(date, 'YYYY-MM-DD').endOf('day').toDate();
    filter.date = { $gte: start, $lte: end };
  }
  const bookings = await Booking.find(filter).populate('user', 'name email squad batch');
  res.status(200).json({
    status: 'success',
    data: { bookings }
  });
});

const adminCancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (!booking || booking.status === 'cancelled') {
    return next(new AppError('Booking not found or already cancelled', 404));
  }
  booking.status = 'cancelled';
  await booking.save();

  await redisClient.del(`seats:${moment(booking.date).format('YYYY-MM-DD')}`);

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled by admin'
  });
});

const getAnalytics = catchAsync(async (req, res, next) => {
  const today = moment().startOf('day').toDate();
  const todayBookings = await Booking.find({
    date: { $gte: today, $lt: moment(today).endOf('day').toDate() },
    status: 'booked'
  }).populate('user');

  const squadCount = {};
  for (let i = 1; i <= 10; i++) squadCount[i] = 0;
  todayBookings.forEach(b => {
    if (b.user && b.user.squad) {
      squadCount[b.user.squad] = (squadCount[b.user.squad] || 0) + 1;
    }
  });

  const upcoming = [];
  for (let i = 0; i < 7; i++) {
    const d = moment().add(i, 'days');
    const available = await getAvailableSeats(d.toDate());
    upcoming.push({
      date: d.format('YYYY-MM-DD'),
      available
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      today: {
        totalBookings: todayBookings.length,
        squadDistribution: squadCount
      },
      upcoming
    }
  });
});

module.exports = { getAllBookings, adminCancelBooking, getAnalytics };