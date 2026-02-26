import { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fetchAvailability, fetchMyBookings } from '../redux/bookingSlice';
import StatsCard from '../components/StatsCard';
import SeatAvailability from '../components/SeatAvailability';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { availability, bookings, loading } = useSelector(state => state.booking);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(fetchAvailability());
    dispatch(fetchMyBookings());
  }, [dispatch]);

  // Loading skeleton
  if (loading && !availability) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl animate-pulse">
              <div className="h-8 w-8 bg-primary/20 rounded"></div>
            </div>
            <div className="h-10 w-64 bg-base-300 rounded animate-pulse"></div>
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                <div className="card-body">
                  <div className="h-4 w-20 bg-base-300 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-base-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Seat occupancy skeleton */}
          <div className="card bg-base-100 shadow-xl animate-pulse mb-8">
            <div className="card-body">
              <div className="h-6 w-40 bg-base-300 rounded mb-4"></div>
              <div className="h-4 w-full bg-base-300 rounded mb-2"></div>
              <div className="h-2 w-full bg-base-300 rounded"></div>
            </div>
          </div>

          {/* Upcoming bookings skeleton */}
          <div>
            <div className="h-6 w-48 bg-base-300 rounded mb-4"></div>
            <div className="grid gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                  <div className="card-body">
                    <div className="h-4 w-3/4 bg-base-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcoming = bookings
    .filter(b => new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with icon and welcome */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
                  d="M3 12l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2-2 2-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-base-content/70 mt-1">
                Here's your seat availability for today
              </p>
            </div>
          </div>
          <div className="badge badge-primary badge-lg">
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Seats"
            value={availability?.totalSeats || 50}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            color="primary"
          />
          <StatsCard
            title="Available Today"
            value={availability?.availableSeats || 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="success"
          />
          <StatsCard
            title="Floater Seats Left"
            value={availability?.floaterLeft || 0}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            color="warning"
          />
        </div>

        {/* Seat Occupancy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Seat Occupancy Today</h2>
                <SeatAvailability
                  available={availability?.availableSeats || 0}
                  total={availability?.totalSeats || 50}
                />
                <p className="text-sm text-base-content/70 mt-2">
                  {availability?.availableSeats} seats available • {availability?.totalSeats - (availability?.availableSeats || 0)} booked
                </p>
              </div>
            </div>
          </div>

          {/* Quick tip card */}
          <div className="lg:col-span-1">
            <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/10 h-full">
              <div className="card-body">
                <h3 className="font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Info
                </h3>
                <div className="space-y-2 text-sm">
                  <p>• Designated seats: 40 max</p>
                  <p>• Floater seats: 10 max</p>
                  <p>• Batch 1: Mon/Tue/Wed</p>
                  <p>• Batch 2: Thu/Fri</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/book')}
                    className="btn btn-primary btn-sm w-full"
                  >
                    Book a Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">My Upcoming Bookings</h2>
            {upcoming.length > 0 && (
              <button
                onClick={() => navigate('/my-bookings')}
                className="btn btn-ghost btn-sm"
              >
                View all
              </button>
            )}
          </div>
          
          {upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-xl border border-dashed border-base-300"
            >
              <div className="card-body items-center text-center py-12">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-base-content/70">No upcoming bookings.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card bg-base-100 shadow-xl border-l-4 border-l-primary"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <span className={`badge ${booking.type === 'floater' ? 'badge-warning' : 'badge-primary'} badge-sm`}>
                        {booking.type}
                      </span>
                      <span className="text-xs text-base-content/50">
                        {format(new Date(booking.date), 'MMM d')}
                      </span>
                    </div>
                    <h3 className="font-semibold mt-2">
                      {format(new Date(booking.date), 'EEEE, MMMM do')}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}