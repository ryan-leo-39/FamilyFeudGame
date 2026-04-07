import { motion, AnimatePresence } from 'framer-motion';

export default function StrikeDisplay({ strikes }) {
  return (
    <div className="flex gap-3 justify-center items-center">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-12 h-12 flex items-center justify-center">
          <AnimatePresence>
            {strikes > i ? (
              <motion.div
                key="x"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-full h-full bg-ff-red rounded-full flex items-center justify-center shadow-lg border-2 border-red-400"
              >
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-none stroke-current" strokeWidth={3}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="w-full h-full bg-ff-tile rounded-full border-2 border-blue-700"
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
