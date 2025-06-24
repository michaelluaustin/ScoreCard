'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { GameState, GameAction, GameContextType, Player, Course, Scores } from '@/lib/types';

const initialState: GameState = {
  players: [],
  course: null,
  scores: {},
  currentHoleIndex: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_PLAYER':
      if (state.players.length >= 6) return state;
      return {
        ...state,
        players: [...state.players, action.payload],
        scores: {
          ...state.scores,
          [action.payload.id]: state.course ? Array(state.course.holeCount).fill(undefined) : [],
        },
      };
    case 'REMOVE_PLAYER':
      const newPlayers = state.players.filter(p => p.id !== action.payload.id);
      const newScores = { ...state.scores };
      delete newScores[action.payload.id];
      return { ...state, players: newPlayers, scores: newScores };
    case 'UPDATE_PLAYER_NAME':
      return {
        ...state,
        players: state.players.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'SET_COURSE':
      const resetScores: Scores = {};
      state.players.forEach(player => {
        resetScores[player.id] = Array(action.payload.holeCount).fill(undefined);
      });
      return { ...state, course: action.payload, scores: resetScores, currentHoleIndex: 0 };
    case 'SET_SCORE':
      const playerScores = [...(state.scores[action.payload.playerId] || [])];
      playerScores[action.payload.holeIndex] = action.payload.score;
      return {
        ...state,
        scores: {
          ...state.scores,
          [action.payload.playerId]: playerScores,
        },
      };
    case 'SET_CURRENT_HOLE_INDEX':
      return { ...state, currentHoleIndex: action.payload };
    case 'RESET_GAME':
      return { ...initialState, players: [] }; // Keep players or reset fully? For now, full reset.
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'parScoreGameState';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          // Basic validation to ensure shape matches roughly
          if (parsedState.players && parsedState.scores && typeof parsedState.currentHoleIndex === 'number') {
             // Ensure scores has entries for all players if course is set
            if (parsedState.course && parsedState.players.length > 0) {
              parsedState.players.forEach((player: Player) => {
                if (!parsedState.scores[player.id]) {
                  parsedState.scores[player.id] = Array(parsedState.course.holeCount).fill(undefined);
                } else if (parsedState.scores[player.id].length !== parsedState.course.holeCount) {
                   parsedState.scores[player.id] = Array(parsedState.course.holeCount).fill(undefined).map((_, i) => parsedState.scores[player.id][i]);
                }
              });
            }
            return parsedState;
          }
        } catch (error) {
          console.error("Failed to parse state from localStorage", error);
        }
      }
    }
    return initial;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);
  

  const getParForHole = (holeIndex: number): number | undefined => {
    return state.course?.pars[holeIndex];
  };

  const getTotalPar = (): number => {
    return state.course?.pars.reduce((sum, par) => sum + par, 0) || 0;
  };

  const getPlayerTotalScore = (playerId: string): number => {
    return (state.scores[playerId] || []).reduce((sum: number, score) => sum + (score ?? 0), 0);
  };

  const getPlayerScoreRelativeToPar = (playerId: string): string => {
    const totalScore = getPlayerTotalScore(playerId);
    const totalPar = getTotalPar();
    const diff = totalScore - totalPar;
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  const isRoundCompleted = (): boolean => {
    if (!state.course) return false;
    // Check if all scores for all players for all holes are filled
    // For simplicity, let's say round is completed if currentHoleIndex is last hole
    // A more robust check would ensure all scores are entered.
    return state.currentHoleIndex >= state.course.holeCount -1;
  };

  return (
    <GameContext.Provider value={{ ...state, dispatch, getParForHole, getTotalPar, getPlayerTotalScore, getPlayerScoreRelativeToPar, isRoundCompleted }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within an AppProvider');
  }
  return context;
}
