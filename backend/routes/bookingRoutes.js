const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getAvailability,
  createBooking,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.get('/availability/:date?', getAvailability);
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.delete('/:id', cancelBooking);

module.exports = router;