import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BookingCard({ booking, onCancel }) {
  const isPast = new Date(booking.date) < new Date();
  const isToday = format(new Date(booking.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`card bg-base-100 shadow-xl border-l-4 ${
        booking.type === 'floater' ? 'border-l-warning' : 'border-l-primary'
      }`}
    >
      <div className="card-body">
        {/* Header with type badge */}
        <div className="flex justify-between items-start">
          <div>
            <span
              className={`badge ${
                booking.type === 'floater' ? 'badge-warning' : 'badge-primary'
              } badge-sm mb-2`}
            >
              {booking.type === 'floater' ? 'Floater' : 'Designated'}
            </span>
          </div>
          {isPast && (
            <span className="badge badge-ghost badge-sm">Past</span>
          )}
          {isToday && !isPast && (
            <span className="badge badge-success badge-sm">Today</span>
          )}
        </div>

        {/* Date */}
        <h3 className="card-title text-xl">
          {format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}
        </h3>

        {/* Additional details */}
        <div className="space-y-1 text-sm text-base-content/70 mt-2">
          <p className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        {/* Cancel button */}
        <div className="card-actions justify-end mt-4">
          {!isPast && (
            <button
              onClick={() => onCancel(booking._id)}
              className="btn btn-sm btn-outline btn-error"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}