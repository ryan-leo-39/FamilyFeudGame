import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function Home() {
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const handleGoHome = () => dispatch({ type: 'GO_HOME' });

  return (
    <div className="min-h-screen bg-ff-blue flex flex-col items-center justify-center p-6">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center relative z-10"
      >
        {/* Logo area */}
        <div className="mb-2">
          <div className="text-ff-gold text-sm tracking-[0.4em] uppercase font-bold mb-2">
            Survey Says...
          </div>
        </div>

        <h1 className="gold-shimmer text-6xl md:text-8xl font-black uppercase tracking-wide drop-shadow-2xl mb-2">
          Family
        </h1>
        <h1 className="gold-shimmer text-6xl md:text-8xl font-black uppercase tracking-wide drop-shadow-2xl mb-8">
          Feud
        </h1>

        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-ff-gold to-transparent mx-auto mb-10" />

        <div className="flex flex-col gap-4 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { handleGoHome(); navigate('/setup'); }}
            className="w-64 py-4 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue text-xl font-black uppercase tracking-wider rounded-lg shadow-lg border-2 border-ff-gold hover:brightness-110 transition-all"
          >
            New Game
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/admin')}
            className="w-64 py-4 bg-transparent text-ff-gold text-xl font-black uppercase tracking-wider rounded-lg shadow-lg border-2 border-ff-gold hover:bg-ff-gold hover:text-ff-blue transition-all"
          >
            Manage Questions
          </motion.button>
        </div>

        <p className="text-blue-300 text-sm mt-10 opacity-60">
          100 people were surveyed...
        </p>
      </motion.div>
    </div>
  );
}
