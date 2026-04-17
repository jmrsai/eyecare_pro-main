import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Clock, Target, Eye, Zap, Moon, Sun, TrendingUp, Play, Wind } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExerciseProgram {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: any;
  color: string;
  exercises: string[];
  route: string;
}

const EXERCISE_PROGRAMS: ExerciseProgram[] = [
  {
    id: 'quick-break',
    title: 'Quick Screen Break',
    description: 'Perfect 2-minute break during work',
    duration: '2 min',
    difficulty: 'Beginner',
    icon: Zap,
    color: '#06B6D4',
    exercises: ['Rapid Blinking', 'Figure-8 Tracking', 'Near-Far Focus'],
    route: '/exercises/quick-break',
  },
  {
    id: 'eye-yoga',
    title: 'Eye Yoga & Relaxation',
    description: 'Ancient techniques to relax and strengthen eyes',
    duration: '4 min',
    difficulty: 'Beginner',
    icon: Wind,
    color: '#8B5CF6',
    exercises: ['Palming', 'Sideways Look', 'Up-Down Look', 'Rotational View'],
    route: '/exercises/eye-yoga',
  },
  {
    id: 'digital-detox',
    title: 'Digital Eye Strain Relief',
    description: 'Combat screen fatigue with targeted exercises',
    duration: '8 min',
    difficulty: 'Beginner',
    icon: Eye,
    color: '#3B82F6',
    exercises: ['20-20-20 Rule', 'Palming', 'Focus Shifts', 'Eye Massage'],
    route: '/exercises/digital-detox',
  },
  {
    id: 'morning-reset',
    title: '5-Minute Morning Reset',
    description: 'Start your day with gentle eye awakening exercises',
    duration: '5 min',
    difficulty: 'Beginner',
    icon: Sun,
    color: '#F59E0B',
    exercises: ['Palming', 'Gentle Blinking', 'Focus Shifts', 'Eye Circles'],
    route: '/exercises/morning-reset',
  },
  {
    id: 'focus-endurance',
    title: 'Focus Endurance Training',
    description: 'Build stronger focusing muscles for sustained work',
    duration: '12 min',
    difficulty: 'Intermediate',
    icon: Target,
    color: '#10B981',
    exercises: ['Pencil Pushups', 'Saccadic Training', 'Vergence Exercises', 'Tracking'],
    route: '/exercises/focus-endurance',
  },
  {
    id: 'post-work-destress',
    title: 'Post-Work De-Stresser',
    description: 'Unwind and relax tired eyes after a long day',
    duration: '10 min',
    difficulty: 'Beginner',
    icon: Moon,
    color: '#8B5CF6',
    exercises: ['Deep Palming', 'Slow Blinking', 'Distance Gazing', 'Relaxation'],
    route: '/exercises/post-work-destress',
  },
  {
    id: 'vision-therapy',
    title: 'Clinical Vision Therapy',
    description: 'Structured exercises for vision improvement',
    duration: '15 min',
    difficulty: 'Advanced',
    icon: Dumbbell,
    color: '#EF4444',
    exercises: ['Convergence Training', 'Divergence Exercises', 'Pursuit Training', 'Fixation'],
    route: '/exercises/vision-therapy',
  },
];

export default function ExercisesScreen() {
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    loadExerciseStats();
  }, []);

  const loadExerciseStats = async () => {
    try {
      const stats = await AsyncStorage.getItem('exerciseStats');
      if (stats) {
        const parsed = JSON.parse(stats);
        setWeeklyStreak(parsed.weeklyStreak || 0);
        setTotalMinutes(parsed.totalMinutes || 0);
        
        const today = new Date().toDateString();
        setCompletedToday(parsed.lastCompletedDate === today);
      }
    } catch (error) {
      console.error('Error loading exercise stats:', error);
    }
  };

  const handleProgramPress = (route: string) => {
    router.push(route as any);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>FocusFlow Eye Gym</Text>
        <Text style={styles.headerSubtitle}>Your personal eye fitness trainer</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statNumber}>{weeklyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color={completedToday ? '#10B981' : '#6B7280'} />
            <Text style={[styles.statNumber, { color: completedToday ? '#10B981' : '#6B7280' }]}>
              {completedToday ? '✓' : '○'}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        {/* Daily Recommendation */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Sun size={20} color="#F59E0B" />
            <Text style={styles.recommendationTitle}>Today's Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>
            {completedToday 
              ? <>Great job! You&apos;ve completed your daily eye workout. Consider a quick break session if you&apos;re still working.</>
              : "Start with the Quick Screen Break - perfect for your current work session!"
            }
          </Text>
        </View>

        {/* Exercise Programs */}
        <Text style={styles.sectionTitle}>Exercise Programs</Text>
        
        {EXERCISE_PROGRAMS.map((program) => {
          const IconComponent = program.icon;
          return (
            <TouchableOpacity
              key={program.id}
              style={styles.programCard}
              onPress={() => handleProgramPress(program.route)}
              activeOpacity={0.7}
            >
              <View style={styles.programHeader}>
                <View style={[styles.programIcon, { backgroundColor: `${program.color}15` }]}>
                  <IconComponent size={24} color={program.color} />
                </View>
                <View style={styles.programInfo}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programDescription}>{program.description}</Text>
                  <View style={styles.programMeta}>
                    <View style={styles.durationBadge}>
                      <Clock size={12} color="#6B7280" />
                      <Text style={styles.durationText}>{program.duration}</Text>
                    </View>
                    <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(program.difficulty)}15` }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(program.difficulty) }]}>
                        {program.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.playIcon}>
                  <Play size={16} color="#6B7280" />
                </View>
              </View>
              <View style={styles.exercisesList}>
                <Text style={styles.exercisesLabel}>Includes:</Text>
                <Text style={styles.exercisesText}>{program.exercises.join(' • ')}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Eye Exercise Tips</Text>
          <Text style={styles.tipsText}>
            • Exercise in good lighting conditions{'\n'}
            • Take breaks if you feel any discomfort{'\n'}
            • Consistency is more important than intensity{'\n'}
            • Combine with regular eye exams for best results
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>🎯 Benefits of Regular Eye Exercise</Text>
          <Text style={styles.benefitsText}>
            • Reduced digital eye strain and fatigue{'\n'}
            • Improved focus flexibility and endurance{'\n'}
            • Better tear film distribution{'\n'}
            • Enhanced visual comfort during screen work{'\n'}
            • Stronger eye muscle coordination
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C7D2FE',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  exercisesList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  exercisesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  exercisesText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  tipsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
});