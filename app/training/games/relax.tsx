import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Moon, Sun, CheckCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

type BreathState = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export default function PalmingRelaxationScreen() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'summary'>('instructions');
  const [breathState, setBreathState] = useState<BreathState>('INHALE');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const totalCycles = 8;

  const breathAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRelaxing = () => {
    setCyclesCompleted(0);
    setGameState('playing');
    runBreathCycle('INHALE');
  };

  const runBreathCycle = (state: BreathState) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBreathState(state);
    setSecondsRemaining(4);

    // Trigger haptics and animate breathing scale
    if (state === 'INHALE') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(breathAnim, {
        toValue: 2.0,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    } else if (state === 'EXHALE') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(breathAnim, {
        toValue: 1.0,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(s => {
        if (s <= 1) {
          transitionToNextBreathState(state);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const transitionToNextBreathState = (current: BreathState) => {
    if (current === 'INHALE') {
      runBreathCycle('HOLD_IN');
    } else if (current === 'HOLD_IN') {
      runBreathCycle('EXHALE');
    } else if (current === 'EXHALE') {
      runBreathCycle('HOLD_OUT');
    } else if (current === 'HOLD_OUT') {
      const nextCycle = cyclesCompleted + 1;
      setCyclesCompleted(nextCycle);
      if (nextCycle >= totalCycles) {
        endSession();
      } else {
        runBreathCycle('INHALE');
      }
    }
  };

  const endSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('summary');
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
          <Text style={styles.headerTitle}>Deep Palming Relax</Text>
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
              <Moon size={40} color="#8B5CF6" />
            </View>
            <Text style={styles.title}>Palming Darkness Therapy</Text>
            <Text style={styles.desc}>
              Palming blocks all light, resting the photoreceptors, warming the eyelids, and activating the parasympathetic system.
            </Text>

            <View style={styles.steps}>
              <Text style={styles.stepText}>• **Step 1**: Rub your hands together vigorously for 15 seconds to generate heat.</Text>
              <Text style={styles.stepText}>• **Step 2**: Close your eyes, cup your hands, and place them gently over your eyes.</Text>
              <Text style={styles.stepText}>• **Step 3**: Block all light completely. Do not apply pressure on your eyeballs.</Text>
              <Text style={styles.stepText}>• **Step 4**: Follow the paced breathing guide. Inhale, Hold, Exhale, Hold.</Text>
            </View>

            <TouchableOpacity style={styles.btnPalming} onPress={startRelaxing}>
              <Text style={styles.btnText}>Start Palming</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {/* ── PLAYING STATE ── */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          <View style={styles.statusBox}>
            <Text style={styles.roundsText}>Pacing: {cyclesCompleted + 1}/{totalCycles} cycles</Text>
            <Text style={styles.scoreText}>Ciliary Tension: Relaxing</Text>
          </View>

          {/* Animated Breathing Circle */}
          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingRingOuter,
                {
                  transform: [{ scale: breathAnim }],
                  borderColor:
                    breathState === 'INHALE' ? '#00e5ff' :
                    breathState === 'EXHALE' ? '#8B5CF6' : 'rgba(255,255,255,0.2)'
                }
              ]}
            >
              <View style={styles.breathingRingInner}>
                <Text style={styles.timerText}>{secondsRemaining}s</Text>
                <Text style={styles.breathStateText}>
                  {breathState === 'INHALE' && 'INHALE'}
                  {breathState === 'HOLD_IN' && 'HOLD'}
                  {breathState === 'EXHALE' && 'EXHALE'}
                  {breathState === 'HOLD_OUT' && 'HOLD'}
                </Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.tipBox}>
            <Sun size={18} color="#94A3B8" />
            <Text style={styles.tipText}>
              Rub hands warm before placing over eyes. Ensure complete darkness.
            </Text>
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
            <CheckCircle size={56} color="#8B5CF6" style={{ marginBottom: 16 }} />
            <Text style={styles.title}>Visual Ciliary Restored</Text>
            <Text style={styles.desc}>Photoreceptors successfully rested. Feel free to slowly open your eyes and blink.</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CYCLES COMPLETED</Text>
                <Text style={styles.statValue}>{totalCycles} / {totalCycles}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>STRESS INDEX</Text>
                <Text style={styles.statValue}>Optimal</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btnPalming} onPress={() => router.replace('/(tabs)/exercises')}>
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
    backgroundColor: 'rgba(139, 92, 246, 0.1)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  steps: { alignSelf: 'stretch', gap: 12, marginBottom: 32, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 },
  stepText: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  btnPalming: {
    backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 16,
    alignSelf: 'stretch', alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Play Area
  playArea: { flex: 1, justifyContent: 'space-between', paddingTop: 110, paddingBottom: 40, paddingHorizontal: 24 },
  statusBox: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  roundsText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  scoreText: { color: '#8B5CF6', fontSize: 14, fontWeight: '700' },

  breathingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breathingRingOuter: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 6,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#090d1a',
  },
  breathingRingInner: { alignItems: 'center' },
  timerText: { fontSize: 44, fontWeight: '900', color: '#fff' },
  breathStateText: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginTop: 4 },

  tipBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1E293B', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  tipText: { flex: 1, color: '#94A3B8', fontSize: 11, lineHeight: 16 },

  // Summary
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
