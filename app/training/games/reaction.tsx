import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Zap, Target, Brain, Timer } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const TARGET_SIZE = 70;
const INITIAL_SPEED = 1500;
const GAME_DURATION = 60; // 1 minute session

export default function ReactionGame() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'summary'>('ready');
  const [target, setTarget] = useState({ x: width / 2 - TARGET_SIZE / 2, y: height / 2 - TARGET_SIZE / 2 });
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastAppearance, setLastAppearance] = useState(Date.now());
  const [missedTaps, setMissedTaps] = useState(0);

  const timerRef = useRef<any>(null);
  const gameLoopRef = useRef<any>(null);

  const stopGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
  }, []);

  const spawnTarget = useCallback(() => {
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    
    setTarget({
      x: Math.random() * (width - TARGET_SIZE - 40) + 20,
      y: Math.random() * (height * 0.5) + 100, // Keep in upper half/middle for ergonomic reach
    });
    setLastAppearance(Date.now());

    gameLoopRef.current = setTimeout(() => {
      setMissedTaps(prev => prev + 1);
      spawnTarget();
    }, speed);
  }, [speed]);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('summary');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startTimer();
      spawnTarget();
    } else {
      stopGame();
    }
    return () => stopGame();
  }, [gameState, startTimer, spawnTarget, stopGame]);

  const handlePress = () => {
    const reactionTime = Date.now() - lastAppearance;
    setReactionTimes(prev => [...prev, reactionTime]);
    setScore(prev => prev + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Difficulty scaling: speed increases every 5 points
    if ((score + 1) % 5 === 0) {
      setSpeed(prev => Math.max(600, prev - 100));
    }

    spawnTarget();
  };

  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;
  
  const accuracy = score > 0 ? Math.round((score / (score + missedTaps)) * 100) : 0;

  if (gameState === 'ready') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0F172A' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <MotiView 
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.introCard}
          >
            <View style={styles.iconCircle}>
              <Zap size={40} color="#3B82F6" fill="#3B82F6" />
            </View>
            <Text style={styles.title}>Reaction Logic</Text>
            <Text style={styles.desc}>Tap the targets as fast as you can. This session improves neural response time and coordination.</Text>
            
            <View style={styles.tipBox}>
              <Brain size={18} color="#94A3B8" />
              <Text style={styles.tipText}>Focus on the center of the screen to utilize peripheral vision.</Text>
            </View>

            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => setGameState('playing')}
            >
              <Text style={styles.startBtnText}>Start Session</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'summary') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0F172A' }]}>
        <View style={styles.center}>
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.introCard}
          >
            <Text style={styles.title}>Session Complete</Text>
            <Text style={styles.desc}>Great work! Your visual cortex is now highly engaged.</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>AVG SPEED</Text>
                <Text style={styles.statValue}>{avgReactionTime}ms</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ACCURACY</Text>
                <Text style={styles.statValue}>{accuracy}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>SCORE</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
            </View>

            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackTitle}>Brain Insight</Text>
              <Text style={styles.feedbackText}>
                {avgReactionTime < 400 
                  ? "Elite reaction speed! You're performing at the top 5% of visual processing efficiency." 
                  : "Stable performance. Consistent training will lower your response time by 10-15% this week."}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.startBtn}
              onPress={() => router.replace('/training' as any)}
            >
              <Text style={styles.startBtnText}>Finish Routine</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Timer size={16} color="#94A3B8" />
          <Text style={styles.hudValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.hudItem}>
          <Target size={16} color="#94A3B8" />
          <Text style={styles.hudValue}>{score}</Text>
        </View>
      </View>

      <AnimatePresence>
        <MotiView
          key={`${target.x}-${target.y}`}
          from={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.2 }}
          style={[
            styles.target,
            { top: target.y, left: target.x }
          ]}
        >
          <TouchableOpacity 
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.targetInner}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.gradient}
            >
                <View style={styles.targetCenter} />
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </AnimatePresence>

      <View style={styles.backgroundBlur} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  introCard: {
    backgroundColor: '#1E293B',
    padding: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  desc: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginBottom: 25 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    gap: 12,
    marginBottom: 30,
  },
  tipText: { color: '#94A3B8', fontSize: 13, flex: 1 },
  startBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  hud: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  hudValue: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    zIndex: 5,
  },
  targetInner: { flex: 1 },
  gradient: { 
    flex: 1, 
    borderRadius: TARGET_SIZE / 2, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  targetCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 5 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  feedbackBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    width: '100%',
  },
  feedbackTitle: { color: '#3B82F6', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  feedbackText: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  }
});
