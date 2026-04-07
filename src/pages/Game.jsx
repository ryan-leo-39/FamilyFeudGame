import { useEffect, useState } from 'react';
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

  const [hostPanelOpen, setHostPanelOpen] = useState(false);

  useEffect(() => {
    if (phase === 'fastmoney') navigate('/fastmoney');
    if (phase === 'gameover') navigate('/gameover');
    if (phase === 'home') navigate('/');
  }, [phase, navigate]);

  // Auto-open host panel on phase changes that need host action
  useEffect(() => {
    if (roundPhase === 'steal' || roundPhase === 'roundOver' || roundPhase === 'faceoff') {
      setHostPanelOpen(true);
    }
  }, [roundPhase]);

  if (!currentQuestion) return null;

  const isLastRound = currentRound === totalRounds - 1;

  return (
    <div className="min-h-screen bg-ff-blue flex flex-col">
      {/* Header bar */}
      <div className="bg-ff-navy border-b border-blue-800 py-3 px-4 flex items-center justify-between">
        <div className="text-blue-400 text-xs uppercase tracking-widest font-bold">
          Round {currentRound + 1}/{totalRounds}
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
          {revealedAnswers.length}/{currentQuestion.answers.filter(Boolean).length} revealed
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex flex-1 p-4 gap-4 max-w-6xl mx-auto w-full">
        {/* Main game area */}
        <div className="flex-1 flex flex-col gap-4">
          <ScoreBoard />
          <QuestionBox question={currentQuestion} />
          <StrikesRow strikes={strikes} />
          <AnswerGrid question={currentQuestion} revealedAnswers={revealedAnswers} isLastRound={isLastRound} />
          <ActiveTeamBanner roundPhase={roundPhase} activeTeam={activeTeam} teamNames={teamNames} />
        </div>

        {/* Host sidebar */}
        <div className="w-72 flex flex-col gap-4">
          <div className="text-ff-gold text-xs uppercase tracking-widest font-bold">Host Panel</div>
          <HostControls />
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 text-xs underline text-center hover:text-blue-300 mt-auto"
          >
            Quit Game
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden flex-1 flex flex-col p-3 gap-3 pb-24">
        <ScoreBoard />
        <QuestionBox question={currentQuestion} />
        <StrikesRow strikes={strikes} />
        <AnswerGrid question={currentQuestion} revealedAnswers={revealedAnswers} isLastRound={isLastRound} />
        <ActiveTeamBanner roundPhase={roundPhase} activeTeam={activeTeam} teamNames={teamNames} />
      </div>

      {/* Mobile: floating host button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-2 bg-ff-navy text-blue-400 text-xs font-bold uppercase rounded-full border border-blue-700 shadow-lg"
        >
          Quit
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setHostPanelOpen(true)}
          className={`px-5 py-3 font-black uppercase rounded-full shadow-xl text-sm border-2 ${
            roundPhase === 'steal'
              ? 'bg-ff-gold text-ff-blue border-ff-gold animate-pulse'
              : roundPhase === 'faceoff' || roundPhase === 'roundOver'
              ? 'bg-ff-gold text-ff-blue border-ff-gold'
              : 'bg-ff-tile-revealed text-white border-blue-500'
          }`}
        >
          🎮 Host
        </motion.button>
      </div>

      {/* Mobile: host panel bottom sheet */}
      <AnimatePresence>
        {hostPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHostPanelOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-ff-navy rounded-t-2xl border-t border-blue-700 shadow-2xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-blue-600 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-ff-gold text-xs uppercase tracking-widest font-black">Host Panel</span>
                <button
                  onClick={() => setHostPanelOpen(false)}
                  className="text-blue-400 text-xs uppercase tracking-wider hover:text-white"
                >
                  Close ✕
                </button>
              </div>
              <div className="px-4 pb-8 max-h-[75vh] overflow-y-auto">
                <HostControls onAction={() => {
                  // Auto-close after non-critical actions
                  if (roundPhase === 'playing') setHostPanelOpen(false);
                }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components to avoid duplication between mobile/desktop ---

function QuestionBox({ question }) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ff-navy rounded-xl px-4 py-4 border border-blue-700 text-center"
    >
      <div className="text-blue-400 text-xs uppercase tracking-widest mb-1">The Question</div>
      <p className="text-white font-black text-base sm:text-xl md:text-2xl uppercase tracking-wide leading-tight">
        {question.question}
      </p>
    </motion.div>
  );
}

function StrikesRow({ strikes }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-blue-400 text-xs uppercase tracking-widest">Strikes</div>
      <StrikeDisplay strikes={strikes} />
    </div>
  );
}

function AnswerGrid({ question, revealedAnswers, isLastRound }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <AnswerTile
          key={i}
          answer={question.answers[i] || null}
          index={i}
          revealed={revealedAnswers.includes(i)}
          isLastRound={isLastRound}
        />
      ))}
    </div>
  );
}

function ActiveTeamBanner({ roundPhase, activeTeam, teamNames }) {
  if (roundPhase === 'roundOver' || roundPhase === 'faceoff') return null;
  return (
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
  );
}
