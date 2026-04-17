import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, RotateCcw, Star, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NUM_PADS = 7;

export default function LilyPadLeapGame() {
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [padAnimations] = useState(Array.from({ length: NUM_PADS }, () => new Animated.Value(1)));

  const generateSequence = () => {
    const newSequence: number[] = [];
    for (let i = 0; i < level + 2; i++) {
      newSequence.push(Math.floor(Math.random() * NUM_PADS));
    }
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = (seq: number[]) => {
    setPlayerTurn(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        lightUpPad(seq[i]);
        i++;
      } else {
        clearInterval(interval);
        setPlayerTurn(true);
      }
    }, 800 - level * 100);
  };

  const lightUpPad = (padIndex: number) => {
    Animated.sequence([
      Animated.timing(padAnimations[padIndex], {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(padAnimations[padIndex], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePadPress = (padIndex: number) => {
    if (!playerTurn) return;

    lightUpPad(padIndex);
    const newPlayerSequence = [...playerSequence, padIndex];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      // Incorrect sequence
      setGamePhase('complete');
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Correct sequence
      setScore(score + level * 10);
      setPlayerSequence([]);
      if (level < 5) {
        setLevel(level + 1);
        setTimeout(generateSequence, 1000);
      } else {
        setGamePhase('complete');
      }
    }
  };

  const startGame = () => {
    setGamePhase('playing');
    setScore(0);
    setLevel(1);
    setPlayerSequence([]);
    setTimeout(generateSequence, 500);
  };

  const resetGame = () => {
    setGamePhase('intro');
    setScore(0);
    setLevel(1);
  };

  if (gamePhase === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.introContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          <Text style={styles.introTitle}>Lily Pad Leap 🐸</Text>
          <Text style={styles.introText}>
            Help the frog leap to the correct lily pads! Watch the sequence and repeat it.
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Leaping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          <Trophy size={80} color="#FFD700" />
          <Text style={styles.completeTitle}>Great Job!</Text>
          <Text style={styles.completeText}>You earned {score} points!</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Star size={24} color="#FFD700" />
              <Text style={styles.scoreNumber}>{score}</Text>
              <Text style={styles.scoreLabel}>Points</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.header}>
        <Text style={styles.headerText}>Level: {level} | Score: {score}</Text>
      </LinearGradient>
      <View style={styles.gameContainer}>
        {padAnimations.map((anim, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: anim }] }}>
            <TouchableOpacity style={styles.lilyPad} onPress={() => handlePadPress(i)}>
              <Text style={styles.lilyPadText}>{i + 1}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {playerTurn ? 'Your Turn!' : 'Watch Carefully...'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  introText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#15803D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lilyPad: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderWidth: 3,
    borderColor: '#16A34A',
  },
  lilyPadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
  },
  completeText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: '#15803D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playAgainText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
   scoreCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#C7D2FE',
  },
   backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
