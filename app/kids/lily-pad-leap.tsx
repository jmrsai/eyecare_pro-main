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
  { id: 1, name: 'Quiet Pond', speed: 2500, duration: 20000, jumps: 8 },
  { id: 2, name: 'Bubbly Brook', speed: 1800, duration: 30000, jumps: 15 },
  { id: 3, name: 'Rapid River', speed: 1200, duration: 40000, jumps: 25 },
];

export default function LilyPadLeapScreen() {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'complete'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [frogPos, setFrogPos] = useState({ x: width / 2 - 40, y: GAME_HEIGHT / 2 - 40 });
  const [pads, setPads] = useState<{x: number, y: number}[]>([]);
  const [stars, setStars] = useState(0);

  const startLevel = () => {
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    generatePads();
  };

  const generatePads = () => {
    const newPads = [];
    for (let i = 0; i < 5; i++) {
      newPads.push({
        x: Math.random() * (width - 100) + 20,
        y: Math.random() * (GAME_HEIGHT - 100) + 20
      });
    }
    setPads(newPads);
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        moveFrog();
      }
    }
  }, [gameState, countdown]);

  const moveFrog = () => {
    const newX = Math.random() * (width - 80) + 10;
    const newY = Math.random() * (GAME_HEIGHT - 80) + 10;
    setFrogPos({ x: newX, y: newY });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const currentLevel = LEVELS[level];
      const jumpInterval = setInterval(moveFrog, currentLevel.speed);

      const levelTimer = setTimeout(() => {
        clearInterval(jumpInterval);
        setGameState('complete');
        const earnedStars = score >= currentLevel.jumps ? 3 : score >= currentLevel.jumps / 2 ? 2 : 1;
        setStars(earnedStars);
        updateStats(earnedStars * 10);
      }, currentLevel.duration);

      return () => {
        clearInterval(jumpInterval);
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

  const handleFrogTap = () => {
    if (gameState === 'playing') {
      setScore(prev => prev + 1);
      moveFrog();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#06B6D4', '#164E63']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.levelName}>{LEVELS[level].name}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>🐸 {score} / {LEVELS[level].jumps}</Text>
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
              <Text style={styles.frogEmoji}>🐸</Text>
              <Text style={styles.menuTitle}>Lily Pad Leap</Text>
              <Text style={styles.menuSubtitle}>Help our froggy friend jump! Tap the frog as fast as you can to follow him across the pond.</Text>
              <TouchableOpacity style={styles.startButton} onPress={startLevel}>
                <Text style={styles.startButtonText}>Start Leaping</Text>
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
              {/* Lily Pads Decorations */}
              {pads.map((pad, i) => (
                <View 
                  key={i} 
                  style={[styles.pad, { left: pad.x, top: pad.y }]} 
                />
              ))}

              <MotiView
                key="frog"
                animate={{
                  translateX: frogPos.x,
                  translateY: frogPos.y,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  translateX: { type: 'timing', duration: 300 },
                  translateY: { type: 'timing', duration: 300 },
                  scale: { type: 'timing', duration: 300 },
                }}
                style={styles.frogContainer}
              >
                <TouchableOpacity onPress={handleFrogTap} activeOpacity={1}>
                  <Text style={{ fontSize: 60 }}>🐸</Text>
                </TouchableOpacity>
              </MotiView>
            </>
          )}

          {gameState === 'complete' && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.winCard}
            >
              <Text style={styles.winTitle}>Great Jumps!</Text>
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
              <Text style={styles.winSubtitle}>You caught froggy {score} times!</Text>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => level < LEVELS.length - 1 ? (setLevel(level + 1), startLevel()) : router.back()}
              >
                <Text style={styles.nextButtonText}>
                  {level < LEVELS.length - 1 ? 'Next Pond' : 'Go Home'}
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
  frogEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#164E63',
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
    backgroundColor: '#0891B2',
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
  pad: {
    position: 'absolute',
    width: 100,
    height: 60,
    backgroundColor: '#065F46',
    borderRadius: 50,
    opacity: 0.6,
  },
  frogContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#164E63',
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
    backgroundColor: '#06B6D4',
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
