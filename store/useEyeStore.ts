import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTestResult } from '../lib/firebase';

interface TestResult {
  id: string;
  type: string;
  score: number;
  date: string;
  details?: string;
  status: 'normal' | 'attention' | 'concern';
}

interface EyeStore {
  results: TestResult[];
  dailyProgress: number; 
  streak: number;
  wellnessScore: number;
  aiInsights: string[];
  addResult: (result: Omit<TestResult, 'id'>, userId?: string) => Promise<void>;
  updateDailyProgress: (points: number) => void;
  runAIAnalysis: () => void;
}

export const useEyeStore = create<EyeStore>()(
  persist(
    (set, get) => ({
      results: [],
      dailyProgress: 0,
      streak: 0,
      wellnessScore: 100,
      aiInsights: ['Start your first diagnostic test to get AI insights.'],
      
      addResult: async (result, userId) => {
        const newResult = { ...result, id: Date.now().toString() };
        set((state) => ({
          results: [newResult, ...state.results]
        }));
        
        // Background Firebase Sync
        if (userId) {
          try {
            await saveTestResult(userId, newResult);
          } catch (e) {
            console.error('Firebase sync failed, result saved locally:', e);
          }
        }
        
        get().runAIAnalysis();
      },

      updateDailyProgress: (points) => set((state) => ({
        dailyProgress: Math.min(100, state.dailyProgress + points)
      })),

      runAIAnalysis: () => {
        const { results } = get();
        if (results.length === 0) return;

        const recent = results.slice(0, 5);
        const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        
        let insights = [];
        if (avgScore < 80) insights.push('Recent tests show a slight decline in visual clarity. Recommend a 20-20-20 routine.');
        if (results.some(r => r.type === 'Astigmatism' && r.status === 'concern')) {
          insights.push('AI detected potential focal asymmetry. Schedule a professional refraction check.');
        }

        set({ 
          wellnessScore: Math.round(avgScore),
          aiInsights: insights.length > 0 ? insights : ['Your vision metrics are stable. Great job!']
        });
      },
    }),
    {
      name: 'eyecare-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
