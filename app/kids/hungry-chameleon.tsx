import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { ArrowLeft, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const GAME_HEIGHT = height * 0.6;

const LEVELS = [
  { id: 1, name: 'Lazy Afternoon', speed: 2000, duration: 25000, target: 10 },
  { id: 2, name: 'Buzzing Jungle', speed: 1500, duration: 35000, target: 15 },
  { id: 3, name: 'Fly Frenzy', speed: 1000, duration: 45000, target: 25 },
];

export default function HungryChameleonScreen() {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'complete'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [flyPos, setFlyPos] = useState({ x: 0, y: 0 });
  const [tonguePos, setTonguePos] = useState<{ x: number, y: number } | null>(null);
  const [stars, setStars] = useState(0);

  const startLevel = () => {
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        spawnFly();
      }
    }
  }, [gameState, countdown]);

  const spawnFly = () => {
    const newX = Math.random() * (width - 60) + 30;
    const newY = Math.random() * (GAME_HEIGHT - 60) + 30;
    setFlyPos({ x: newX, y: newY });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const currentLevel = LEVELS[level];
      const flyInterval = setInterval(spawnFly, currentLevel.speed);

      const levelTimer = setTimeout(() => {
        clearInterval(flyInterval);
        setGameState('complete');
        const earnedStars = score >= currentLevel.target ? 3 : score >= currentLevel.target / 2 ? 2 : 1;
        setStars(earnedStars);
        updateStats(earnedStars * 10);
      }, currentLevel.duration);

      return () => {
        clearInterval(flyInterval);
        clearTimeout(levelTimer);
      };
    }
  }, [gameState, level, score]);

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

  const handleFlyTap = () => {
    if (gameState === 'playing' && !tonguePos) {
      setScore(prev => prev + 1);
      setTonguePos({ x: flyPos.x, y: flyPos.y });
      
      // Chameleon tongue animation duration
      setTimeout(() => {
        setTonguePos(null);
        spawnFly();
      }, 200);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#A7F3D0', '#065F46']} style={StyleSheet.absoluteFill} />
      
      {/* Jungle leaves decoration */}
      <Text style={[styles.leaf, { top: 40, left: -20, fontSize: 100 }]}>🍃</Text>
      <Text style={[styles.leaf, { top: height - 200, right: -20, fontSize: 120, transform: [{ rotate: '180deg' }] }]}>🍃</Text>

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.levelName}>{LEVELS[level].name}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>🪰 {score} / {LEVELS[level].target}</Text>
        </View>
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
              <Text style={styles.chameleonEmoji}>🦎</Text>
              <Text style={styles.menuTitle}>Hungry Charlie</Text>
              <Text style={styles.menuSubtitle}>Charlie is hungry! Help him catch the flies by tapping them as they appear.</Text>
              <TouchableOpacity style={styles.startButton} onPress={startLevel}>
                <Text style={styles.startButtonText}>Feed Charlie</Text>
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

          {gameState === 'playing' && (
            <>
              {/* The Fly */}
              <MotiView
                key="fly"
                animate={{
                  translateX: flyPos.x,
                  translateY: flyPos.y,
                }}
                transition={{
                  type: 'timing',
                  duration: 200,
                }}
                style={styles.flyContainer}
              >
                <TouchableOpacity onPress={handleFlyTap} activeOpacity={1}>
                  <MotiView
                    animate={{
                      translateY: [0, -5, 0],
                      rotate: ['-10deg', '10deg', '-10deg'],
                    }}
                    transition={{
                      loop: true,
                      duration: 100,
                    }}
                  >
                    <Text style={{ fontSize: 40 }}>🪰</Text>
                  </MotiView>
                </TouchableOpacity>
              </MotiView>

              {/* The Chameleon (Charlie) */}
              <View style={styles.chameleonContainer}>
                {tonguePos && (
                  <MotiView
                    from={{ height: 0 }}
                    animate={{ height: Math.sqrt(Math.pow(tonguePos.x - width / 2, 2) + Math.pow(height - 100 - tonguePos.y, 2)) }}
                    style={[
                      styles.tongue,
                      {
                        left: width / 2,
                        bottom: 80,
                        transform: [
                          { rotate: `${Math.atan2(tonguePos.x - width / 2, height - 100 - tonguePos.y) * (180 / Math.PI)}deg` },
                          { translateY: -Math.sqrt(Math.pow(tonguePos.x - width / 2, 2) + Math.pow(height - 100 - tonguePos.y, 2)) / 2 }
                        ]
                      }
                    ]}
                  />
                )}
                <Text style={{ fontSize: 100 }}>🦎</Text>
              </View>
            </>
          )}

          {gameState === 'complete' && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.winCard}
            >
              <Text style={styles.winTitle}>{score >= LEVELS[level].target ? 'Stomach Full!' : 'Nice Try!'}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3].map(i => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 200 }}
                  >
                    <Star size={40} color="#FFD700" fill={i <= stars ? "#FFD700" : "transparent"} style={{ margin: 5 }} />
                  </MotiView>
                ))}
              </View>
              <Text style={styles.winSubtitle}>Charlie caught {score} flies!</Text>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => level < LEVELS.length - 1 ? (setLevel(level + 1), startLevel()) : router.back()}
              >
                <Text style={styles.nextButtonText}>
                  {level < LEVELS.length - 1 ? 'Go Deeper in Jungle' : 'Finish Lunch'}
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
  leaf: {
    position: 'absolute',
    opacity: 0.3,
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
  scoreContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
  },
  menuCard: {
    marginHorizontal: 30,
    marginTop: height * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  chameleonEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#059669',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  flyContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chameleonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  tongue: {
    position: 'absolute',
    width: 6,
    backgroundColor: '#F87171',
    borderRadius: 3,
  },
  winCard: {
    marginHorizontal: 30,
    marginTop: height * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
  },
  winTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  winSubtitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#10B981',
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
