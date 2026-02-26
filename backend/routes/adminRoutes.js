const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { restrictToAdmin } = require('../middleware/adminMiddleware');
const {
  getAllBookings,
  adminCancelBooking,
  getAnalytics
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, restrictToAdmin);

router.get('/bookings', getAllBookings);
router.delete('/booking/:id', adminCancelBooking);
router.get('/analytics', getAnalytics);

module.exports = router;