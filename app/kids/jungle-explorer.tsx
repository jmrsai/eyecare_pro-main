import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const LEVELS = [
  { 
    id: 1, 
    name: 'Sunny Clearing', 
    animals: [
      { id: 'm1', name: 'Monkey', emoji: '🐵', pos: { top: 100, left: 50 } },
      { id: 't1', name: 'Tiger', emoji: '🐯', pos: { top: 300, left: 200 } },
      { id: 'f1', name: 'Frog', emoji: '🐸', pos: { top: 450, left: 80 } },
    ],
    duration: 30000 
  },
  { 
    id: 2, 
    name: 'Deep Forest', 
    animals: [
      { id: 's1', name: 'Snake', emoji: '🐍', pos: { top: 150, left: 250 } },
      { id: 'p1', name: 'Parrot', emoji: '🦜', pos: { top: 50, left: 180 } },
      { id: 'l1', name: 'Lion', emoji: '🦁', pos: { top: 400, left: 40 } },
      { id: 'e1', name: 'Elephant', emoji: '🐘', pos: { top: 250, left: 120 } },
    ],
    duration: 45000 
  },
  { 
    id: 3, 
    name: 'Twilight Jungle', 
    animals: [
      { id: 'o1', name: 'Owl', emoji: '🦉', pos: { top: 80, left: 40 } },
      { id: 'b1', name: 'Bat', emoji: '🦇', pos: { top: 200, left: 280 } },
      { id: 'k1', name: 'Koala', emoji: '🐨', pos: { top: 350, left: 150 } },
      { id: 'z1', name: 'Zebra', emoji: '🦓', pos: { top: 480, left: 260 } },
      { id: 'g1', name: 'Giraffe', emoji: '🦒', pos: { top: 180, left: 100 } },
    ],
    duration: 60000 
  },
];

export default function JungleExplorerScreen() {
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'complete'>('idle');
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const currentLevel = LEVELS[level];

  const startGame = () => {
    setGameState('playing');
    setFoundIds([]);
    setScore(0);
  };

  const handleAnimalPress = (id: string) => {
    if (!foundIds.includes(id)) {
      setFoundIds(prev => [...prev, id]);
      setScore(prev => prev + 10);
      
      if (foundIds.length + 1 === currentLevel.animals.length) {
        finishLevel();
      }
    }
  };

  const finishLevel = async () => {
    setGameState('complete');
    const earnedStars = 3; // Based on speed/completion
    
    // Update stats
    try {
      const savedStats = await AsyncStorage.getItem('kidsStats');
      let stats = savedStats ? JSON.parse(savedStats) : { totalStars: 0, gamesPlayed: 0, streakDays: 0, badges: [], todayPlayTime: 0 };
      stats.totalStars += earnedStars * 10;
      stats.gamesPlayed += 1;
      await AsyncStorage.setItem('kidsStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#065F46', '#064E3B']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.levelName}>{currentLevel.name}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
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
              <Text style={styles.menuEmoji}>🌳</Text>
              <Text style={styles.menuTitle}>Jungle Explorer</Text>
              <Text style={styles.menuSubtitle}>Look around the jungle and find all the hidden animals. Shift your focus to spot them!</Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>Start Exploring</Text>
              </TouchableOpacity>
            </MotiView>
          )}

          {gameState === 'playing' && (
            <View style={styles.playContainer}>
              {currentLevel.animals.map((animal) => (
                <MotiView
                  key={animal.id}
                  from={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: foundIds.includes(animal.id) ? 1.5 : 1,
                    top: animal.pos.top,
                    left: animal.pos.left,
                  }}
                  style={styles.animal}
                >
                  <TouchableOpacity onPress={() => handleAnimalPress(animal.id)}>
                    <Text style={[
                      styles.animalEmoji, 
                      foundIds.includes(animal.id) && { opacity: 0.5 }
                    ]}>
                      {animal.emoji}
                    </Text>
                    {foundIds.includes(animal.id) && (
                      <View style={styles.checkOverlay}>
                        <CheckCircle2 size={24} color="#10B981" />
                      </View>
                    )}
                  </TouchableOpacity>
                </MotiView>
              ))}

              <View style={styles.inventory}>
                <Text style={styles.inventoryTitle}>Find these animals:</Text>
                <View style={styles.inventoryGrid}>
                  {currentLevel.animals.map(a => (
                    <View key={a.id} style={[
                      styles.inventoryItem,
                      foundIds.includes(a.id) && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                    ]}>
                      <Text style={[styles.inventoryEmoji, foundIds.includes(a.id) && { opacity: 0.5 }]}>
                        {a.emoji}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {gameState === 'complete' && (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={styles.winCard}
            >
              <Text style={styles.winTitle}>Expert Explorer!</Text>
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
              <Text style={styles.winSubtitle}>Level {level + 1} Complete!</Text>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => level < LEVELS.length - 1 ? (setLevel(level + 1), setGameState('idle')) : router.back()}
              >
                <Text style={styles.nextButtonText}>
                  {level < LEVELS.length - 1 ? 'Next Area' : 'Finish Adventure'}
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
    marginTop: height * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  menuEmoji: {
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
  playContainer: {
    flex: 1,
  },
  animal: {
    position: 'absolute',
    padding: 10,
  },
  animalEmoji: {
    fontSize: 50,
  },
  checkOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  inventory: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  inventoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  inventoryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  inventoryItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryEmoji: {
    fontSize: 24,
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
