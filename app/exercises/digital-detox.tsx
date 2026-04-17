import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  instructions: string[];
  type: 'active' | 'rest';
}

const DIGITAL_DETOX_EXERCISES: Exercise[] = [
  {
    id: 'palming',
    name: 'Palming Relaxation',
    description: 'Cover your eyes with palms to create complete darkness',
    duration: 60,
    type: 'rest',
    instructions: [
      'Sit comfortably with elbows on a table',
      'Cup your palms over closed eyes without pressure',
      'Ensure complete darkness - no light should enter',
      'Breathe deeply and relax your eye muscles',
      'Visualize complete blackness'
    ]
  },
  {
    id: '20-20-20',
    name: '20-20-20 Rule Practice',
    description: 'Look at something 20 feet away for 20 seconds',
    duration: 20,
    type: 'active',
    instructions: [
      'Find an object at least 20 feet away',
      'Focus on the distant object clearly',
      'Blink naturally while maintaining focus',
      'Notice the details of the distant object',
      'Let your eyes fully relax into the distance'
    ]
  },
  {
    id: 'blinking',
    name: 'Conscious Blinking',
    description: 'Deliberate, slow blinking to rehydrate eyes',
    duration: 45,
    type: 'active',
    instructions: [
      'Close your eyes gently, don\'t squeeze',
      'Hold closed for 2 seconds',
      'Open slowly and pause for 2 seconds',
      'Repeat this slow, deliberate pattern',
      'Feel the moisture spreading across your eyes'
    ]
  },
  {
    id: 'focus-shifts',
    name: 'Near-Far Focus Shifts',
    description: 'Alternate focus between near and far objects',
    duration: 60,
    type: 'active',
    instructions: [
      'Hold your thumb 6 inches from your face',
      'Focus on your thumb for 3 seconds',
      'Shift focus to an object 10+ feet away',
      'Focus on the distant object for 3 seconds',
      'Continue alternating smoothly'
    ]
  },
  {
    id: 'eye-massage',
    name: 'Gentle Eye Massage',
    description: 'Light massage around the eye area',
    duration: 90,
    type: 'rest',
    instructions: [
      'Close your eyes gently',
      'Use fingertips to massage temples in circles',
      'Gently massage above and below eyebrows',
      'Apply light pressure to closed eyelids',
      'Finish with gentle forehead massage'
    ]
  }
];

export default function DigitalDetoxExercise() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(DIGITAL_DETOX_EXERCISES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentExercise = DIGITAL_DETOX_EXERCISES[currentExerciseIndex];
  const totalExercises = DIGITAL_DETOX_EXERCISES.length;
  const progress = (currentExerciseIndex + (currentExercise.duration - timeRemaining) / currentExercise.duration) / totalExercises;

  const completeWorkout = useCallback(async () => {
    setIsComplete(true);
    setIsActive(false);

    try {
      const stats = await AsyncStorage.getItem('exerciseStats');
      const currentStats = stats ? JSON.parse(stats) : {};
      
      const today = new Date().toDateString();
      const totalMinutes = Math.round(DIGITAL_DETOX_EXERCISES.reduce((sum, ex) => sum + ex.duration, 0) / 60);
      
      const updatedStats = {
        ...currentStats,
        totalMinutes: (currentStats.totalMinutes || 0) + totalMinutes,
        lastCompletedDate: today,
        weeklyStreak: currentStats.lastCompletedDate === today ? currentStats.weeklyStreak : (currentStats.weeklyStreak || 0) + 1,
      };

      await AsyncStorage.setItem('exerciseStats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error saving exercise stats:', error);
    }
  }, []);

  const nextExercise = useCallback(async () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimeRemaining(DIGITAL_DETOX_EXERCISES[currentExerciseIndex + 1].duration);
      setCurrentInstruction(0);
      setIsActive(false);
    } else {
      await completeWorkout();
    }
  }, [currentExerciseIndex, totalExercises, completeWorkout]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            nextExercise();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, nextExercise]);

  useEffect(() => {
    let instructionInterval: NodeJS.Timeout | null = null;
    if (isActive && currentExercise.type === 'active') {
      instructionInterval = setInterval(() => {
        setCurrentInstruction(prev => 
          (prev + 1) % currentExercise.instructions.length
        );
        
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);

      return () => {
        if (instructionInterval) clearInterval(instructionInterval);
      };
    }
  }, [isActive, currentExercise, fadeAnim]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setTimeRemaining(currentExercise.duration);
    setIsActive(false);
    setCurrentInstruction(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Complete!</Text>
        </LinearGradient>

        <View style={styles.completeContainer}>
          <CheckCircle size={80} color="#10B981" />
          <Text style={styles.completeTitle}>Digital Eye Strain Relief Complete!</Text>
          <Text style={styles.completeText}>
            Great job! You&apos;ve completed an 8-minute digital detox session. 
            Your eyes should feel more relaxed and refreshed.
          </Text>
          
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Benefits You Just Gained:</Text>
            <Text style={styles.benefitsText}>
              ✓ Reduced eye muscle tension{'\n'}
              ✓ Improved tear film distribution{'\n'}
              ✓ Enhanced focus flexibility{'\n'}
              ✓ Decreased digital eye strain
            </Text>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Eye Strain Relief</Text>
        <Text style={styles.headerSubtitle}>
          Exercise {currentExerciseIndex + 1} of {totalExercises}
        </Text>
      </LinearGradient>

      <View style={styles.exerciseContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>

        {/* Current Exercise */}
        <View style={styles.exerciseCard}>
          <View style={[styles.exerciseIcon, { backgroundColor: currentExercise.type === 'active' ? '#3B82F615' : '#10B98115' }]}>
            <Eye size={32} color={currentExercise.type === 'active' ? '#3B82F6' : '#10B981'} />
          </View>
          
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>remaining</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          {currentExercise.type === 'rest' ? (
            <View>
              {currentExercise.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  • {instruction}
                </Text>
              ))}
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.currentInstructionText}>
                {currentExercise.instructions[currentInstruction]}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetExercise}>
            <RotateCcw size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: isActive ? '#EF4444' : '#10B981' }]}
            onPress={toggleTimer}
          >
            {isActive ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButton} onPress={nextExercise}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#BFDBFE',
    opacity: 0.9,
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: '#3B82F6',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0C4A6E',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
    marginBottom: 4,
  },
  currentInstructionText: {
    fontSize: 16,
    color: '#0C4A6E',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  skipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#065F46',
    marginBottom: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});