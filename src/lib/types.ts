export interface Player {
  id: string;
  name: string;
}

export interface Course {
  holeCount: 9 | 18;
  pars: number[];
  name: string;
}

export interface Scores {
  [playerId: string]: (number | undefined)[]; // undefined for holes not yet played/scored
}

export interface GameState {
  players: Player[];
  course: Course | null;
  scores: Scores;
  currentHoleIndex: number; // 0-indexed
}

export type GameAction =
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: { id: string } }
  | { type: 'UPDATE_PLAYER_NAME'; payload: Player }
  | { type: 'SET_COURSE'; payload: Course }
  | { type: 'SET_SCORE'; payload: { playerId: string; holeIndex: number; score: number | undefined } }
  | { type: 'SET_CURRENT_HOLE_INDEX'; payload: number }
  | { type: 'RESET_GAME' };

export interface GameContextType extends GameState {
  dispatch: React.Dispatch<GameAction>;
  getParForHole: (holeIndex: number) => number | undefined;
  getTotalPar: () => number;
  getPlayerTotalScore: (playerId: string) => number;
  getPlayerScoreRelativeToPar: (playerId: string) => string;
  isRoundCompleted: () => boolean;
}
