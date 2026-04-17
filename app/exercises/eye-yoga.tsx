import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, Play, Pause, CheckCircle, Wind } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface YogaExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  animation: 'palming' | 'sideways' | 'updown' | 'diagonal' | 'circle';
  instructions: string;
}

const YOGA_EXERCISES: YogaExercise[] = [
  {
    id: 'palming',
    name: 'Palming',
    description: 'Deep relaxation for your optic nerves',
    duration: 60,
    animation: 'palming',
    instructions: 'Rub your palms until warm, then gently cover your closed eyes. Breathe deeply.'
  },
  {
    id: 'sideways-look',
    name: 'Sideways Look',
    description: 'Stretch the medial and lateral muscles',
    duration: 30,
    animation: 'sideways',
    instructions: 'Look as far left as possible, then as far right as possible. Keep your head still.'
  },
  {
    id: 'updown-look',
    name: 'Up & Down Look',
    description: 'Stretch the superior and inferior muscles',
    duration: 30,
    animation: 'updown',
    instructions: 'Look as far up as possible, then as far down as possible. Don\'t move your head.'
  },
  {
    id: 'diagonal-look',
    name: 'Diagonal Look',
    description: 'Strengthen diagonal eye movement',
    duration: 40,
    animation: 'diagonal',
    instructions: 'Move your eyes from top-left to bottom-right, then top-right to bottom-left.'
  },
  {
    id: 'rotational-view',
    name: 'Rotational View',
    description: 'Full range of motion exercise',
    duration: 40,
    animation: 'circle',
    instructions: 'Slowly rotate your eyes in a large circle. Repeat in both directions.'
  }
];

export default function EyeYogaExercise() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(YOGA_EXERCISES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const moveAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentExercise = YOGA_EXERCISES[currentExerciseIndex];
  const totalDuration = YOGA_EXERCISES.reduce((sum, ex) => sum + ex.duration, 0);
  const elapsed = YOGA_EXERCISES.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0) + 
                 (currentExercise.duration - timeRemaining);
  const progress = elapsed / totalDuration;

  const completeWorkout = useCallback(async () => {
    setIsComplete(true);
    setIsActive(false);

    try {
      const stats = await AsyncStorage.getItem('exerciseStats');
      const currentStats = stats ? JSON.parse(stats) : {};
      
      const today = new Date().toDateString();
      const totalMinutes = Math.round(totalDuration / 60);
      
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
  }, [totalDuration]);

  const nextExercise = useCallback(async () => {
    if (currentExerciseIndex < YOGA_EXERCISES.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimeRemaining(YOGA_EXERCISES[currentExerciseIndex + 1].duration);
      setIsActive(false);
    } else {
      await completeWorkout();
    }
  }, [currentExerciseIndex, completeWorkout]);

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

  const startAnimation = useCallback(() => {
    moveAnim.setValue(0);
    pulseAnim.setValue(1);

    switch (currentExercise.animation) {
      case 'palming':
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'sideways':
      case 'updown':
        Animated.loop(
          Animated.sequence([
            Animated.timing(moveAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
              toValue: -1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'diagonal':
        Animated.loop(
          Animated.sequence([
            Animated.timing(moveAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
              toValue: -1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
      case 'circle':
        Animated.loop(
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          })
        ).start();
        break;
    }
  }, [currentExercise.animation, moveAnim, pulseAnim]);

  const stopAnimation = useCallback(() => {
    moveAnim.stopAnimation();
    pulseAnim.stopAnimation();
  }, [moveAnim, pulseAnim]);

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [isActive, startAnimation, stopAnimation]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderAnimation = () => {
    switch (currentExercise.animation) {
      case 'palming':
        return (
          <View style={styles.animationContainer}>
            <Animated.View style={[styles.palmingIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Wind size={80} color="#8B5CF6" />
            </Animated.View>
            <Text style={styles.animationText}>Gently cover your eyes and breathe</Text>
          </View>
        );
      
      case 'sideways':
        const translateX = moveAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-80, 80],
        });
        return (
          <View style={styles.animationContainer}>
            <View style={styles.eyeTrack}>
              <Animated.View style={[styles.eyeDot, { transform: [{ translateX }] }]} />
            </View>
            <Text style={styles.animationText}>Follow the dot left and right</Text>
          </View>
        );

      case 'updown':
        const translateY = moveAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [60, -60],
        });
        return (
          <View style={styles.animationContainer}>
            <View style={[styles.eyeTrack, { height: 140, width: 4 }]}>
              <Animated.View style={[styles.eyeDot, { transform: [{ translateY }] }]} />
            </View>
            <Text style={styles.animationText}>Follow the dot up and down</Text>
          </View>
        );

      case 'diagonal':
        const diagX = moveAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-60, 0, 60],
        });
        const diagY = moveAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [60, 0, -60],
        });
        return (
          <View style={styles.animationContainer}>
            <View style={styles.diagonalArea}>
              <Animated.View 
                style={[ 
                  styles.eyeDot, 
                  { 
                    transform: [
                      { translateX: diagX }, 
                      { translateY: diagY }
                    ] 
                  }
                ]} 
              />
            </View>
            <Text style={styles.animationText}>Follow the diagonal movements</Text>
          </View>
        );

      case 'circle':
        const rotateX = moveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 360],
        });
        
        return (
          <View style={styles.animationContainer}>
            <View style={styles.circleTrack}>
              <Animated.View 
                style={[ 
                  styles.dotContainer,
                  {
                    transform: [
                      { rotate: rotateX.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg']
                      }) }
                    ]
                  }
                ]}
              >
                <View style={[styles.eyeDot, { marginTop: -100 }]} />
              </Animated.View>
            </View>
            <Text style={styles.animationText}>Follow the dot in a circle</Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yoga Complete!</Text>
        </LinearGradient>

        <View style={styles.completeContainer}>
          <CheckCircle size={80} color="#8B5CF6" />
          <Text style={styles.completeTitle}>Namaste for your Eyes!</Text>
          <Text style={styles.completeText}>
            Excellent! You&apos;ve completed your Eye Yoga session. 
            Your eyes should feel refreshed and relaxed.
          </Text>
          
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Finish Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eye Yoga</Text>
        <Text style={styles.headerSubtitle}>
          Exercise {currentExerciseIndex + 1} of {YOGA_EXERCISES.length}
        </Text>
      </LinearGradient>

      <View style={styles.exerciseContainer}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseIcon}>
            <Eye size={32} color="#8B5CF6" />
          </View>
          
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        {/* Animation Area */}
        <View style={styles.animationCard}>
          {renderAnimation()}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsText}>
            {currentExercise.instructions}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: isActive ? '#EF4444' : '#8B5CF6' }]}
            onPress={toggleTimer}
          >
            {isActive ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
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
    color: '#DDD6FE',
    opacity: 0.9,
  },
  exerciseContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
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
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF615',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#8B5CF6',
  },
  animationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  palmingIcon: {
    marginBottom: 20,
  },
  eyeTrack: {
    width: 200,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyeDot: {
    width: 24,
    height: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  diagonalArea: {
    width: 200,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleTrack: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dotContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  instructionsText: {
    fontSize: 16,
    color: '#5B21B6',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  doneButton: {
    backgroundColor: '#8B5CF6',
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
