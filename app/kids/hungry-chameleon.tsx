import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, RotateCcw, Star, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const INSECT_SIZE = 40;
const CHAMELEON_SIZE = 80;

const getRandomPosition = () => ({
  x: Math.random() * (width - INSECT_SIZE),
  y: Math.random() * (height - 200 - INSECT_SIZE) + 100,
});

export default function HungryChameleonGame() {
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [insects, setInsects] = useState<{ id: number; position: Animated.ValueXY; type: string }[]>([]);
  const insectId = useRef(0);

  const createInsect = useCallback(() => {
    const newInsect = {
      id: insectId.current++,
      position: new Animated.ValueXY(getRandomPosition()),
      type: Math.random() > 0.5 ? '🦋' : '🐞',
    };
    setInsects(prev => [...prev, newInsect]);

    Animated.timing(newInsect.position, {
      toValue: getRandomPosition(),
      duration: 2000 + Math.random() * 1000,
      useNativeDriver: false,
    }).start(() => {
      setInsects(prev => prev.filter(i => i.id !== newInsect.id));
    });
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGamePhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const insectInterval = setInterval(createInsect, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(insectInterval);
    };
  }, [gamePhase, createInsect]);

  const handleCatch = (insectId: number) => {
    setInsects(prev => prev.filter(i => i.id !== insectId));
    setScore(prev => prev + 10);
  };

  const startGame = () => {
    setGamePhase('playing');
    setScore(0);
    setTimeLeft(30);
    setInsects([]);
  };

  const resetGame = () => {
    setGamePhase('intro');
  };

    if (gamePhase === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.introContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          <Text style={styles.introTitle}>Hungry Chameleon 🦎</Text>
          <Text style={styles.introText}>
            Help Charlie the chameleon catch as many insects as you can before time runs out!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Catching</Text>
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
          <Text style={styles.completeTitle}>Time's Up!</Text>
          <Text style={styles.completeText}>You caught {score / 10} insects!</Text>
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
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <Text style={styles.headerText}>Time: {timeLeft}s | Score: {score}</Text>
      </LinearGradient>
      <View style={styles.gameArea}>
        {insects.map(insect => (
          <Animated.View key={insect.id} style={[insect.position.getLayout(), styles.insect]}>
            <TouchableOpacity onPress={() => handleCatch(insect.id)}>
              <Text style={styles.insectText}>{insect.type}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={styles.chameleonContainer}>
          <Text style={styles.chameleon}>🦎</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBBF24',
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
  gameArea: {
    flex: 1,
  },
  insect: {
    position: 'absolute',
    width: INSECT_SIZE,
    height: INSECT_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insectText: {
    fontSize: 28,
  },
  chameleonContainer: {
    position: 'absolute',
    bottom: 20,
    left: width / 2 - CHAMELEON_SIZE / 2,
    alignItems: 'center',
  },
  chameleon: {
    fontSize: CHAMELEON_SIZE - 20,
  },
   introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
     backgroundColor: '#FBBF24',
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
    backgroundColor: '#B45309',
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
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FBBF24',
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
    backgroundColor: '#B45309',
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
