import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import { format } from 'date-fns';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, analRes] = await Promise.all([
        axiosClient.get('/admin/bookings'),
        axiosClient.get('/admin/analytics')
      ]);
      setBookings(bookRes.data.data.bookings);
      setAnalytics(analRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await axiosClient.delete(`/admin/booking/${id}`);
    fetchData(); // refresh after cancel
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-base-100 to-base-200 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl animate-pulse">
              <div className="h-8 w-8 bg-primary/20 rounded"></div>
            </div>
            <div className="h-10 w-48 bg-base-300 rounded animate-pulse"></div>
          </div>

          {/* Squad distribution skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                <div className="card-body p-4">
                  <div className="h-4 w-16 bg-base-300 rounded mb-2"></div>
                  <div className="h-6 w-8 bg-base-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="card bg-base-100 shadow-xl animate-pulse">
            <div className="card-body">
              <div className="h-6 w-32 bg-base-300 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-base-300 rounded"></div>
                ))}
              </div>
            </div>
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
        {/* Header with icon and refresh */}
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <button onClick={fetchData} className="btn btn-primary btn-outline btn-sm gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* All Bookings Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            All Bookings
          </h2>
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card bg-base-100 shadow-xl border border-dashed border-base-300"
            >
              <div className="card-body items-center text-center py-12">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-base-content/70">No bookings found.</p>
              </div>
            </motion.div>
          ) : (
            <div className="card bg-base-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th className="font-semibold">Employee</th>
                      <th className="font-semibold">Email</th>
                      <th className="font-semibold">Squad</th>
                      <th className="font-semibold">Date</th>
                      <th className="font-semibold">Type</th>
                      <th className="font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        <td className="font-medium">{booking.user?.name}</td>
                        <td>{booking.user?.email}</td>
                        <td>
                          <span className="badge badge-ghost">Squad {booking.user?.squad}</span>
                        </td>
                        <td>{format(new Date(booking.date), 'yyyy-MM-dd')}</td>
                        <td>
                          <span
                            className={`badge ${
                              booking.type === 'floater' ? 'badge-warning' : 'badge-primary'
                            }`}
                          >
                            {booking.type}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="btn btn-xs btn-error btn-outline"
                          >
                            Cancel
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}