import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw, Eye, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';

const { width } = Dimensions.get('window');

export default function AccommodationTest() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [phase, setPhase] = useState<'intro' | 'near' | 'far' | 'complete'>('intro');
  const [timeLeft, setTimeLeft] = useState(10);
  const [cycle, setCycle] = useState(0);
  
  // Animations
  const focusAnim = useRef(new Animated.Value(0)).current; // 0 = blur, 1 = sharp
  const sizeAnim = useRef(new Animated.Value(1)).current; // 1 = normal, 0.5 = small (far)

  const saveResults = async () => {
    try {
      const result = {
        testType: 'Accommodation',
        date: new Date().toISOString().split('T')[0],
        score: 100, // It's an exercise, so we just give full score for completion
        status: 'normal',
        details: 'Completed 3 cycles of focus flexibility exercise',
      };

      if (user?.uid) {
        await saveTestResult(user.uid, result);
      }

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift({ id: Date.now().toString(), ...result });
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving accommodation results:', error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if ((phase === 'near' || phase === 'far') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (phase === 'near') {
        startFarPhase();
      } else if (phase === 'far') {
        if (cycle < 2) { // Do 3 cycles
          setCycle(c => c + 1);
          startNearPhase();
        } else {
          setPhase('complete');
          saveResults();
        }
      }
    }

    return () => clearInterval(timer);
  }, [phase, timeLeft, cycle]);

  const startTest = () => {
    startNearPhase();
  };

  const startNearPhase = () => {
    setPhase('near');
    setTimeLeft(10);
    
    // Animate to "Near" state: Large, Sharp
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(sizeAnim, {
        toValue: 1.5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startFarPhase = () => {
    setPhase('far');
    setTimeLeft(10);

    // Animate to "Far" state: Small, maybe slightly blurry initially then sharp? 
    // For this simulation, we'll just make it small to simulate distance.
    Animated.parallel([
      Animated.timing(focusAnim, {
        toValue: 1, 
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(sizeAnim, {
        toValue: 0.5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetTest = () => {
    setPhase('intro');
    setCycle(0);
    setTimeLeft(10);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accommodation Test</Text>
        <Text style={styles.headerSubtitle}>Focus Flexibility</Text>
      </LinearGradient>

      <View style={styles.content}>
        {phase === 'intro' && (
          <View style={styles.card}>
            <Eye size={48} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Ready to start?</Text>
            <Text style={[styles.description, { color: theme.colors.subtext }]}>
              This test exercises your eye&apos;s ability to switch focus between near and far objects.
              {'\n\n'}
              1. Hold your device at arm&apos;s length.
              {'\n'}
              2. Focus on the circle when it&apos;s large (Near).
              {'\n'}
              3. Relax your eyes and look &quot;through&quot; the screen when it&apos;s small (Far).
            </Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.colors.primary }]} 
              onPress={startTest}
            >
              <Text style={styles.buttonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        )}

        {(phase === 'near' || phase === 'far') && (
          <View style={styles.testArea}>
            <Text style={[styles.instruction, { color: theme.colors.text }]}>
              {phase === 'near' ? "FOCUS NEAR" : "LOOK FAR"}
            </Text>
            
            <View style={styles.targetContainer}>
              <Animated.View
                style={[
                  styles.target,
                  {
                    backgroundColor: phase === 'near' ? theme.colors.primary : theme.colors.secondary,
                    transform: [{ scale: sizeAnim }],
                    opacity: focusAnim,
                  },
                ]}
              >
                <Target size={40} color="#FFFFFF" />
              </Animated.View>
            </View>

            <Text style={[styles.timer, { color: theme.colors.subtext }]}>
              Switching in {timeLeft}s
            </Text>
            <Text style={[styles.cycle, { color: theme.colors.subtext }]}>
              Cycle {cycle + 1}/3
            </Text>
          </View>
        )}

        {phase === 'complete' && (
          <View style={styles.card}>
            <CheckCircle size={64} color={theme.colors.success} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Test Complete!</Text>
            <Text style={[styles.description, { color: theme.colors.subtext }]}>
              Great job! You&apos;ve completed 3 cycles of accommodation exercises. 
              Doing this daily helps reduce digital eye strain.
            </Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.colors.primary }]} 
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]} 
              onPress={resetTest}
            >
              <RotateCcw size={20} color={theme.colors.text} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper component since CheckCircle wasn't imported
function CheckCircle({ size, color }: { size: number, color: string }) {
  return (
    <View style={{ 
      width: size, 
      height: size, 
      borderRadius: size / 2, 
      borderWidth: 4, 
      borderColor: color, 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: 16
    }}>
      <View style={{ 
        width: size * 0.5, 
        height: size * 0.25, 
        borderLeftWidth: 4, 
        borderBottomWidth: 4, 
        borderColor: color, 
        transform: [{ rotate: '-45deg' }],
        marginTop: -size * 0.1
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF', // Should utilize theme.colors.card via logic if inside component, but fixed for simplicity here as example
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 60,
    letterSpacing: 2,
  },
  targetContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    marginTop: 60,
  },
  cycle: {
    fontSize: 14,
    marginTop: 8,
  },
});
