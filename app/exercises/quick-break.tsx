import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, ArrowLeft, Play, Pause, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuickExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  animation: 'blink' | 'track' | 'focus';
  instructions: string;
}

const QUICK_EXERCISES: QuickExercise[] = [
  {
    id: 'rapid-blink',
    name: 'Rapid Blinking',
    description: 'Quick blinks to refresh tear film',
    duration: 30,
    animation: 'blink',
    instructions: 'Blink rapidly but gently for 30 seconds'
  },
  {
    id: 'figure-8',
    name: 'Figure-8 Tracking',
    description: 'Follow the moving dot in a figure-8 pattern',
    duration: 45,
    animation: 'track',
    instructions: 'Follow the dot smoothly with your eyes only'
  },
  {
    id: 'near-far',
    name: 'Near-Far Focus',
    description: 'Quick focus shifts between near and far',
    duration: 45,
    animation: 'focus',
    instructions: 'Focus alternately on near and far targets'
  }
];

export default function QuickBreakExercise() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(QUICK_EXERCISES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const trackAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  const currentExercise = QUICK_EXERCISES[currentExerciseIndex];
  const totalDuration = QUICK_EXERCISES.reduce((sum, ex) => sum + ex.duration, 0);
  const elapsed = QUICK_EXERCISES.slice(0, currentExerciseIndex).reduce((sum, ex) => sum + ex.duration, 0) + 
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
    if (currentExerciseIndex < QUICK_EXERCISES.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setTimeRemaining(QUICK_EXERCISES[currentExerciseIndex + 1].duration);
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

  const startBlinkAnimation = useCallback(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isActive && currentExercise.animation === 'blink') {
          setTimeout(blink, 200);
        }
      });
    };
    blink();
  }, [blinkAnim, isActive, currentExercise.animation]);

  const startTrackingAnimation = useCallback(() => {
    const track = () => {
      Animated.timing(trackAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (isActive && currentExercise.animation === 'track') {
          trackAnim.setValue(0);
          track();
        }
      });
    };
    track();
  }, [trackAnim, isActive, currentExercise.animation]);

  const startFocusAnimation = useCallback(() => {
    const focus = () => {
      Animated.sequence([
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isActive && currentExercise.animation === 'focus') {
          focus();
        }
      });
    };
    focus();
  }, [focusAnim, isActive, currentExercise.animation]);

  const startAnimation = useCallback(() => {
    switch (currentExercise.animation) {
      case 'blink':
        startBlinkAnimation();
        break;
      case 'track':
        startTrackingAnimation();
        break;
      case 'focus':
        startFocusAnimation();
        break;
    }
  }, [currentExercise.animation, startBlinkAnimation, startTrackingAnimation, startFocusAnimation]);

  const stopAnimation = useCallback(() => {
    blinkAnim.stopAnimation();
    trackAnim.stopAnimation();
    focusAnim.stopAnimation();
  }, [blinkAnim, trackAnim, focusAnim]);

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
    return `${seconds}s`;
  };

  const renderAnimation = () => {
    switch (currentExercise.animation) {
      case 'blink':
        return (
          <Animated.View style={[styles.animationContainer, { opacity: blinkAnim }]}>
            <View style={styles.eyeShape}>
              <View style={styles.eyeball} />
            </View>
            <Text style={styles.animationText}>Blink rapidly but gently</Text>
          </Animated.View>
        );
      
      case 'track':
        const trackX = trackAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, 100, 0, -100, 0],
        });
        const trackY = trackAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, -50, 0, 50, 0],
        });
        
        return (
          <View style={styles.animationContainer}>
            <View style={styles.trackingArea}>
              <Animated.View 
                style={[
                  styles.trackingDot,
                  {
                    transform: [
                      { translateX: trackX },
                      { translateY: trackY }
                    ]
                  }
                ]}
              />
            </View>
            <Text style={styles.animationText}>Follow the dot with your eyes</Text>
          </View>
        );
      
      case 'focus':
        const nearScale = focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.3],
        });
        const farScale = focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });
        
        return (
          <View style={styles.animationContainer}>
            <View style={styles.focusContainer}>
              <Animated.View style={[styles.focusTarget, { transform: [{ scale: nearScale }] }]}>
                <Text style={styles.focusText}>NEAR</Text>
              </Animated.View>
              <Animated.View style={[styles.focusTarget, styles.farTarget, { transform: [{ scale: farScale }] }]}>
                <Text style={styles.focusText}>FAR</Text>
              </Animated.View>
            </View>
            <Text style={styles.animationText}>Focus on the highlighted target</Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Break Complete!</Text>
        </LinearGradient>

        <View style={styles.completeContainer}>
          <CheckCircle size={80} color="#10B981" />
          <Text style={styles.completeTitle}>Quick Screen Break Complete!</Text>
          <Text style={styles.completeText}>
            Perfect! You&apos;ve completed a 2-minute eye refresher. 
            Your eyes are now ready for more screen time.
          </Text>
          
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Back to Work</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Screen Break</Text>
        <Text style={styles.headerSubtitle}>
          Exercise {currentExerciseIndex + 1} of {QUICK_EXERCISES.length}
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
            <Zap size={32} color="#06B6D4" />
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
            style={[styles.playButton, { backgroundColor: isActive ? '#EF4444' : '#06B6D4' }]}
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A5F3FC',
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
    backgroundColor: '#06B6D4',
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
    backgroundColor: '#06B6D415',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#06B6D4',
  },
  animationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 200,
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
  eyeShape: {
    width: 80,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyeball: {
    width: 20,
    height: 20,
    backgroundColor: '#1F2937',
    borderRadius: 10,
  },
  trackingArea: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingDot: {
    width: 20,
    height: 20,
    backgroundColor: '#06B6D4',
    borderRadius: 10,
  },
  focusContainer: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  focusTarget: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farTarget: {
    backgroundColor: '#10B981',
  },
  focusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  animationText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  instructionsText: {
    fontSize: 16,
    color: '#0F766E',
    textAlign: 'center',
    fontWeight: '500',
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
    fontWeight: 'bold',
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
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});