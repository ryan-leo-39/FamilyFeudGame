import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSound } from '../hooks/useSound';

export default function GameOver() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { playFanfare } = useSound();
  const { teamNames, scores } = state;

  const winner = scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : null;

  useEffect(() => {
    setTimeout(() => playFanfare(), 400);
  }, []);

  return (
    <div className="min-h-screen bg-ff-blue flex flex-col items-center justify-center p-6">
      {/* Confetti dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              background: ['#f5a623', '#2563eb', '#fff', '#c0392b', '#27ae60'][i % 5],
              left: Math.random() * 100 + '%',
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center relative z-10 max-w-md w-full"
      >
        <div className="text-ff-gold text-sm uppercase tracking-widest mb-2">Game Over</div>

        {winner !== null ? (
          <>
            <h1 className="gold-shimmer text-5xl font-black uppercase mb-1">
              {teamNames[winner]}
            </h1>
            <div className="text-white text-xl font-bold mb-8">Wins! 🎉</div>
          </>
        ) : (
          <h1 className="text-white text-5xl font-black uppercase mb-8">It's a Tie!</h1>
        )}

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className={`rounded-2xl p-5 border-2 ${
                winner === i
                  ? 'bg-gradient-to-b from-ff-gold/20 to-ff-gold/5 border-ff-gold'
                  : 'bg-ff-navy border-blue-700'
              }`}
            >
              {winner === i && (
                <div className="text-ff-gold text-xs uppercase tracking-widest mb-1">Winner</div>
              )}
              <div className="text-white font-black text-lg uppercase">{teamNames[i]}</div>
              <div className={`font-black text-5xl number-glow ${winner === i ? 'text-ff-gold' : 'text-white'}`}>
                {scores[i]}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { dispatch({ type: 'GO_HOME' }); navigate('/'); }}
          className="w-full py-4 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue text-xl font-black uppercase tracking-wider rounded-xl shadow-xl border-2 border-ff-gold"
        >
          Play Again
        </motion.button>
      </motion.div>
    </div>
  );
}
