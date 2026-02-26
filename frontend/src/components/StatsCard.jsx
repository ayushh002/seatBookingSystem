import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary',
    success: 'from-success/10 to-success/5 border-success/20 text-success',
    warning: 'from-warning/10 to-warning/5 border-warning/20 text-warning',
    info: 'from-info/10 to-info/5 border-info/20 text-info',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`card bg-linear-to-br ${colorClasses[color]} shadow-xl border`}
    >
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium opacity-70">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 bg-base-100 rounded-full shadow-sm`}>
            <div className={`w-6 h-6 text-${color}`}>{icon}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}