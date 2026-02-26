const Booking = require('../models/Booking');
const redisClient = require('../config/redis');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const moment = require('moment');

const TOTAL_SEATS = 50;
const MAX_DESIGNATED = 40;
const MAX_FLOATER = 10;

const getDateKey = (date) => moment(date).format('YYYY-MM-DD');

const getAvailableSeats = async (date) => {
  const dateKey = getDateKey(date);
  const cacheKey = `seats:${dateKey}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return parseInt(cached, 10);

  const start = moment(date).startOf('day').toDate();
  const end = moment(date).endOf('day').toDate();

  const bookedCount = await Booking.countDocuments({
    date: { $gte: start, $lte: end },
    status: 'booked'
  });

  const available = TOTAL_SEATS - bookedCount;
  // Cache for 5 minutes (300 seconds)
  await redisClient.set(cacheKey, available, { EX: 300 });
  return available;
};

const clearAvailabilityCache = async (date) => {
  const dateKey = getDateKey(date);
  await redisClient.del(`seats:${dateKey}`);
};

const getAvailability = catchAsync(async (req, res, next) => {
  const { date } = req.params;
  let targetDate;
  if (date) {
    targetDate = moment(date, 'YYYY-MM-DD');
    if (!targetDate.isValid()) return next(new AppError('Invalid date format', 400));
  } else {
    targetDate = moment().startOf('day');
  }

  const available = await getAvailableSeats(targetDate.toDate());

  const start = targetDate.startOf('day').toDate();
  const end = targetDate.endOf('day').toDate();
  const floaterBooked = await Booking.countDocuments({
    date: { $gte: start, $lte: end },
    type: 'floater',
    status: 'booked'
  });
  const floaterLeft = MAX_FLOATER - floaterBooked;

  res.status(200).json({
    status: 'success',
    data: {
      date: targetDate.format('YYYY-MM-DD'),
      totalSeats: TOTAL_SEATS,
      availableSeats: available,
      floaterLeft: Math.max(0, floaterLeft),
      designatedBooked: (TOTAL_SEATS - available) - floaterBooked
    }
  });
});

const createBooking = catchAsync(async (req, res, next) => {
  const { date, type } = req.body;
  const user = req.user;

  console.log('Booking attempt:', { user: user.email, date, type, batch: user.batch });

  if (!date || !type) return next(new AppError('Please provide date and type', 400));
  if (!['designated', 'floater'].includes(type)) return next(new AppError('Invalid booking type', 400));

  const bookingDate = moment(date, 'YYYY-MM-DD');
  if (!bookingDate.isValid()) return next(new AppError('Invalid date format', 400));

  const today = moment().startOf('day');
  if (bookingDate.isBefore(today)) return next(new AppError('Cannot book past dates', 400));

  // Type‑specific rules
  if (type === 'designated') {
    if (bookingDate.diff(today, 'days') > 14) {
      return next(new AppError('Designated bookings can only be made up to 14 days in advance', 400));
    }

    const dayOfWeek = bookingDate.day();
    if (user.batch === 1) {
      if (![1, 2, 3].includes(dayOfWeek)) {
        return next(new AppError('Batch 1 can only book on Monday, Tuesday, Wednesday', 400));
      }
    } else if (user.batch === 2) {
      if (![4, 5].includes(dayOfWeek)) {
        return next(new AppError('Batch 2 can only book on Thursday, Friday', 400));
      }
    }
  } else { // floater
    const tomorrow = moment().add(1, 'day').startOf('day');
    if (!bookingDate.isSame(tomorrow, 'day')) {
      return next(new AppError('Floater bookings can only be made for tomorrow', 400));
    }

    const now = moment();
    const threePMToday = moment().startOf('day').hour(18).minute(0).second(0);
    if (now.isAfter(threePMToday)) {
      return next(new AppError('Floater bookings must be made before 3 PM', 400));
    }
  }

  const existingBooking = await Booking.findOne({
    user: user._id,
    date: {
      $gte: bookingDate.startOf('day').toDate(),
      $lte: bookingDate.endOf('day').toDate()
    },
    status: 'booked'
  });

  if (existingBooking) {
    return next(new AppError('You already have a booking on this date', 400));
  }

  const available = await getAvailableSeats(bookingDate.toDate());
  if (available <= 0) {
    return next(new AppError('No seats available on this date', 400));
  }

  const start = bookingDate.startOf('day').toDate();
  const end = bookingDate.endOf('day').toDate();

  if (type === 'floater') {
    const floaterBooked = await Booking.countDocuments({
      date: { $gte: start, $lte: end },
      type: 'floater',
      status: 'booked'
    });
    if (floaterBooked >= MAX_FLOATER) {
      return next(new AppError('No floater seats available on this date', 400));
    }
  } else { // designated
    const designatedBooked = await Booking.countDocuments({
      date: { $gte: start, $lte: end },
      type: 'designated',
      status: 'booked'
    });
    if (designatedBooked >= MAX_DESIGNATED) {
      return next(new AppError('No designated seats available on this date', 400));
    }
  }

  const booking = await Booking.create({
    user: user._id,
    date: bookingDate.toDate(),
    type,
    status: 'booked'
  });

  await clearAvailabilityCache(bookingDate.toDate());

  res.status(201).json({
    status: 'success',
    data: { booking }
  });
});

const getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id, status: 'booked' })
    .sort({ date: 1 });

  res.status(200).json({
    status: 'success',
    data: { bookings }
  });
});

const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findOne({ _id: id, user: req.user._id, status: 'booked' });

  if (!booking) {
    return next(new AppError('Booking not found or already cancelled', 404));
  }

  const bookingDate = moment(booking.date);
  if (bookingDate.isBefore(moment().startOf('day'))) {
    return next(new AppError('Cannot cancel past bookings', 400));
  }

  booking.status = 'cancelled';
  await booking.save();

  await clearAvailabilityCache(booking.date);

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully'
  });
});

module.exports = {
  getAvailability,
  createBooking,
  getMyBookings,
  cancelBooking
};