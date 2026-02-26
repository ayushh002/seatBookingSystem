const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['designated', 'floater'], required: true },
  status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
}, { timestamps: true });

// Ensure one active booking per user per date
bookingSchema.index({ user: 1, date: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);