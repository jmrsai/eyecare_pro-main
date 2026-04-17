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

        // Diagnostic Pipeline Parameters
        const recent = results.slice(0, 10);
        const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        
        let insights = [];
        const concerns = results.filter(r => r.status === 'concern');
        const attention = results.filter(r => r.status === 'attention');

        // Rule 1: Visual Fatigue Detection
        const lateNightTests = results.filter(r => {
          const hour = new Date(r.date).getHours();
          return hour > 21 || hour < 6;
        });
        if (lateNightTests.length >= 3 && lateNightTests.some(r => r.score < 85)) {
          insights.push('AI detected signs of digital eye strain during late-night usage. Activate Blue Light filter.');
        }

        // Rule 2: Asymmetry & Astigmatism
        if (results.some(r => r.type === 'Astigmatism' && r.status === 'concern')) {
          insights.push('Detected significant focal asymmetry. This may indicate uncorrected astigmatism.');
        }

        // Rule 3: Macular Health Monitoring
        if (results.some(r => r.type === 'Amsler Grid' && r.status === 'concern')) {
          insights.push('URGENT: Distortions detected in Amsler Grid. Please consult an ophthalmologist for a macular check.');
        }

        // Rule 4: Neurological & Pupil Health
        const lowPupilResponse = results.find(r => r.type === 'Pupil Response' && r.score < 15);
        if (lowPupilResponse) {
          insights.push('Pupil response speed is below optimal threshold. Could indicate fatigue or neurological stress.');
        }

        // Default medical advice
        if (insights.length === 0) {
          insights.push('Diagnostic metrics are within normal clinical ranges. Continue daily monitoring.');
        }

        set({ 
          wellnessScore: Math.round(avgScore),
          aiInsights: insights.slice(0, 3) // Show top 3 most relevant insights
        });
      },
    }),
    {
      name: 'eyecare-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
