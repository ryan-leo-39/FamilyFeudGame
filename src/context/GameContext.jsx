import { createContext, useContext, useReducer } from 'react';
import { sampleQuestions, sampleFastMoneyQuestions } from '../data/sampleQuestions';

const GameContext = createContext(null);

const initialState = {
  // Setup
  teamNames: ['Team 1', 'Team 2'],
  totalRounds: 3,
  includeFastMoney: true,

  // Questions
  questions: [],         // regular round questions
  fastMoneyQuestions: [], // fast money questions

  // Game state
  phase: 'home', // home | setup | game | fastmoney | gameover
  currentRound: 0,
  scores: [0, 0],
  fastMoneyScores: [[], []],  // player1 and player2 answers [{text, points}]

  // Round state
  currentQuestion: null,
  revealedAnswers: [],   // indices of revealed answers
  strikes: 0,
  activeTeam: 0,         // 0 or 1 — who is currently playing
  roundPhase: 'faceoff', // faceoff | playing | steal | roundOver
  roundPoints: 0,        // accumulated points in this round
  faceoffWinner: null,   // which team won the faceoff
};

function gameReducer(state, action) {
  switch (action.type) {

    case 'SET_SETUP': {
      const { teamNames, totalRounds, includeFastMoney } = action.payload;
      return { ...state, teamNames, totalRounds, includeFastMoney };
    }

    case 'START_GAME': {
      const { questions, fastMoneyQuestions } = action.payload;
      return {
        ...state,
        questions,
        fastMoneyQuestions,
        phase: 'game',
        currentRound: 0,
        scores: [0, 0],
        fastMoneyScores: [[], []],
        currentQuestion: questions[0] || null,
        revealedAnswers: [],
        strikes: 0,
        activeTeam: 0,
        roundPhase: 'faceoff',
        roundPoints: 0,
        faceoffWinner: null,
      };
    }

    case 'START_ROUND': {
      const q = state.questions[state.currentRound] || null;
      return {
        ...state,
        currentQuestion: q,
        revealedAnswers: [],
        strikes: 0,
        activeTeam: action.payload?.activeTeam ?? state.activeTeam,
        roundPhase: 'faceoff',
        roundPoints: 0,
        faceoffWinner: null,
      };
    }

    case 'FACEOFF_WIN': {
      // The team that won the faceoff gets to play
      return {
        ...state,
        activeTeam: action.payload.team,
        faceoffWinner: action.payload.team,
        roundPhase: 'playing',
      };
    }

    case 'REVEAL_ANSWER': {
      const { index } = action.payload;
      if (state.revealedAnswers.includes(index)) return state;
      const answer = state.currentQuestion.answers[index];
      const multiplier = state.currentRound === state.totalRounds - 1 ? 2 : 1;
      const pts = answer.points * multiplier;
      return {
        ...state,
        revealedAnswers: [...state.revealedAnswers, index],
        roundPoints: state.roundPoints + pts,
      };
    }

    case 'ADD_STRIKE': {
      const newStrikes = state.strikes + 1;
      if (newStrikes >= 3) {
        // Give other team a chance to steal
        const otherTeam = state.activeTeam === 0 ? 1 : 0;
        return {
          ...state,
          strikes: newStrikes,
          roundPhase: 'steal',
          activeTeam: otherTeam,
        };
      }
      return { ...state, strikes: newStrikes };
    }

    case 'STEAL_SUCCESS': {
      const winTeam = state.activeTeam;
      const multiplier = state.currentRound === state.totalRounds - 1 ? 2 : 1;
      const revealedPts = state.currentQuestion.answers.reduce((sum, ans, i) => {
        if (state.revealedAnswers.includes(i)) return sum + ans.points * multiplier;
        return sum;
      }, 0);
      const newScores = [...state.scores];
      newScores[winTeam] += revealedPts;
      return {
        ...state,
        scores: newScores,
        roundPhase: 'roundOver',
      };
    }

    case 'STEAL_FAIL': {
      // Points go to original playing team (faceoff winner)
      const winTeam = state.faceoffWinner ?? (state.activeTeam === 0 ? 1 : 0);
      const multiplier = state.currentRound === state.totalRounds - 1 ? 2 : 1;
      const revealedPts = state.currentQuestion.answers.reduce((sum, ans, i) => {
        if (state.revealedAnswers.includes(i)) return sum + ans.points * multiplier;
        return sum;
      }, 0);
      const newScores = [...state.scores];
      newScores[winTeam] += revealedPts;
      return {
        ...state,
        scores: newScores,
        roundPhase: 'roundOver',
      };
    }

    case 'AWARD_ROUND': {
      // All answers revealed — award to active team
      const newScores = [...state.scores];
      newScores[state.activeTeam] += state.roundPoints;
      return {
        ...state,
        scores: newScores,
        roundPhase: 'roundOver',
      };
    }

    case 'NEXT_ROUND': {
      const nextRound = state.currentRound + 1;
      if (nextRound >= state.totalRounds) {
        // Game over or fast money
        if (state.includeFastMoney) {
          return { ...state, phase: 'fastmoney', currentRound: nextRound };
        }
        return { ...state, phase: 'gameover', currentRound: nextRound };
      }
      return {
        ...state,
        currentRound: nextRound,
        currentQuestion: state.questions[nextRound] || null,
        revealedAnswers: [],
        strikes: 0,
        roundPhase: 'faceoff',
        roundPoints: 0,
        faceoffWinner: null,
      };
    }

    case 'SKIP_FAST_MONEY': {
      return { ...state, phase: 'gameover' };
    }

    case 'SAVE_FAST_MONEY_ANSWER': {
      const { playerIndex, questionIndex, text, points } = action.payload;
      const newFM = state.fastMoneyScores.map((player, pi) => {
        if (pi !== playerIndex) return player;
        const updated = [...player];
        updated[questionIndex] = { text, points };
        return updated;
      });
      return { ...state, fastMoneyScores: newFM };
    }

    case 'ADD_FAST_MONEY_SCORE': {
      const { team, amount } = action.payload;
      const newScores = [...state.scores];
      newScores[team] += amount;
      return { ...state, scores: newScores };
    }

    case 'END_GAME': {
      return { ...state, phase: 'gameover' };
    }

    case 'GO_HOME': {
      return { ...initialState };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load questions from localStorage or fall back to sample data
  const loadQuestions = () => {
    try {
      const stored = localStorage.getItem('ff-questions');
      return stored ? JSON.parse(stored) : sampleQuestions;
    } catch {
      return sampleQuestions;
    }
  };

  const loadFastMoneyQuestions = () => {
    try {
      const stored = localStorage.getItem('ff-fastmoney-questions');
      return stored ? JSON.parse(stored) : sampleFastMoneyQuestions;
    } catch {
      return sampleFastMoneyQuestions;
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, loadQuestions, loadFastMoneyQuestions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
