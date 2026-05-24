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
import { ArrowLeft, Eye, Award, CheckCircle } from 'lucide-react-native';
import { Camera, CameraView } from 'expo-camera';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

type BlinkStep = 'OPEN' | 'CLOSE' | 'HOLD' | 'OPEN_WAIT';

export default function BlinkTrainingScreen() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'summary'>('instructions');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Guided steps
  const [blinkStep, setBlinkStep] = useState<BlinkStep>('OPEN');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const totalCycles = 10;

  const timerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startPlaying = () => {
    setCyclesCompleted(0);
    setGameState('playing');
    runBlinkGuideCycle('OPEN');
  };

  const runBlinkGuideCycle = (step: BlinkStep) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBlinkStep(step);

    if (step === 'OPEN') {
      // Prompt user to blink naturally, prepare for squeeze
      setSecondsRemaining(3);
      timerRef.current = setInterval(() => {
        setSecondsRemaining(s => {
          if (s <= 1) {
            runBlinkGuideCycle('CLOSE');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } 
    else if (step === 'CLOSE') {
      // Prompt user to close eyes completely
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSecondsRemaining(2);
      timerRef.current = setInterval(() => {
        setSecondsRemaining(s => {
          if (s <= 1) {
            runBlinkGuideCycle('HOLD');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } 
    else if (step === 'HOLD') {
      // Prompt user to squeeze/hold eyes closed to release lipids
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setSecondsRemaining(2);
      timerRef.current = setInterval(() => {
        setSecondsRemaining(s => {
          if (s <= 1) {
            runBlinkGuideCycle('OPEN_WAIT');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } 
    else if (step === 'OPEN_WAIT') {
      // Prompt user to open eyes, wait 4 seconds before next cycle
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextCycle = cyclesCompleted + 1;
      setCyclesCompleted(nextCycle);

      if (nextCycle >= totalCycles) {
        endGame();
        return;
      }

      setSecondsRemaining(4);
      timerRef.current = setInterval(() => {
        setSecondsRemaining(s => {
          if (s <= 1) {
            runBlinkGuideCycle('OPEN');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
  };

  const endGame = () => {
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
          <Text style={styles.headerTitle}>Blink & Lubricate</Text>
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
            <Text style={styles.title}>Lipid Release Blink Training</Text>
            <Text style={styles.desc}>
              Did you know? Screen usage decreases your blink rate by 60%, leading to meibomian gland blockage and dry eyes. This exercise guides you through clinical blink compression cycles.
            </Text>

            <View style={styles.steps}>
              <Text style={styles.stepText}>• **Step 1**: Keep eyes open naturally.</Text>
              <Text style={styles.stepText}>• **Step 2**: Close eyes completely (do not squeeze).</Text>
              <Text style={styles.stepText}>• **Step 3**: Squeeze eyes gently for 2 seconds to activate meibomian glands.</Text>
              <Text style={styles.stepText}>• **Step 4**: Open eyes and relax. Repeat for 10 cycles.</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={startPlaying}>
              <Text style={styles.btnText}>Start Blink Gym</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      )}

      {/* ── PLAYING STATE ── */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          <View style={styles.statusBox}>
            <Text style={styles.roundsText}>Cycle: {cyclesCompleted + 1}/{totalCycles}</Text>
            <Text style={styles.scoreText}>Lipids Released: {cyclesCompleted * 10}%</Text>
          </View>

          {/* Camera Viewfinder (optional / live biofeedback background) */}
          {hasPermission && (
            <View style={styles.cameraFrame}>
              <CameraView style={styles.camera} facing="front" />
            </View>
          )}

          {/* Interactive Paced Guideline */}
          <View style={styles.guideWrapper}>
            <MotiView
              key={blinkStep}
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={[
                styles.instructionBubble,
                {
                  borderColor: 
                    blinkStep === 'CLOSE' ? '#ffb74d' :
                    blinkStep === 'HOLD' ? '#ef5350' : '#00e5ff'
                }
              ]}
            >
              <Text style={styles.stepTimer}>{secondsRemaining}s</Text>
              <Text style={[styles.stepTitle, {
                color: 
                  blinkStep === 'CLOSE' ? '#ffb74d' :
                  blinkStep === 'HOLD' ? '#ef5350' : '#00e5ff'
              }]}>
                {blinkStep === 'OPEN' && 'LOOK AT CAMERA'}
                {blinkStep === 'CLOSE' && 'CLOSE EYES'}
                {blinkStep === 'HOLD' && 'SQUEEZE GENTLY'}
                {blinkStep === 'OPEN_WAIT' && 'OPEN AND LUBRICATE'}
              </Text>
              <Text style={styles.stepDesc}>
                {blinkStep === 'OPEN' && 'Keep eyes open, look at the viewfinder'}
                {blinkStep === 'CLOSE' && 'Close your eyelids completely'}
                {blinkStep === 'HOLD' && 'Apply gentle pressure to release natural tear lipids'}
                {blinkStep === 'OPEN_WAIT' && 'Open your eyes, feel the natural tear film spread'}
              </Text>
            </MotiView>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(cyclesCompleted / totalCycles) * 100}%` }]} />
            </View>
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
            <CheckCircle size={56} color="#00e676" style={{ marginBottom: 16 }} />
            <Text style={styles.title}>Lachrymal Glands Activated</Text>
            <Text style={styles.desc}>Complete clinical blink compression achieved!</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CYCLES COMPLETED</Text>
                <Text style={styles.statValue}>{totalCycles} / 10</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>TEAR FILM STATUS</Text>
                <Text style={styles.statValue}>Lubricated</Text>
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
  desc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
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

  cameraFrame: {
    alignSelf: 'center', width: 150, height: 150, borderRadius: 75,
    overflow: 'hidden', borderWidth: 3, borderColor: '#00e5ff', marginBottom: 20,
    shadowColor: '#00e5ff', shadowOpacity: 0.4, shadowRadius: 10,
  },
  camera: { flex: 1 },

  guideWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionBubble: {
    backgroundColor: '#1E293B', padding: 24, borderRadius: 24,
    borderWidth: 2, alignItems: 'center', alignSelf: 'stretch',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12,
  },
  stepTimer: { fontSize: 48, fontWeight: '900', color: '#fff', marginBottom: 8 },
  stepTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5, marginBottom: 8 },
  stepDesc: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18 },

  progressContainer: { paddingHorizontal: 12, marginTop: 20 },
  progressBar: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00e676' },

  // Summary
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
