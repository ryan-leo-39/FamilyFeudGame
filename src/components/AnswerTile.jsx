import { motion, AnimatePresence } from 'framer-motion';

export default function AnswerTile({ answer, index, revealed, isLastRound }) {
  const displayPoints = isLastRound ? answer.points * 2 : answer.points;

  return (
    <div className="relative" style={{ perspective: '600px' }}>
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: revealed ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative w-full"
        // Need a fixed height for the 3D flip
      >
        {/* Front — hidden tile */}
        <div
          className="w-full"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="bg-ff-tile border-2 border-blue-600 rounded-lg p-3 flex items-center justify-between h-14">
            <span className="text-blue-400 font-black text-xl w-8 text-center">{index + 1}</span>
            <div className="flex-1 h-3 bg-blue-800 rounded mx-2" />
            <span className="text-blue-800 font-black text-xl w-12 text-right">—</span>
          </div>
        </div>

        {/* Back — revealed tile */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <div className="bg-gradient-to-r from-ff-tile-revealed to-blue-700 border-2 border-ff-gold rounded-lg p-3 flex items-center justify-between h-14 shadow-lg">
            <span className="text-ff-gold font-black text-xl w-8 text-center">{index + 1}</span>
            <span className="flex-1 text-white font-bold text-sm md:text-base uppercase tracking-wide text-center truncate mx-2">
              {answer.text}
            </span>
            <span className="text-ff-gold font-black text-xl w-12 text-right number-glow">
              {displayPoints}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
