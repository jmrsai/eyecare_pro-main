import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestResult, Recommendation } from '../types';

export const getPersonalizedRecommendation = async (): Promise<Recommendation> => {
  try {
    const stored = await AsyncStorage.getItem('testResults');
    if (!stored) {
      return {
        id: 'morning-reset',
        title: 'Morning Reset',
        intensity: 'Low',
        reason: 'Start your journey with a gentle eye warm-up.',
        targetFocus: 'Flexibility'
      };
    }

    const results: TestResult[] = JSON.parse(stored);
    if (results.length === 0) {
      return {
        id: 'morning-reset',
        title: 'Morning Reset',
        intensity: 'Low',
        reason: 'Foundation training for optimal eye health.',
        targetFocus: 'Warm-up'
      };
    }

    // Get latest score
    const latest = results[results.length - 1].score;

    if (latest < 60) {
      return {
        id: 'vision-therapy',
        title: 'Vision Therapy',
        intensity: 'High',
        reason: 'Your latest score indicates significant eye strain. Intensive recovery recommended.',
        targetFocus: 'Muscle Strength'
      };
    }

    if (latest < 85) {
      return {
        id: 'focus-endurance',
        title: 'Focus Endurance',
        intensity: 'Medium',
        reason: 'Maintaining focus for longer periods will help stabilize your vision scores.',
        targetFocus: 'Accommodation'
      };
    }

    return {
      id: 'post-work-destress',
      title: 'Post-Work De-stress',
      intensity: 'Low',
      reason: 'Excellent vision score! Use this routine to maintain relaxation and clarity.',
      targetFocus: 'Neural Relaxation'
    };

  } catch (error) {
    console.error('Error generating recommendation:', error);
    return {
      id: 'morning-reset',
      title: 'Morning Reset',
      intensity: 'Low',
      reason: 'A reliable baseline for daily eye wellness.',
      targetFocus: 'General Health'
    };
  }
};
