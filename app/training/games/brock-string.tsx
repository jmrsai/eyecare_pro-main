import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Target, Shield, HelpCircle, Activity } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface Bead {
  id: string;
  name: string;
  color: string;
  positionY: number; // percentage from top (10 to 90)
}

const BEADS: Bead[] = [
  { id: 'red', name: 'RED', color: '#EF4444', positionY: 25 },
  { id: 'green', name: 'GREEN', color: '#10B981', positionY: 50 },
  { id: 'blue', name: 'BLUE', color: '#3B82F6', positionY: 75 },
];

export default function BrockStringGame() {
  const [targetBead, setTargetBead] = useState<Bead>(BEADS[1]); // start with green
  const [convergence, setConvergence] = useState(50); // 0 to 100 representing positionY
  const [score, setScore] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [gameStep, setGameStep] = useState<'instructions' | 'playing' | 'summary'>('instructions');

  // String endpoints
  const noseX = width / 2;
  const noseY = height * 0.65; // User's nose at bottom-middle
  const anchorX = width / 2;
  const anchorY = height * 0.1;  // Anchor point at top-middle

  // Eye points for perspective rendering
  const leftEyeX = width / 2 - 40;
  const rightEyeX = width / 2 + 40;
  const eyeY = height * 0.72;

  // Active bead Y position
  const activeY = anchorY + (convergence / 100) * (noseY - anchorY);

  useEffect(() => {
    if (gameStep !== 'playing') return;

    // Check convergence alignment
    const targetY = anchorY + (targetBead.positionY / 100) * (noseY - anchorY);
    const alignmentError = Math.abs(activeY - targetY);

    if (alignmentError < 15) { // Close enough to target bead
      setIsSuccess(true);
      const interval = setInterval(() => {
        setHoldTime(prev => {
          if (prev >= 3) {
            // Target hit!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScore(s => s + 10);
            selectNextTarget();
            return 0;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return prev + 0.5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setIsSuccess(false);
      setHoldTime(0);
    }
  }, [convergence, targetBead, gameStep]);

  const selectNextTarget = () => {
    const remaining = BEADS.filter(b => b.id !== targetBead.id);
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setTargetBead(next);
  };

  const endSession = () => {
    setGameStep('summary');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  // Brock String physiological diplopia projection calculations
  const renderBrockString = () => {
    // Left eye line splits and crosses at the convergence point
    // Before convergence point, lines are separate. At convergence, they cross.
    // We draw two perspective lines intersecting exactly at (noseX, activeY)
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Render the double string lines representing physiological diplopia */}
        {/* Left Eye String */}
        <Line
          x1={leftEyeX}
          y1={eyeY}
          x2={anchorX}
          y2={anchorY}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3"
        />
        {/* Right Eye String */}
        <Line
          x1={rightEyeX}
          y1={eyeY}
          x2={anchorX}
          y2={anchorY}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3"
        />

        {/* Intersection marker (where strings meet/cross in binocular fusion) */}
        <Line
          x1={leftEyeX}
          y1={eyeY}
          x2={rightEyeX}
          y2={eyeY}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {/* Render Beads. Outside convergence point, beads appear double! */}
        {BEADS.map((bead) => {
          const beadY = anchorY + (bead.positionY / 100) * (noseY - anchorY);
          
          // Calculate if this bead is focused
          const isFocused = bead.id === targetBead.id;
          const isAligned = Math.abs(activeY - beadY) < 15;

          // If focused and aligned, show as single fused bead
          if (isFocused && isAligned) {
            return (
              <Circle
                key={bead.id}
                cx={noseX}
                cy={beadY}
                r="16"
                fill={bead.color}
                stroke="#FFFFFF"
                strokeWidth="3"
              />
            );
          }

          // Otherwise, draw the double beads to simulate diplopia (left & right eye projections)
          // Project left-eye position
          const leftBeadX = leftEyeX + (bead.positionY / 100) * (anchorX - leftEyeX);
          // Project right-eye position
          const rightBeadX = rightEyeX + (bead.positionY / 100) * (anchorX - rightEyeX);

          // Render the double projected beads
          return (
            <React.Fragment key={bead.id}>
              <Circle
                cx={leftBeadX}
                cy={beadY}
                r="12"
                fill={bead.color}
                opacity={isFocused ? 0.9 : 0.5}
              />
              <Circle
                cx={rightBeadX}
                cy={beadY}
                r="12"
                fill={bead.color}
                opacity={isFocused ? 0.9 : 0.5}
              />
            </React.Fragment>
          );
        })}

        {/* User's nose coordinate marker */}
        <Circle cx={noseX} cy={noseY} r="8" fill="#FFF" />
      </Svg>
    );
  };

  if (gameStep === 'instructions') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0F172A' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <View style={styles.iconCircle}>
              <Activity size={40} color="#10B981" />
            </View>
            <Text style={styles.title}>Brock String Fusion</Text>
            <Text style={styles.desc}>
              An optometric visual therapy to train eye coordination and treat convergence insufficiency.
            </Text>

            <View style={styles.steps}>
              <Text style={styles.stepText}>• Focus on the target colored bead.</Text>
              <Text style={styles.stepText}>• Adjust the slider until the two lines cross EXACTLY inside that bead.</Text>
              <Text style={styles.stepText}>• Hold it steady for 3 seconds to fuse the target.</Text>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => setGameStep('playing')}
            >
              <Text style={styles.btnText}>Start Therapy</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  if (gameStep === 'summary') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0F172A' }]}>
        <View style={styles.center}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.card}
          >
            <Target size={56} color="#10B981" style={{ marginBottom: 16 }} />
            <Text style={styles.title}>Therapy Completed</Text>
            <Text style={styles.desc}>Fantastic binocular teaming and convergence control!</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ACQUIRED POINTS</Text>
                <Text style={styles.statValue}>{score} XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>COMPLIANCE</Text>
                <Text style={styles.statValue}>100%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace('/(tabs)/exercises')}
            >
              <Text style={styles.btnText}>Return to Gym</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#090D1A' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Game Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Brock String Game</Text>
          <TouchableOpacity onPress={endSession}>
            <Text style={styles.endBtnTextHeader}>End</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Brock String Visualizer */}
      <View style={styles.visualizerContainer}>
        {renderBrockString()}

        {/* Fusion Hold Guide HUD overlay */}
        <View style={styles.hudOverlay}>
          <View style={styles.targetCard}>
            <Text style={styles.targetBeadText}>
              Target: <Text style={{ color: targetBead.color, fontWeight: 'bold' }}>{targetBead.name}</Text> Bead
            </Text>
            <Text style={styles.instructionSub}>Align intersection point</Text>
          </View>

          {holdTime > 0 && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.holdCard}
            >
              <Text style={styles.holdText}>FUSING: {holdTime.toFixed(1)}s / 3.0s</Text>
            </MotiView>
          )}
        </View>
      </View>

      {/* Control Panel (Convergence Slider) */}
      <View style={styles.controlPanel}>
        <Text style={styles.sliderLabel}>CONVERGENCE CONTROL</Text>
        
        {/* Customizable visual slider representation */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderSideLabel}>Close</Text>
          <TouchableOpacity
            style={styles.sliderTrack}
            activeOpacity={1}
            onPress={(e) => {
              const rectX = e.nativeEvent.locationX;
              const trackWidth = width - 120;
              const val = Math.max(0, Math.min(100, (rectX / trackWidth) * 100));
              setConvergence(val);
            }}
          >
            <View style={[styles.sliderFill, { width: `${convergence}%` }]} />
            <MotiView
              animate={{ left: `${convergence}%` }}
              style={styles.sliderKnob}
            />
          </TouchableOpacity>
          <Text style={styles.sliderSideLabel}>Far</Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabelText}>XP Score: {score}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  steps: { alignSelf: 'stretch', gap: 12, marginBottom: 32, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 20 },
  stepText: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  btn: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(9, 13, 26, 0.8)',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  endBtnTextHeader: { color: '#EF4444', fontWeight: 'bold' },
  visualizerContainer: { flex: 1, justifyContent: 'center' },
  hudOverlay: { position: 'absolute', top: 120, left: 20, right: 20, alignItems: 'center', gap: 12 },
  targetCard: { backgroundColor: 'rgba(30, 41, 59, 0.9)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  targetBeadText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  instructionSub: { color: '#94A3B8', fontSize: 11, marginTop: 4 },
  holdCard: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  holdText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  controlPanel: { padding: 24, paddingBottom: 48, backgroundColor: '#090D1A', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  sliderLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 16, textAlign: 'center' },
  sliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sliderSideLabel: { color: '#64748B', fontSize: 12, width: 40, textAlign: 'center' },
  sliderTrack: { flex: 1, height: 16, backgroundColor: '#1E293B', borderRadius: 8, justifyContent: 'center' },
  sliderFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 8 },
  sliderKnob: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF', position: 'absolute', marginLeft: -14, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  scoreRow: { marginTop: 24, alignItems: 'center' },
  scoreLabelText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
