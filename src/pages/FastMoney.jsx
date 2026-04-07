import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useSound } from '../hooks/useSound';

const TIMER_SECONDS = 20;

export default function FastMoney() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { playTimerBeep, playCorrect, playFanfare, playApplause } = useSound();
  const {
    fastMoneyQuestions,
    teamNames,
    scores,
    fastMoneyScores,
    phase,
  } = state;

  // Which team is playing fast money (higher score gets to go)
  const playingTeam = scores[0] >= scores[1] ? 0 : 1;

  // playerRound: 0 = player 1 answering, 1 = player 2 answering, 2 = reveal
  const [playerRound, setPlayerRound] = useState(0);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [answers, setAnswers] = useState(
    fastMoneyQuestions.map(() => ({ text: '', points: 0 }))
  );
  const [currentAnswers, setCurrentAnswers] = useState(
    fastMoneyQuestions.map(() => '')
  );
  const [revealIndex, setRevealIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (phase === 'home') navigate('/');
    if (phase === 'gameover') navigate('/gameover');
  }, [phase, navigate]);

  useEffect(() => {
    if (timerActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 4 && t > 1) playTimerBeep();
          return t - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive, timer]);

  const handleStartTimer = () => {
    setTimer(TIMER_SECONDS);
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
  };

  const handleAnswerChange = (qIndex, val) => {
    const updated = [...currentAnswers];
    updated[qIndex] = val;
    setCurrentAnswers(updated);
  };

  const matchAnswer = (userText, question) => {
    const normalized = userText.toLowerCase().trim();
    if (!normalized) return { matched: false, points: 0, text: userText };
    for (const ans of question.answers) {
      if (
        normalized === ans.text.toLowerCase() ||
        ans.text.toLowerCase().includes(normalized) ||
        normalized.includes(ans.text.toLowerCase().split(' ')[0])
      ) {
        return { matched: true, points: ans.points, text: ans.text };
      }
    }
    return { matched: false, points: 0, text: userText };
  };

  const handleSubmitPlayer = () => {
    const saved = fastMoneyQuestions.map((q, i) => {
      const result = matchAnswer(currentAnswers[i], q);
      return result;
    });

    saved.forEach((ans, i) => {
      dispatch({
        type: 'SAVE_FAST_MONEY_ANSWER',
        payload: { playerIndex: playerRound, questionIndex: i, ...ans },
      });
    });

    setCurrentAnswers(fastMoneyQuestions.map(() => ''));
    setTimerActive(false);

    if (playerRound === 0) {
      setPlayerRound(1);
      setTimer(TIMER_SECONDS);
    } else {
      // Calculate total and reveal
      const p1Total = fastMoneyScores[0].reduce((s, a) => s + (a?.points || 0), 0);
      const p2Total = saved.reduce((s, a) => s + (a?.points || 0), 0);
      const total = p1Total + p2Total;

      if (total >= 200) {
        playFanfare();
      } else {
        playApplause();
      }

      dispatch({
        type: 'ADD_FAST_MONEY_SCORE',
        payload: { team: playingTeam, amount: total },
      });
      setPlayerRound(2);
    }
  };

  const handleRevealNext = () => {
    if (revealIndex < fastMoneyQuestions.length - 1) {
      playCorrect();
      setRevealIndex((r) => r + 1);
    } else {
      setShowResult(true);
    }
  };

  // Reveal phase
  if (playerRound === 2) {
    const p1 = state.fastMoneyScores[0];
    const p2Saved = fastMoneyQuestions.map((q, i) => {
      const stored = state.fastMoneyScores[1]?.[i];
      return stored || { text: '(no answer)', points: 0 };
    });
    const total = [...(p1 || []), ...p2Saved].reduce((s, a) => s + (a?.points || 0), 0);

    return (
      <div className="min-h-screen bg-ff-blue flex flex-col items-center justify-center p-4">
        <h2 className="gold-shimmer text-4xl font-black uppercase mb-6">Fast Money Results</h2>
        <div className="w-full max-w-2xl space-y-3 mb-8">
          {fastMoneyQuestions.map((q, i) => {
            const p1a = p1?.[i];
            const p2a = p2Saved[i];
            const shown = i <= revealIndex;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={shown ? { opacity: 1, x: 0 } : {}}
                className={`bg-ff-navy rounded-xl p-4 border ${shown ? 'border-ff-gold' : 'border-blue-800'}`}
              >
                <p className="text-blue-300 text-sm mb-2 uppercase tracking-wide font-bold">{q.question}</p>
                {shown && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-ff-tile rounded-lg p-2 text-center">
                      <div className="text-blue-400 text-xs mb-1">Player 1</div>
                      <div className="text-white font-bold text-sm">{p1a?.text || '—'}</div>
                      <div className="text-ff-gold font-black">{p1a?.points || 0} pts</div>
                    </div>
                    <div className="bg-ff-tile rounded-lg p-2 text-center">
                      <div className="text-blue-400 text-xs mb-1">Player 2</div>
                      <div className="text-white font-bold text-sm">{p2a?.text || '—'}</div>
                      <div className="text-ff-gold font-black">{p2a?.points || 0} pts</div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {!showResult ? (
          <button
            onClick={handleRevealNext}
            className="px-8 py-4 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue font-black uppercase rounded-xl text-xl"
          >
            {revealIndex === -1 ? 'Start Reveal' : revealIndex < fastMoneyQuestions.length - 1 ? 'Next →' : 'Show Total'}
          </button>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-center"
          >
            <div className={`text-6xl font-black number-glow mb-2 ${total >= 200 ? 'text-ff-gold' : 'text-white'}`}>
              {total} pts
            </div>
            <div className={`text-xl font-black uppercase mb-6 ${total >= 200 ? 'text-ff-gold' : 'text-blue-300'}`}>
              {total >= 200 ? '🎉 Big Winner! 200+ Points!' : 'Nice Try!'}
            </div>
            <button
              onClick={() => { dispatch({ type: 'END_GAME' }); navigate('/gameover'); }}
              className="px-8 py-4 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue font-black uppercase rounded-xl"
            >
              See Final Scores →
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  // Answering phase
  return (
    <div className="min-h-screen bg-ff-blue flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <h2 className="gold-shimmer text-4xl font-black uppercase text-center mb-2">
          Fast Money
        </h2>
        <div className="text-center text-blue-300 text-sm mb-6 uppercase tracking-widest">
          {teamNames[playingTeam]} — Player {playerRound + 1}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className={`text-6xl font-black number-glow ${
              timer <= 5 ? 'timer-warning' : 'text-ff-gold'
            }`}
          >
            {timer}
          </div>
          {!timerActive ? (
            <button
              onClick={handleStartTimer}
              className="px-4 py-2 bg-ff-green text-white font-black uppercase rounded-lg border border-green-500 text-sm"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="px-4 py-2 bg-ff-red text-white font-black uppercase rounded-lg border border-red-500 text-sm"
            >
              Stop
            </button>
          )}
        </div>

        {/* Questions & answers */}
        <div className="space-y-3 mb-6">
          {fastMoneyQuestions.map((q, i) => (
            <div key={i} className="bg-ff-navy rounded-xl p-4 border border-blue-800">
              <p className="text-white font-bold text-sm uppercase tracking-wide mb-2">
                {i + 1}. {q.question}
              </p>
              <input
                type="text"
                value={currentAnswers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                placeholder="Type answer here..."
                className="w-full bg-ff-tile text-white px-3 py-2 rounded-lg border border-blue-700 focus:border-ff-gold focus:outline-none text-sm"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmitPlayer}
          className="w-full py-4 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue font-black uppercase rounded-xl text-xl"
        >
          {playerRound === 0 ? 'Submit Player 1 Answers →' : 'Submit Player 2 & Reveal →'}
        </button>
      </div>
    </div>
  );
}
