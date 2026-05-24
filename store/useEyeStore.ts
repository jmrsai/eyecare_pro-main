import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveTestResult } from '../lib/firebase';

export interface TestResult {
  id: string;
  type: string;
  score: number;
  date: string;
  details?: string;
  status: 'normal' | 'attention' | 'concern';
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  route: string;
  category: 'test' | 'exercise' | 'therapy' | 'medication';
}

interface EyeStore {
  results: TestResult[];
  dailyProgress: number; 
  streak: number;
  wellnessScore: number;
  aiInsights: string[];
  dailyTasks: DailyTask[];
  lastActiveDate: string;
  addResult: (result: Omit<TestResult, 'id'>, userId?: string) => Promise<void>;
  updateDailyProgress: (points: number) => void;
  runAIAnalysis: () => void;
  completeTask: (taskId: string) => void;
  checkDailyReset: () => void;
}

export const useEyeStore = create<EyeStore>()(
  persist(
    (set, get) => ({
      results: [],
      dailyProgress: 0,
      streak: 0,
      wellnessScore: 100,
      aiInsights: ['Start your first diagnostic test to get AI insights.'],
      lastActiveDate: new Date().toDateString(),
      
      dailyTasks: [
        { id: 'task-photo', title: 'AI Eye Photo Scan', description: 'Scan your eye using the QCNN visual model', points: 30, completed: false, route: '/tests/photo-scan', category: 'test' },
        { id: 'task-acuity', title: 'Visual Acuity Test', description: 'Screen eye sharpness with Snellen chart', points: 25, completed: false, route: '/tests/visual-acuity', category: 'test' },
        { id: 'task-gamma', title: '40Hz Neuro-Sync', description: 'Complete a 40Hz Gamma brain stimulation session', points: 35, completed: false, route: '/training/games/gamma-therapy', category: 'therapy' },
        { id: 'task-symptoms', title: 'Symptom Logger', description: 'Complete symptom questions to log eye stress', points: 15, completed: false, route: '/tests/symptoms', category: 'medication' }
      ],
      
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
        
        // Automatically check off corresponding daily task
        if (result.type === 'AI Photo Scan' || result.type === 'Photo Scan' || result.type === 'Ocular Photo Scan') {
          get().completeTask('task-photo');
        } else if (result.type === 'Visual Acuity') {
          get().completeTask('task-acuity');
        } else if (result.type === 'Pupil Response' || result.type === 'Gamma Therapy') {
          get().completeTask('task-gamma');
        } else if (result.type === 'Symptom Scan' || result.type === 'Symptoms') {
          get().completeTask('task-symptoms');
        }
        
        get().runAIAnalysis();
      },

      updateDailyProgress: (points) => set((state) => ({
        dailyProgress: Math.min(100, state.dailyProgress + points)
      })),

      completeTask: (taskId) => {
        set((state) => {
          let pointsAdded = 0;
          const updatedTasks = state.dailyTasks.map(t => {
            if (t.id === taskId && !t.completed) {
              pointsAdded = t.points;
              return { ...t, completed: true };
            }
            return t;
          });
          
          const newProgress = Math.min(100, state.dailyProgress + pointsAdded);
          
          // Increment streak if daily progress reaches 100%
          let newStreak = state.streak;
          if (newProgress >= 100 && state.dailyProgress < 100) {
            newStreak += 1;
          }
          
          return {
            dailyTasks: updatedTasks,
            dailyProgress: newProgress,
            streak: newStreak
          };
        });
      },

      checkDailyReset: () => {
        const today = new Date().toDateString();
        const { lastActiveDate, streak, results } = get();
        
        if (lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          // Check if any test was done yesterday
          const hadActivityYesterday = results.some(r => new Date(r.date).toDateString() === yesterdayStr);
          
          let newStreak = streak;
          if (!hadActivityYesterday && lastActiveDate !== yesterdayStr) {
            newStreak = 0; // reset streak if missed a full day
          }
          
          set((state) => ({
            dailyProgress: 0,
            streak: newStreak,
            lastActiveDate: today,
            dailyTasks: state.dailyTasks.map(t => ({ ...t, completed: false }))
          }));
        }
      },

      runAIAnalysis: () => {
        const { results } = get();
        if (results.length === 0) return;

        const recent = results.slice(0, 10);
        const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        
        let insights = [];
        const concerns = results.filter(r => r.status === 'concern');
        const attention = results.filter(r => r.status === 'attention');

        const lateNightTests = results.filter(r => {
          const hour = new Date(r.date).getHours();
          return hour > 21 || hour < 6;
        });
        if (lateNightTests.length >= 3 && lateNightTests.some(r => r.score < 85)) {
          insights.push('AI detected signs of digital eye strain during late-night usage. Activate Blue Light filter.');
        }

        if (results.some(r => r.type === 'Astigmatism' && r.status === 'concern')) {
          insights.push('Detected significant focal asymmetry. This may indicate uncorrected astigmatism.');
        }

        if (results.some(r => r.type === 'Amsler Grid' && r.status === 'concern')) {
          insights.push('URGENT: Distortions detected in Amsler Grid. Please consult an ophthalmologist for a macular check.');
        }

        const lowPupilResponse = results.find(r => r.type === 'Pupil Response' && r.score < 15);
        if (lowPupilResponse) {
          insights.push('Pupil response speed is below optimal threshold. Could indicate fatigue or neurological stress.');
        }

        if (insights.length === 0) {
          insights.push('Diagnostic metrics are within normal clinical ranges. Continue daily monitoring.');
        }

        set({ 
          wellnessScore: Math.round(avgScore),
          aiInsights: insights.slice(0, 3)
        });
      },
    }),
    {
      name: 'eyecare-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
