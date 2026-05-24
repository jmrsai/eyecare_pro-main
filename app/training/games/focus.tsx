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
import { ArrowLeft, RefreshCw, Eye, Award } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SNELLEN_LETTERS = ['E', 'H', 'N', 'P', 'R', 'T', 'V', 'Z', 'D', 'F'];

export default function FocusShiftGame() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'summary'>('instructions');
  const [focusTarget, setFocusTarget] = useState<'NEAR' | 'FAR'>('NEAR');
  const [rounds, setRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('E');
  const [letterSize, setLetterSize] = useState(120); // Font size for Far target

  const startTimeRef = useRef<number>(0);
  const shiftTimesRef = useRef<number[]>([]);

  const startPlaying = () => {
    setRounds(0);
    setScore(0);
    shiftTimesRef.current = [];
    setFocusTarget('NEAR');
    setGameState('playing');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleFocusShift = () => {
    const shiftTime = Date.now() - startTimeRef.current;
    if (rounds > 0) {
      shiftTimesRef.current.push(shiftTime);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (focusTarget === 'NEAR') {
      // Transition to FAR: randomize next letter and size
      const randomLetter = SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)];
      setCurrentLetter(randomLetter);
      // Alter letter size to force focus adaptation (Snellen visual angles)
      setLetterSize(40 + Math.random() * 80);
      setFocusTarget('FAR');
      setScore(s => s + 5);
    } else {
      // Transition to NEAR
      setFocusTarget('NEAR');
      setScore(s => s + 5);
      setRounds(r => r + 1);
    }

    if (rounds >= 10 && focusTarget === 'FAR') {
      endGame();
    } else {
      startTimeRef.current = Date.now();
    }
  };

  const endGame = () => {
    setGameState('summary');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getAverageShiftTime = () => {
    if (shiftTimesRef.current.length === 0) return 0;
    const total = shiftTimesRef.current.reduce((a, b) => a + b, 0);
    return Math.round(total / shiftTimesRef.current.length);
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
          <Text style={styles.headerTitle}>Focus Shift Gym</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      {/* ── INSTRUCTIONS STATE ── */}
      {gameState === 'instructions' && (
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <View style={styles.iconCircle}>
              <Eye size={40} color="#10B981" />
            </View>
            <Text style={styles.title}>Accommodative Shift</Text>
            <Text style={styles.desc}>
              Strengthens ciliary eye muscles and trains focusing speed between close and far focal planes.
            </Text>

            <View style={styles.steps}>
              <Text style={styles.stepText}>• **NEAR target**: Hold your thumb 10 inches in front of your nose. Focus on your fingerprint.</Text>
              <Text style={styles.stepText}>• **FAR target**: Look at the glowing Snellen letter on the screen at arm{"'"}s length.</Text>
              <Text style={styles.stepText}>• Tap the bottom button as soon as your vision becomes sharp on each target.</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={startPlaying}>
              <Text style={styles.btnText}>Start Focus Workout</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {/* ── PLAYING STATE ── */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          <View style={styles.statusBox}>
            <Text style={styles.roundsText}>Round: {rounds + 1}/10</Text>
            <Text style={styles.scoreText}>XP Score: {score}</Text>
          </View>

          {/* Visual Focus Prompt */}
          <View style={styles.focusContainer}>
            {focusTarget === 'NEAR' ? (
              <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={styles.nearPrompt}
              >
                <Text style={styles.nearEmoji}>👍</Text>
                <Text style={styles.nearTitle}>FOCUS ON YOUR THUMB</Text>
                <Text style={styles.nearSub}>Keep your thumb ~10 inches in front of your eyes until sharp.</Text>
              </MotiView>
            ) : (
              <MotiView
                from={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={styles.farPrompt}
              >
                <Text style={[styles.snellenLetter, { fontSize: letterSize }]}>
                  {currentLetter}
                </Text>
                <Text style={styles.farTitle}>FOCUS ON THE LETTER</Text>
                <Text style={styles.farSub}>Align your focus to resolve this letter clearly.</Text>
              </MotiView>
            )}
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={handleFocusShift}>
            <RefreshCw size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>
              {focusTarget === 'NEAR' ? 'Focused near (switching to far...)' : 'Focused far (switching to near...)'}
            </Text>
          </TouchableOpacity>
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
            <Text style={styles.title}>Session Complete</Text>
            <Text style={styles.desc}>Excellent accommodation adaptability!</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ACCOMMODATION SCORE</Text>
                <Text style={styles.statValue}>{score} XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG ADAPTATION TIME</Text>
                <Text style={styles.statValue}>{getAverageShiftTime()} ms</Text>
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
  playArea: { flex: 1, justifyContent: 'space-between', paddingTop: 110, paddingBottom: 40, paddingHorizontal: 24 },
  statusBox: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  roundsText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  scoreText: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  
  focusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  nearPrompt: { alignItems: 'center', paddingHorizontal: 20 },
  nearEmoji: { fontSize: 80, marginBottom: 16 },
  nearTitle: { color: '#ffb74d', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  nearSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  farPrompt: { alignItems: 'center', paddingHorizontal: 20 },
  snellenLetter: { color: '#00e5ff', fontWeight: '900', textAlign: 'center', marginBottom: 16, textShadowColor: '#00e5ff', textShadowRadius: 10 },
  farTitle: { color: '#00e5ff', fontSize: 20, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  farSub: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  actionBtn: {
    backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 20,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#3B82F6', shadowOpacity: 0.4, shadowRadius: 8,
  },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Summary
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
