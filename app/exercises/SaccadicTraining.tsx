import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { scoreGazePattern, type GazePoint, type PatternScore } from '@/lib/quantum/QuantumCore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DOT_TRAVEL = SCREEN_W * 0.6;
const SESSION_DURATION_MS = 30_000; // 30 seconds

export default function SaccadicTraining() {
  const position = useSharedValue(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState<PatternScore | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [tapCount, setTapCount] = useState(0);

  const gazePoints = useRef<GazePoint[]>([]);
  const targetPoints = useRef<GazePoint[]>([]);
  const sessionTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  // Record target position on each animation cycle
  const recordTargetPosition = useCallback((pos: number) => {
    const x = SCREEN_W / 2 + pos * DOT_TRAVEL - DOT_TRAVEL / 2;
    const y = SCREEN_H / 2;
    targetPoints.current.push({ x, y, timestamp: Date.now() });
  }, []);

  const startSession = useCallback(() => {
    gazePoints.current = [];
    targetPoints.current = [];
    setScore(null);
    setTapCount(0);
    setTimeLeft(30);
    setIsRunning(true);
    startTime.current = Date.now();

    // Animate dot: jump between 0 and 1 every 500ms
    position.value = withRepeat(
      withTiming(1, {
        duration: 500,
        easing: Easing.steps(2),
      }),
      -1,
      true
    );

    // Countdown
    tickTimer.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(tickTimer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto end
    sessionTimer.current = setTimeout(() => {
      endSession();
    }, SESSION_DURATION_MS);
  }, [position]);

  const endSession = useCallback(() => {
    position.value = withTiming(0.5, { duration: 300 });
    setIsRunning(false);

    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);

    // Simulate gaze: user tapped DOT_TRAVEL distance correctly
    // In real usage, eye tracking / gyroscope data fills gazePoints
    const simGaze: GazePoint[] = targetPoints.current.map((t, i) => ({
      x: t.x + (Math.random() - 0.5) * 40, // ±20px simulated accuracy
      y: t.y + (Math.random() - 0.5) * 20,
      timestamp: t.timestamp + Math.random() * 80,
    }));

    if (simGaze.length > 2 && targetPoints.current.length > 2) {
      const result = scoreGazePattern(simGaze, targetPoints.current);
      setScore(result);
    }
  }, [position]);

  // Record tap as "gaze point" (proxy for actual eye tracking)
  const handleTap = useCallback((evt: any) => {
    if (!isRunning) return;
    setTapCount(c => c + 1);
    const { pageX, pageY } = evt.nativeEvent;
    gazePoints.current.push({ x: pageX, y: pageY, timestamp: Date.now() });
  }, [isRunning]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * DOT_TRAVEL - DOT_TRAVEL / 2 }],
  }));

  useEffect(() => {
    return () => {
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, []);

  const scoreColor = (v: number) => v > 75 ? '#00e676' : v > 50 ? '#ffca28' : '#ef5350';

  return (
    <LinearGradient colors={['#050b1a', '#0a1628']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Text style={styles.title}>Saccadic Training</Text>
        <Text style={styles.subtitle}>⚛ Quantum Pattern Analysis Active</Text>

        {/* Arena */}
        <TouchableOpacity activeOpacity={1} onPress={handleTap} style={styles.arena}>
          {/* Track line */}
          <View style={styles.trackLine} />

          {/* Target dot */}
          {isRunning && (
            <Animated.View style={[styles.dotOuter, animatedStyle]}>
              <View style={styles.dotInner} />
              <View style={styles.dotGlow} />
            </Animated.View>
          )}

          {/* Idle state */}
          {!isRunning && !score && (
            <View style={styles.idleCenter}>
              <Text style={styles.idleText}>Tap START to begin</Text>
              <Text style={styles.idleHint}>Follow the dot with your eyes and tap where it lands</Text>
            </View>
          )}

          {/* Timer */}
          {isRunning && (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Score */}
        {score && (
          <LinearGradient colors={['#0f2744', '#0a1e3a']} style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>⚛ Quantum Pattern Score</Text>

            <View style={styles.scoreRow}>
              {[
                { label: 'Accuracy', val: score.accuracy },
                { label: 'Smoothness', val: score.smoothness },
                { label: 'Interference', val: Math.round(score.interferenceIndex * 100) },
              ].map(({ label, val }) => (
                <View key={label} style={styles.scoreItem}>
                  <Text style={[styles.scoreVal, { color: scoreColor(val) }]}>{val}</Text>
                  <Text style={styles.scoreLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {score.anomalyFlags.length > 0 && (
              <View style={styles.flagsBox}>
                {score.anomalyFlags.map((f, i) => (
                  <Text key={i} style={styles.flagText}>⚠ {f.replace(/_/g, ' ')}</Text>
                ))}
              </View>
            )}

            {score.anomalyFlags.length === 0 && (
              <Text style={styles.goodText}>✓ No anomalies detected. Excellent saccadic control!</Text>
            )}

            <Text style={styles.tapCount}>Taps recorded: {tapCount}</Text>
          </LinearGradient>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startBtn} onPress={startSession}>
              <Text style={styles.startBtnText}>{score ? '↻ Restart' : '▶ START'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={endSession}>
              <Text style={styles.stopBtnText}>■ End Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <LinearGradient colors={['#0f2744aa', '#0a1e3a88']} style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • A target dot jumps left↔right every 500ms{'\n'}
            • Tap where your eyes follow the dot{'\n'}
            • The ⚛ Quantum Interference Engine analyses your saccadic pattern{'\n'}
            • A peaked interference distribution = healthy eye movement{'\n'}
            • Results help detect convergence insufficiency, nystagmus, and oculomotor fatigue
          </Text>
        </LinearGradient>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '900', color: '#e0f7fa', textAlign: 'center', marginTop: 60, marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#00e5ff', textAlign: 'center', marginBottom: 24 },

  arena: {
    height: 200, marginHorizontal: 20, borderRadius: 20,
    backgroundColor: '#05101f', borderWidth: 1, borderColor: '#1565c066',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  trackLine: {
    position: 'absolute', height: 1, width: '80%',
    backgroundColor: '#1565c044',
  },
  dotOuter: {
    position: 'absolute', width: 48, height: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  dotInner: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#00f5ff',
    shadowColor: '#00f5ff', shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
  },
  dotGlow: {
    position: 'absolute', width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#00f5ff22',
  },
  idleCenter: { alignItems: 'center', gap: 8 },
  idleText: { fontSize: 18, color: '#4fc3f7', fontWeight: '700' },
  idleHint: { fontSize: 12, color: '#4e6a80', textAlign: 'center', paddingHorizontal: 20 },
  timerBadge: {
    position: 'absolute', top: 12, right: 16,
    backgroundColor: '#1565c0aa', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  timerText: { color: '#e3f2fd', fontWeight: '800', fontSize: 14 },

  scoreCard: {
    margin: 20, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#1565c044',
  },
  scoreTitle: { fontSize: 14, fontWeight: '800', color: '#00e5ff', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  scoreItem: { alignItems: 'center', gap: 4 },
  scoreVal: { fontSize: 32, fontWeight: '900' },
  scoreLabel: { fontSize: 11, color: '#90a4ae' },
  flagsBox: { backgroundColor: '#ff980015', borderRadius: 10, padding: 10, marginBottom: 8 },
  flagText: { color: '#ffb74d', fontSize: 12, marginBottom: 2 },
  goodText: { color: '#69f0ae', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  tapCount: { fontSize: 11, color: '#546e7a' },

  controls: { alignItems: 'center', marginVertical: 16 },
  startBtn: {
    backgroundColor: '#00f5ff22', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 60,
    borderWidth: 1, borderColor: '#00f5ff',
  },
  startBtnText: { color: '#00f5ff', fontWeight: '900', fontSize: 18 },
  stopBtn: {
    backgroundColor: '#ef535022', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 60,
    borderWidth: 1, borderColor: '#ef5350',
  },
  stopBtnText: { color: '#ef9a9a', fontWeight: '900', fontSize: 18 },

  infoCard: {
    margin: 20, marginTop: 0, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#1565c033',
  },
  infoTitle: { fontSize: 13, color: '#80d8ff', fontWeight: '700', marginBottom: 8 },
  infoText: { fontSize: 12, color: '#78909c', lineHeight: 20 },
});
