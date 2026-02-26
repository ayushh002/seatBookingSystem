import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchMyBookings, cancelBooking } from '../redux/bookingSlice';
import BookingCard from '../components/BookingCard';
import { useNavigate } from 'react-router';

export default function MyBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector(state => state.booking);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(cancelBooking(id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-base-100 to-base-200 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl animate-pulse">
              <div className="h-8 w-8 bg-primary/20 rounded"></div>
            </div>
            <div className="h-10 w-48 bg-base-300 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                <div className="card-body">
                  <div className="h-6 bg-base-300 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-base-300 rounded"></div>
                    <div className="h-4 bg-base-300 rounded w-5/6"></div>
                    <div className="h-4 bg-base-300 rounded w-2/3"></div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <div className="h-8 w-20 bg-base-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-linear-to-br from-base-100 to-base-200 p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Bookings
          </h1>
          {bookings.length > 0 && (
            <span className="badge badge-primary badge-lg ml-auto">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </span>
          )}
        </div>

        {/* Bookings grid */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card bg-base-100 shadow-xl border border-dashed border-base-300"
          >
            <div className="card-body items-center text-center py-16">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-primary/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">No bookings yet</h2>
              <p className="text-base-content/70 mb-6">
                Ready to reserve your seat? Head over to the booking page.
              </p>
              <button
                onClick={() => navigate('/book')}
                className="btn btn-primary"
              >
                Book a Seat
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BookingCard booking={booking} onCancel={handleCancel} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}