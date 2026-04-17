import { create } from 'zustand';

interface VisionState {
  dailyBlinks: number;
  totalTrainingTime: number;
  lastSessionScore: number;
  gameScores: Record<string, number[]>;
  
  // Actions
  addBlink: () => void;
  updateTrainingTime: (seconds: number) => void;
  addGameScore: (gameId: string, score: number) => void;
  resetDailyStats: () => void;
}

export const useVisionStore = create<VisionState>((set) => ({
  dailyBlinks: 0,
  totalTrainingTime: 0,
  lastSessionScore: 0,
  gameScores: {},

  addBlink: () => set((state) => ({ dailyBlinks: state.dailyBlinks + 1 })),
  
  updateTrainingTime: (seconds) => set((state) => ({ 
    totalTrainingTime: state.totalTrainingTime + seconds 
  })),
  
  addGameScore: (gameId, score) => set((state) => ({
    lastSessionScore: score,
    gameScores: {
      ...state.gameScores,
      [gameId]: [...(state.gameScores[gameId] || []), score]
    }
  })),
  
  resetDailyStats: () => set({ dailyBlinks: 0 })
}));
