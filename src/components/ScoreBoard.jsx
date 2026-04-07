import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function ScoreBoard({ showActive = true }) {
  const { state } = useGame();
  const { teamNames, scores, activeTeam, roundPhase } = state;

  return (
    <div className="flex gap-4 w-full max-w-xl mx-auto">
      {[0, 1].map((i) => {
        const isActive = showActive && activeTeam === i && roundPhase !== 'roundOver';
        return (
          <motion.div
            key={i}
            animate={isActive ? { scale: 1.04 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`flex-1 rounded-xl p-4 text-center border-2 transition-all ${
              isActive
                ? 'bg-gradient-to-b from-blue-700 to-blue-900 border-ff-gold shadow-lg shadow-ff-gold/30'
                : 'bg-ff-navy border-blue-700'
            }`}
          >
            <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${isActive ? 'text-ff-gold' : 'text-blue-400'}`}>
              {isActive ? '▶ Playing' : '\u00a0'}
            </div>
            <div className="text-white font-black text-lg uppercase truncate">
              {teamNames[i]}
            </div>
            <div className={`font-black text-4xl number-glow ${isActive ? 'text-ff-gold' : 'text-white'}`}>
              {scores[i]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
