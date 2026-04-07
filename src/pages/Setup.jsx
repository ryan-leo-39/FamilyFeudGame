import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function Setup() {
  const navigate = useNavigate();
  const { state, dispatch, loadQuestions, loadFastMoneyQuestions } = useGame();

  const [teamNames, setTeamNames] = useState(state.teamNames);
  const [totalRounds, setTotalRounds] = useState(state.totalRounds);
  const [includeFastMoney, setIncludeFastMoney] = useState(state.includeFastMoney);

  const handleStart = () => {
    const allQuestions = loadQuestions();
    const fmQuestions = loadFastMoneyQuestions();

    // Shuffle and pick enough questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, totalRounds);

    if (picked.length < totalRounds) {
      alert(`Not enough questions! You only have ${picked.length} question(s) but need ${totalRounds}. Please add more in the Question Manager.`);
      return;
    }

    dispatch({ type: 'SET_SETUP', payload: { teamNames, totalRounds, includeFastMoney } });
    dispatch({
      type: 'START_GAME',
      payload: { questions: picked, fastMoneyQuestions: fmQuestions.slice(0, 5) },
    });
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-ff-blue flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <button
          onClick={() => navigate('/')}
          className="text-ff-gold text-sm mb-6 hover:underline"
        >
          ← Back
        </button>

        <h2 className="gold-shimmer text-3xl sm:text-4xl font-black uppercase text-center mb-6 sm:mb-8">
          Game Setup
        </h2>

        <div className="bg-ff-navy rounded-2xl p-4 sm:p-6 border border-blue-800 space-y-5 sm:space-y-6">
          {/* Team Names */}
          <div>
            <label className="text-ff-gold text-sm uppercase tracking-widest font-bold block mb-3">
              Team Names
            </label>
            <div className="grid grid-cols-2 gap-4">
              {teamNames.map((name, i) => (
                <div key={i}>
                  <div className="text-blue-300 text-xs mb-1">Team {i + 1}</div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...teamNames];
                      updated[i] = e.target.value;
                      setTeamNames(updated);
                    }}
                    maxLength={20}
                    className="w-full bg-ff-tile text-white font-bold px-4 py-3 rounded-lg border border-blue-700 focus:border-ff-gold focus:outline-none text-center text-lg uppercase tracking-wide"
                    placeholder={`Team ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Number of Rounds */}
          <div>
            <label className="text-ff-gold text-sm uppercase tracking-widest font-bold block mb-3">
              Number of Rounds
              <span className="text-blue-300 normal-case tracking-normal font-normal ml-2 text-xs">
                (last round = double points)
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setTotalRounds(n)}
                  className={`py-3 rounded-lg font-black text-lg border-2 transition-all ${
                    totalRounds === n
                      ? 'bg-ff-gold text-ff-blue border-ff-gold'
                      : 'bg-ff-tile text-white border-blue-700 hover:border-ff-gold'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Fast Money Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-ff-gold text-sm uppercase tracking-widest font-bold">
                Fast Money Round
              </div>
              <div className="text-blue-300 text-xs mt-1">
                Bonus round after the game
              </div>
            </div>
            <button
              onClick={() => setIncludeFastMoney(!includeFastMoney)}
              className={`relative w-16 h-8 rounded-full transition-all border-2 ${
                includeFastMoney ? 'bg-ff-gold border-ff-gold' : 'bg-ff-tile border-blue-700'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  includeFastMoney ? 'left-9' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="w-full mt-6 py-5 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue text-2xl font-black uppercase tracking-wider rounded-xl shadow-xl border-2 border-ff-gold"
        >
          Start Game!
        </motion.button>
      </motion.div>
    </div>
  );
}
