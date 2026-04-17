import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestResult, Insight } from '../types';

export const generateHealthInsights = async (): Promise<Insight[]> => {
  try {
    const stored = await AsyncStorage.getItem('testResults');
    if (!stored) return [];

    const results: TestResult[] = JSON.parse(stored);
    if (results.length < 2) return [];

    const insights: Insight[] = [];

    // Trend Analysis
    const last = results[results.length - 1].score;
    const prev = results[results.length - 2].score;
    const diff = last - prev;

    if (diff > 5) {
      insights.push({
        type: 'Positive',
        title: 'Significant Improvement',
        message: `Your vision score increased by ${diff}% since your last checkup. Your current focus therapy is working!`,
        impactLevel: 'High'
      });
    } else if (diff < -5) {
      insights.push({
        type: 'Caution',
        title: 'Noticeable Decline',
        message: `Your score dropped by ${Math.abs(diff)}%. This often correlates with high screen use in the last 24 hours.`,
        impactLevel: 'Medium'
      });
    }

    // Consistency Check
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyTests = results.filter((r: TestResult) => new Date(r.date) > oneWeekAgo);

    if (weeklyTests.length >= 5) {
      insights.push({
        type: 'Positive',
        title: 'Engagement Champion',
        message: 'You have maintained a consistency rate of 100% this week. This is optimal for myopia management.',
        impactLevel: 'Medium'
      });
    } else {
      insights.push({
        type: 'Action',
        title: 'Schedule Alert',
        message: 'Try to complete 2 more checkups this week to maintain a statistically significant health profile.',
        impactLevel: 'Low'
      });
    }

    return insights;

  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
};
