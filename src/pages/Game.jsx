import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import AnswerTile from '../components/AnswerTile';
import StrikeDisplay from '../components/StrikeDisplay';
import ScoreBoard from '../components/ScoreBoard';
import HostControls from '../components/HostControls';

export default function Game() {
  const navigate = useNavigate();
  const { state } = useGame();
  const {
    phase,
    currentQuestion,
    revealedAnswers,
    strikes,
    currentRound,
    totalRounds,
    roundPhase,
    teamNames,
    activeTeam,
  } = state;

  useEffect(() => {
    if (phase === 'fastmoney') navigate('/fastmoney');
    if (phase === 'gameover') navigate('/gameover');
    if (phase === 'home') navigate('/');
  }, [phase, navigate]);

  if (!currentQuestion) return null;

  const isLastRound = currentRound === totalRounds - 1;

  return (
    <div className="min-h-screen bg-ff-blue flex flex-col">
      {/* Header bar */}
      <div className="bg-ff-navy border-b border-blue-800 py-3 px-4 flex items-center justify-between">
        <div className="text-blue-400 text-xs uppercase tracking-widest font-bold">
          Round {currentRound + 1} of {totalRounds}
        </div>
        {isLastRound && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-ff-gold text-xs uppercase tracking-widest font-black"
          >
            ⭐ Double Points
          </motion.div>
        )}
        <div className="text-blue-400 text-xs">
          {revealedAnswers.length}/{currentQuestion.answers.length} revealed
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 p-4 gap-4 max-w-6xl mx-auto w-full">
        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Score board */}
          <ScoreBoard />

          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ff-navy rounded-xl px-6 py-5 border border-blue-700 text-center"
          >
            <div className="text-blue-400 text-xs uppercase tracking-widest mb-2">The Question</div>
            <p className="text-white font-black text-xl md:text-2xl uppercase tracking-wide">
              {currentQuestion.question}
            </p>
          </motion.div>

          {/* Strikes */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-blue-400 text-xs uppercase tracking-widest">Strikes</div>
            <StrikeDisplay strikes={strikes} />
          </div>

          {/* Answer board — always 8 boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <AnswerTile
                key={i}
                answer={currentQuestion.answers[i] || null}
                index={i}
                revealed={revealedAnswers.includes(i)}
                isLastRound={isLastRound}
              />
            ))}
          </div>

          {/* Active team indicator */}
          {roundPhase !== 'roundOver' && roundPhase !== 'faceoff' && (
            <motion.div
              key={activeTeam}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-2 rounded-lg text-sm font-black uppercase tracking-widest ${
                roundPhase === 'steal'
                  ? 'text-ff-gold bg-ff-gold/10 border border-ff-gold'
                  : 'text-blue-300'
              }`}
            >
              {roundPhase === 'steal'
                ? `🔥 ${teamNames[activeTeam]} — Steal Attempt!`
                : `▶ ${teamNames[activeTeam]}'s Turn`}
            </motion.div>
          )}
        </div>

        {/* Host controls sidebar */}
        <div className="lg:w-72 flex flex-col gap-4">
          <div className="text-ff-gold text-xs uppercase tracking-widest font-bold text-center lg:text-left">
            Host Panel
          </div>
          <HostControls />

          <button
            onClick={() => navigate('/')}
            className="text-blue-500 text-xs underline text-center hover:text-blue-300 mt-auto"
          >
            Quit Game
          </button>
        </div>
      </div>
    </div>
  );
}
