import { useGame } from '../context/GameContext';
import { useSound } from '../hooks/useSound';
import { motion } from 'framer-motion';

export default function HostControls() {
  const { state, dispatch } = useGame();
  const { playCorrect, playWrong, playSteal, playApplause } = useSound();
  const {
    currentQuestion,
    revealedAnswers,
    strikes,
    roundPhase,
    teamNames,
    activeTeam,
    faceoffWinner,
    currentRound,
    totalRounds,
  } = state;

  if (!currentQuestion) return null;

  const allRevealed = revealedAnswers.length === currentQuestion.answers.length;
  const isLastRound = currentRound === totalRounds - 1;

  const handleReveal = (index) => {
    if (revealedAnswers.includes(index)) return;
    playCorrect();
    dispatch({ type: 'REVEAL_ANSWER', payload: { index } });
  };

  const handleStrike = () => {
    playWrong();
    dispatch({ type: 'ADD_STRIKE' });
  };

  const handleAwardRound = () => {
    playApplause();
    dispatch({ type: 'AWARD_ROUND' });
  };

  const handleStealSuccess = () => {
    playApplause();
    dispatch({ type: 'STEAL_SUCCESS' });
  };

  const handleStealFail = () => {
    playWrong();
    dispatch({ type: 'STEAL_FAIL' });
  };

  const handleFaceoffWin = (team) => {
    dispatch({ type: 'FACEOFF_WIN', payload: { team } });
  };

  if (roundPhase === 'faceoff') {
    return (
      <div className="bg-ff-navy rounded-xl p-4 border border-blue-800">
        <div className="text-ff-gold text-sm uppercase tracking-widest font-bold mb-3 text-center">
          Face-Off — Who answers first?
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => handleFaceoffWin(i)}
              className="py-3 bg-ff-tile-revealed text-white font-black uppercase rounded-lg border border-blue-500 hover:border-ff-gold hover:bg-blue-600 transition-all"
            >
              {teamNames[i]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (roundPhase === 'steal') {
    return (
      <div className="bg-ff-navy rounded-xl p-4 border border-ff-gold steal-banner">
        <div className="text-ff-gold text-sm uppercase tracking-widest font-bold mb-1 text-center">
          STEAL OPPORTUNITY
        </div>
        <div className="text-blue-200 text-xs text-center mb-3">
          {teamNames[activeTeam]} — give one answer to steal!
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleStealSuccess}
            className="py-3 bg-ff-green text-white font-black uppercase rounded-lg border border-green-400 hover:brightness-110 transition-all"
          >
            Steal Success!
          </button>
          <button
            onClick={handleStealFail}
            className="py-3 bg-ff-red text-white font-black uppercase rounded-lg border border-red-400 hover:brightness-110 transition-all"
          >
            Steal Failed
          </button>
        </div>
      </div>
    );
  }

  if (roundPhase === 'roundOver') {
    return (
      <div className="bg-ff-navy rounded-xl p-4 border border-blue-800">
        <div className="text-ff-gold text-sm uppercase tracking-widest font-bold mb-3 text-center">
          Round Over
        </div>
        <button
          onClick={() => dispatch({ type: 'NEXT_ROUND' })}
          className="w-full py-3 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue font-black uppercase rounded-lg hover:brightness-110 transition-all"
        >
          {currentRound + 1 >= totalRounds
            ? state.includeFastMoney
              ? 'Fast Money Round →'
              : 'See Final Score →'
            : 'Next Round →'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-ff-navy rounded-xl p-4 border border-blue-800 space-y-4">
      <div className="text-ff-gold text-xs uppercase tracking-widest font-bold text-center">
        Host Controls — {isLastRound ? '⭐ Double Points Round' : `Round ${currentRound + 1} of ${totalRounds}`}
      </div>

      {/* Answer buttons */}
      <div className="space-y-2">
        <div className="text-blue-300 text-xs uppercase tracking-wider font-bold">Reveal Answer</div>
        <div className="grid grid-cols-2 gap-2">
          {currentQuestion.answers.map((ans, i) => {
            const isRevealed = revealedAnswers.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleReveal(i)}
                disabled={isRevealed}
                className={`py-2 px-3 rounded-lg text-sm font-bold uppercase text-left transition-all flex items-center gap-2 ${
                  isRevealed
                    ? 'bg-ff-green text-white border border-green-500 opacity-70 cursor-default'
                    : 'bg-ff-tile text-white border border-blue-600 hover:border-ff-gold hover:bg-blue-800'
                }`}
              >
                <span className="text-xs opacity-60">{i + 1}.</span>
                <span className="truncate text-xs">{ans.text}</span>
                {isRevealed && <span className="ml-auto text-green-300 text-xs">{ans.points}pts</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Strike button */}
      <div className="flex gap-3">
        <button
          onClick={handleStrike}
          disabled={strikes >= 3}
          className="flex-1 py-3 bg-ff-red text-white font-black uppercase rounded-lg border border-red-500 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-default"
        >
          ✗ Strike ({strikes}/3)
        </button>
        {allRevealed && (
          <button
            onClick={handleAwardRound}
            className="flex-1 py-3 bg-ff-green text-white font-black uppercase rounded-lg border border-green-500 hover:brightness-110 transition-all"
          >
            Award Points
          </button>
        )}
      </div>
    </div>
  );
}
