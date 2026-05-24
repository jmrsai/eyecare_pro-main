import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { ArrowLeft, Moon, Sun, Wind } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const PHASES = [
  { id: 1, title: 'Deep Breath In', instruction: 'Close your eyes and breathe in slowly...', color: '#8B5CF6' },
  { id: 2, title: 'Hold & Relax', instruction: 'Feel the warmth around your eyes...', color: '#7C3AED' },
  { id: 3, title: 'Soft Breath Out', instruction: 'Let all the tiredness drift away...', color: '#6D28D9' },
];

export default function MagicEyeHugScreen() {
  const [phase, setPhase] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: any;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
        // Cycle phases every 5 seconds
        if (timer % 5 === 0) {
          setPhase(p => (p + 1) % PHASES.length);
        }
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4C1D95', '#1E1B4B']} style={StyleSheet.absoluteFill} />
      
      {/* Decorative Stars */}
      {[...Array(15)].map((_, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ loop: true, duration: 2000 + Math.random() * 3000 }}
          style={[
            styles.star,
            { top: Math.random() * height, left: Math.random() * width }
          ]}
        />
      ))}

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <AnimatePresence exitBeforeEnter>
          {!isActive ? (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.introCard}
            >
              <Moon size={80} color="#DDD6FE" style={{ marginBottom: 20 }} />
              <Text style={styles.title}>Magic Eye Hug</Text>
              <Text style={styles.subtitle}>
                A gentle therapy to rest your eyes. Find a cozy spot, close your eyes, and follow the rhythm of the magic stars.
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={() => setIsActive(true)}>
                <Text style={styles.startButtonText}>Start Hugging</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <MotiView
              key="active"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.activeArea}
            >
              <MotiView
                animate={{
                  scale: phase === 0 ? 1.5 : phase === 1 ? 1.7 : 1,
                  opacity: phase === 0 ? 0.6 : phase === 1 ? 0.8 : 0.4,
                }}
                transition={{ type: 'timing', duration: 3000 }}
                style={[styles.hugCircle, { backgroundColor: PHASES[phase].color }]}
              />
              
              <MotiView
                key={PHASES[phase].id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 1000 }}
                style={styles.instructionContainer}
              >
                <Text style={styles.phaseTitle}>{PHASES[phase].title}</Text>
                <Text style={styles.phaseSubtitle}>{PHASES[phase].instruction}</Text>
                {phase === 0 ? <Wind size={40} color="#FFFFFF" /> : <Sun size={40} color="#FFFFFF" />}
              </MotiView>
            </MotiView>
          )}
        </AnimatePresence>
      </View>

      {isActive && (
        <TouchableOpacity style={styles.stopButton} onPress={() => setIsActive(false)}>
          <Text style={styles.stopButtonText}>End Session</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: '#DDD6FE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#DDD6FE',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  hugCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  phaseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  phaseSubtitle: {
    fontSize: 18,
    color: '#DDD6FE',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  stopButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
