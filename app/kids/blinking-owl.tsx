import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { ArrowLeft, Star, Volume2, VolumeX } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const LEVELS = [
  { id: 1, name: 'Slow & Steady', interval: 4000, duration: 30000, blinks: 10 },
  { id: 2, name: 'Normal Pace', interval: 3000, duration: 45000, blinks: 15 },
  { id: 3, name: 'Quick Blink', interval: 2000, duration: 60000, blinks: 30 },
];

export default function BlinkingOwlScreen() {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'complete'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [isOwlBlinking, setIsOwlBlinking] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stars, setStars] = useState(0);

  // Sound effects placeholders
  const playSound = useCallback(async (type: 'blink' | 'win' | 'start') => {
    if (!soundEnabled) return;
    // In a real app, we would load actual mp3 files
    // const { sound } = await Audio.Sound.createAsync(require(`../../assets/sounds/${type}.mp3`));
    // await sound.playAsync();
  }, [soundEnabled]);

  const startLevel = () => {
    setGameState('countdown');
    setCountdown(3);
    setBlinkCount(0);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        playSound('start');
      }
    }
  }, [gameState, countdown, playSound]);

  useEffect(() => {
    if (gameState === 'playing') {
      const currentLevel = LEVELS[level];
      const blinkInterval = setInterval(() => {
        setIsOwlBlinking(true);
        playSound('blink');
        setBlinkCount(prev => prev + 1);
        
        setTimeout(() => {
          setIsOwlBlinking(false);
        }, 300);

      }, currentLevel.interval);

      const levelTimer = setTimeout(() => {
        clearInterval(blinkInterval);
        setGameState('complete');
        const earnedStars = (level + 1) * 10;
        setStars(earnedStars);
        updateStats(earnedStars);
        playSound('win');
      }, currentLevel.duration);

      return () => {
        clearInterval(blinkInterval);
        clearTimeout(levelTimer);
      };
    }
  }, [gameState, level, playSound]);

  const updateStats = async (earnedStars: number) => {
    try {
      const savedStats = await AsyncStorage.getItem('kidsStats');
      let stats = savedStats ? JSON.parse(savedStats) : { totalStars: 0, gamesPlayed: 0, streakDays: 0, badges: [], todayPlayTime: 0 };
      stats.totalStars += earnedStars;
      stats.gamesPlayed += 1;
      await AsyncStorage.setItem('kidsStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(level + 1);
      startLevel();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1A2E35', '#2D4B54']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.levelName}>{LEVELS[level].name}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 size={24} color="#FFFFFF" /> : <VolumeX size={24} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>

      <View style={styles.gameArea}>
        <AnimatePresence>
          {gameState === 'idle' && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={styles.menuCard}
            >
              <Text style={styles.owlEmoji}>🦉</Text>
              <Text style={styles.menuTitle}>Meet Oliver the Owl!</Text>
              <Text style={styles.menuSubtitle}>Blink every time Oliver blinks to keep your eyes healthy and hydrated.</Text>
              <TouchableOpacity style={styles.startButton} onPress={startLevel}>
                <Text style={styles.startButtonText}>Start Therapy</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {gameState === 'countdown' && (
            <MotiView
              key="countdown"
              from={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={styles.countdownContainer}
            >
              <Text style={styles.countdownText}>{countdown}</Text>
            </MotiView>
          )}

          {(gameState === 'playing' || gameState === 'complete') && (
            <View style={styles.owlContainer}>
              <MotiView
                animate={{
                  translateY: gameState === 'playing' ? [0, -10, 0] : 0,
                }}
                transition={{
                  loop: true,
                  duration: 2000,
                  type: 'timing',
                }}
                style={styles.owl}
              >
                {/* Owl Eyes */}
                <View style={styles.eyesRow}>
                  <View style={styles.eyeSocket}>
                    <MotiView
                      animate={{
                        height: isOwlBlinking ? 2 : 40,
                      }}
                      style={styles.eye}
                    >
                      {!isOwlBlinking && <View style={styles.pupil} />}
                    </MotiView>
                  </View>
                  <View style={styles.eyeSocket}>
                    <MotiView
                      animate={{
                        height: isOwlBlinking ? 2 : 40,
                      }}
                      style={styles.eye}
                    >
                      {!isOwlBlinking && <View style={styles.pupil} />}
                    </MotiView>
                  </View>
                </View>
                {/* Owl Body Placeholder */}
                <View style={styles.owlBody} />
                <View style={styles.beak} />
              </MotiView>

              {gameState === 'playing' && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Blinks: {blinkCount}</Text>
                  <View style={styles.progressBar}>
                    <MotiView
                      animate={{
                        width: `${(blinkCount / LEVELS[level].blinks) * 100}%`,
                      }}
                      style={styles.progressFill}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {gameState === 'complete' && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.winCard}
            >
              <Text style={styles.winTitle}>Fantastic!</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3].map(i => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 200 }}
                  >
                    <Star size={40} color="#FFD700" fill="#FFD700" style={{ margin: 5 }} />
                  </MotiView>
                ))}
              </View>
              <Text style={styles.winSubtitle}>You earned {stars} stars!</Text>
              <TouchableOpacity style={styles.nextButton} onPress={nextLevel}>
                <Text style={styles.nextButtonText}>
                  {level < LEVELS.length - 1 ? 'Next Level' : 'Finish'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  levelName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  owlEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2E35',
    marginBottom: 12,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  countdownContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  owlContainer: {
    alignItems: 'center',
    width: '100%',
  },
  owl: {
    width: 200,
    height: 250,
    backgroundColor: '#8B5E3C',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#63422A',
  },
  eyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  eyeSocket: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  eye: {
    width: 50,
    backgroundColor: '#1A2E35',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  owlBody: {
    width: 140,
    height: 100,
    backgroundColor: '#A07855',
    borderRadius: 50,
    position: 'absolute',
    bottom: 20,
  },
  beak: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
    transform: [{ rotate: '180deg' }],
    marginTop: 20,
  },
  progressContainer: {
    width: '80%',
    marginTop: 50,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  winCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
  },
  winTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2E35',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  winSubtitle: {
    fontSize: 20,
    color: '#4B5563',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
