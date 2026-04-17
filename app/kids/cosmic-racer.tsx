import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { ArrowLeft, Star, Rocket } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const GAME_HEIGHT = height * 0.7;
const GAME_WIDTH = width;

const LEVELS = [
  { id: 1, name: 'Stardust Valley', speed: 3000, points: 5, duration: 20000, type: 'smooth' },
  { id: 2, name: 'Meteor Belt', speed: 2000, points: 10, duration: 30000, type: 'jump' },
  { id: 3, name: 'Supernova Dash', speed: 1000, points: 20, duration: 40000, type: 'mixed' },
];

export default function CosmicRacerScreen() {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'complete'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [rocketPos, setRocketPos] = useState({ x: width / 2 - 30, y: GAME_HEIGHT / 2 - 30 });
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
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing') {
      const currentLevel = LEVELS[level];
      
      const moveRocket = () => {
        const newX = Math.random() * (GAME_WIDTH - 100) + 20;
        const newY = Math.random() * (GAME_HEIGHT - 100) + 20;
        setRocketPos({ x: newX, y: newY });
      };

      const movementInterval = setInterval(moveRocket, currentLevel.speed);

      const levelTimer = setTimeout(() => {
        clearInterval(movementInterval);
        setGameState('complete');
        const earnedStars = Math.min(3, Math.floor(score / 5) + 1);
        setStars(earnedStars);
        updateStats(earnedStars * 10);
      }, currentLevel.duration);

      return () => {
        clearInterval(movementInterval);
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

  const handleRocketTap = () => {
    if (gameState === 'playing') {
      setScore(prev => prev + 1);
      // Move immediately on tap for more engagement
      const newX = Math.random() * (GAME_WIDTH - 100) + 20;
      const newY = Math.random() * (GAME_HEIGHT - 100) + 20;
      setRocketPos({ x: newX, y: newY });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B']} style={StyleSheet.absoluteFill} />
      
      {/* Background Stars (Stateless decoration) */}
      {[...Array(20)].map((_, i) => (
        <View 
          key={i} 
          style={[
            styles.bgStar, 
            { 
              top: Math.random() * height, 
              left: Math.random() * width,
              opacity: Math.random() * 0.5 + 0.3
            }
          ]} 
        />
      ))}

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.levelName}>{LEVELS[level].name}</Text>
        <View style={styles.scoreContainer}>
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
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
              <Rocket size={80} color="#3B82F6" style={{ marginBottom: 20 }} />
              <Text style={styles.menuTitle}>Cosmic Racer</Text>
              <Text style={styles.menuSubtitle}>Follow the rocket through the stars! Tap the rocket whenever you catch it to earn points.</Text>
              <TouchableOpacity style={styles.startButton} onPress={startLevel}>
                <Text style={styles.startButtonText}>Start Mission</Text>
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
            <MotiView
              key="rocket"
              animate={{
                translateX: rocketPos.x,
                translateY: rocketPos.y,
              }}
              transition={{
                type: 'timing',
                duration: LEVELS[level].type === 'jump' ? 100 : LEVELS[level].speed,
              }}
              style={styles.rocketContainer}
            >
              <TouchableOpacity onPress={handleRocketTap} activeOpacity={0.6}>
                <MotiView
                  animate={{
                    rotate: ['0deg', '10deg', '-10deg', '0deg'],
                  }}
                  transition={{
                    loop: true,
                    duration: 1000,
                  }}
                >
                  <Rocket size={60} color="#60A5FA" fill="#3B82F6" />
                </MotiView>
              </TouchableOpacity>
            </MotiView>
          )}

          {gameState === 'complete' && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.winCard}
            >
              <Text style={styles.winTitle}>Mission Complete!</Text>
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
              <Text style={styles.winSubtitle}>Score: {score}</Text>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => level < LEVELS.length - 1 ? (setLevel(level + 1), startLevel()) : router.back()}
              >
                <Text style={styles.nextButtonText}>
                  {level < LEVELS.length - 1 ? 'Next Galaxy' : 'Return to Base'}
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
  bgStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  scoreText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  menuCard: {
    marginHorizontal: 30,
    marginTop: height * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 12,
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#3B82F6',
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
  rocketContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winCard: {
    marginHorizontal: 30,
    marginTop: height * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
  },
  winTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1B4B',
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
