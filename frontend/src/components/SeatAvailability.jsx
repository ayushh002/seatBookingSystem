import { motion } from 'framer-motion';

export default function SeatAvailability({ available, total }) {
  const booked = total - available;
  const percentage = (booked / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>Booked: <span className="font-semibold">{booked}</span></span>
        <span>Available: <span className="font-semibold">{available}</span></span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
        />
      </div>
    </div>
  );
}