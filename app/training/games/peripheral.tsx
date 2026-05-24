import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Target, Award, Play } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface TargetPoint {
  x: number; // percentage from center
  y: number; // percentage from center
  quadrant: 'TL' | 'TR' | 'BL' | 'BR';
}

const QUADRANTS: ('TL' | 'TR' | 'BL' | 'BR')[] = ['TL', 'TR', 'BL', 'BR'];

export default function PeripheralScopeGame() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'summary'>('instructions');
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<TargetPoint | null>(null);
  const [targetVisible, setTargetVisible] = useState(false);
  const [avgReactionTime, setAvgReactionTime] = useState(0);

  const startTimeRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  const gameTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
    };
  }, []);

  const startPlaying = () => {
    setScore(0);
    setRounds(0);
    reactionTimesRef.current = [];
    setGameState('playing');
    spawnTarget();
  };

  const spawnTarget = () => {
    if (rounds >= 10) {
      endGame();
      return;
    }

    setTargetVisible(false);
    setCurrentTarget(null);

    // Random delay before spawn (800ms - 2200ms)
    const delay = 800 + Math.random() * 1400;
    gameTimeoutRef.current = setTimeout(() => {
      const quad = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];
      
      // Calculate coordinates in outer perimeter based on quadrant
      let x = 0;
      let y = 0;
      const spread = 25 + Math.random() * 15; // 25% to 40% offset from center

      if (quad === 'TL') { x = -spread; y = -spread; }
      else if (quad === 'TR') { x = spread; y = -spread; }
      else if (quad === 'BL') { x = -spread; y = spread; }
      else if (quad === 'BR') { x = spread; y = spread; }

      setCurrentTarget({ x, y, quadrant: quad });
      setTargetVisible(true);
      startTimeRef.current = Date.now();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Target disappears after 1.5 seconds if no response
      gameTimeoutRef.current = setTimeout(() => {
        setTargetVisible(false);
        setRounds(r => r + 1);
        spawnTarget();
      }, 1500);

    }, delay);
  };

  const handleQuadTap = (selectedQuad: 'TL' | 'TR' | 'BL' | 'BR') => {
    if (!targetVisible || !currentTarget) return;

    if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
    setTargetVisible(false);

    const reactionTime = Date.now() - startTimeRef.current;
    
    if (selectedQuad === currentTarget.quadrant) {
      setScore(s => s + 10);
      reactionTimesRef.current.push(reactionTime);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    setRounds(r => r + 1);
    spawnTarget();
  };

  const endGame = () => {
    setGameState('summary');
    const totalTimes = reactionTimesRef.current.reduce((a, b) => a + b, 0);
    const avg = reactionTimesRef.current.length > 0 
      ? Math.round(totalTimes / reactionTimesRef.current.length) 
      : 0;
    setAvgReactionTime(avg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Game Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Peripheral Scope</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      {/* ── INSTRUCTIONS STATE ── */}
      {gameState === 'instructions' && (
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <View style={styles.iconCircle}>
              <Target size={40} color="#10B981" />
            </View>
            <Text style={styles.title}>Peripheral Vision Scope</Text>
            <Text style={styles.desc}>
              Trains your outer visual field attention. Helps improve reaction times and peripheral mapping.
            </Text>

            <View style={styles.steps}>
              <Text style={styles.stepText}>• Keep your eyes focused strictly on the CENTER dot.</Text>
              <Text style={styles.stepText}>• Visual targets will flash briefly in the periphery.</Text>
              <Text style={styles.stepText}>• Tap the correct direction button (TL, TR, BL, BR) where the target flashed without moving your eyes.</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={startPlaying}>
              <Text style={styles.btnText}>Start Test</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {/* ── PLAYING STATE ── */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          {/* Target canvas */}
          <View style={styles.canvas}>
            {/* Center Fixation Dot */}
            <View style={styles.fixationDot}>
              <View style={styles.fixationDotInner} />
            </View>

            {/* Glowing Peripheral Target */}
            {targetVisible && currentTarget && (
              <MotiView
                from={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={[
                  styles.targetDot,
                  {
                    left: `${50 + currentTarget.x}%`,
                    top: `${50 + currentTarget.y}%`,
                  },
                ]}
              />
            )}
          </View>

          {/* Directional Tap Buttons overlay */}
          <View style={styles.controlGrid}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleQuadTap('TL')}
              >
                <Text style={styles.actionBtnText}>TL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleQuadTap('TR')}
              >
                <Text style={styles.actionBtnText}>TR</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleQuadTap('BL')}
              >
                <Text style={styles.actionBtnText}>BL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleQuadTap('BR')}
              >
                <Text style={styles.actionBtnText}>BR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.hud}>
            <Text style={styles.hudText}>Score: {score} XP</Text>
            <Text style={styles.hudText}>Round: {rounds + 1}/10</Text>
          </View>
        </View>
      )}

      {/* ── SUMMARY STATE ── */}
      {gameState === 'summary' && (
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.card}
          >
            <Award size={56} color="#ffd54f" style={{ marginBottom: 16 }} />
            <Text style={styles.title}>Scope Completed</Text>
            <Text style={styles.desc}>Excellent visual focus maintained!</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>XP SCORE</Text>
                <Text style={styles.statValue}>{score} XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG TIME</Text>
                <Text style={styles.statValue}>{avgReactionTime} ms</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/exercises')}>
              <Text style={styles.btnText}>Return to Gym</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: 'rgba(9, 13, 26, 0.8)',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  card: {
    backgroundColor: '#1E293B', padding: 32, borderRadius: 32,
    width: '100%', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  steps: { alignSelf: 'stretch', gap: 12, marginBottom: 32, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 },
  stepText: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  btn: {
    backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16,
    alignSelf: 'stretch', alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Play Area
  playArea: { flex: 1, justifyContent: 'space-between', paddingTop: 100, paddingBottom: 40 },
  canvas: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  fixationDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  fixationDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00e5ff' },
  targetDot: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e040fb', marginLeft: -12, marginTop: -12,
    shadowColor: '#e040fb', shadowOpacity: 0.8, shadowRadius: 10,
  },

  // Controls
  controlGrid: { paddingHorizontal: 24, gap: 14, marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 14 },
  actionBtn: {
    flex: 1, height: 72, backgroundColor: '#1E293B', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155',
  },
  actionBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  hud: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  hudText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },

  // Summary
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
