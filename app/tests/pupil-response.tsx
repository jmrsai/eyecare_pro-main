import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, CheckCircle2, Scan } from 'lucide-react-native';
import { router } from 'expo-router';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { usePupilAnalysis } from '../../hooks/usePupilAnalysis';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { DistanceMonitor } from '../../components/camera/DistanceMonitor';
import { useEyeStore } from '../../store/useEyeStore';
import { useAuth } from '../../context/AuthContext';
import { MotiView, AnimatePresence } from 'moti';

export default function PupilResponseTest() {
  const { user } = useAuth();
  const { addResult, updateDailyProgress } = useEyeStore();
  
  const [step, setStep] = useState<'instructions' | 'test' | 'results'>('instructions');
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [phase, setPhase] = useState<'baseline' | 'flash' | 'recovery'>('baseline');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [baselineSize, setBaselineSize] = useState<number | null>(null);
  const [minSize, setMinSize] = useState<number | null>(null);

  const device = useCameraDevice('front');
  const { pupilSize, frameProcessor } = usePupilAnalysis();
  const { isDistanceCorrect } = useFaceDistance();

  useEffect(() => {
      if (step === 'test' && pupilSize) {
          if (phase === 'baseline') {
              setBaselineSize(pupilSize);
          } else if (phase === 'flash') {
              if (minSize === null || pupilSize < minSize) {
                  setMinSize(pupilSize);
              }
          }
      }
  }, [pupilSize, step, phase, minSize]);

  const runTest = async () => {
    setStep('test');
    setPhase('baseline');
    
    // 2 seconds for baseline
    setTimeout(() => {
        setPhase('flash');
        // 1 second flash phase
        setTimeout(() => {
            setPhase('recovery');
            setTimeout(() => {
                captureResult();
            }, 1000);
        }, 1000);
    }, 2000);
  };

  const captureResult = () => {
    const constriction = baselineSize && minSize ? ((baselineSize - minSize) / baselineSize) * 100 : 0;
    const result = {
        eye: currentEye,
        baseline: baselineSize,
        constricted: minSize,
        percent: Math.round(constriction)
    };
    
    const newMeasurements = [...measurements, result];
    setMeasurements(newMeasurements);

    if (currentEye === 'right') {
        setCurrentEye('left');
        setPhase('baseline');
        setBaselineSize(null);
        setMinSize(null);
        // Prompt for left eye
        Alert.alert("Right Eye Complete", "Now prepare to test your Left Eye.");
    } else {
        finishDiagnostic(newMeasurements);
    }
  };

  const finishDiagnostic = async (allMeasurements: any[]) => {
    const avgPercent = allMeasurements.reduce((sum, m) => sum + m.percent, 0) / 2;
    setStep('results');
    
    await addResult({
      type: 'Pupil Response',
      date: new Date().toISOString(),
      score: Math.round(avgPercent * 2), // Scale to 100
      status: avgPercent >= 20 ? 'normal' : avgPercent >= 10 ? 'attention' : 'concern',
      details: `Avg Constriction: ${avgPercent.toFixed(1)}%`
    }, user?.uid);
    
    updateDailyProgress(20);
  };

  if (step === 'instructions') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0A2E6B', '#1E3A8A']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pupil Response</Text>
          <Text style={styles.headerSubtitle}>Autonomic Function Diagnostic</Text>
        </LinearGradient>

        <View style={styles.content}>
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.infoCard}>
                <Eye size={40} color="#0A2E6B" style={{ marginBottom: 15 }} />
                <Text style={styles.infoTitle}>Neurological Screening</Text>
                <Text style={styles.infoDesc}>
                    This test uses AI to measure how your pupils react to light. This is a key indicator of neurological and ocular health.
                </Text>
                <View style={styles.stepBox}>
                    <Text style={styles.stepText}>1. Keep the phone 30cm away.</Text>
                    <Text style={styles.stepText}>2. A flash will trigger on the screen.</Text>
                    <Text style={styles.stepText}>3. Do not blink during the flash phase.</Text>
                </View>
            </MotiView>
            
            <TouchableOpacity style={styles.startBtn} onPress={runTest}>
                <Text style={styles.startBtnText}>Start Diagnostic</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.testContainer}>
        <View style={styles.cameraLayer}>
            {device && (
                <Camera 
                    style={StyleSheet.absoluteFill} 
                    device={device} 
                    isActive={true} 
                    frameProcessor={frameProcessor}
                />
            )}
            <DistanceMonitor />
            
            {/* Flash Overlay */}
            <AnimatePresence>
                {phase === 'flash' && (
                    <MotiView 
                        from={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        style={styles.flashOverlay} 
                    />
                )}
            </AnimatePresence>

            <View style={styles.eyeGuide}>
                <Scan size={60} color={isDistanceCorrect ? "#10B981" : "#EF4444"} />
                <Text style={styles.guideText}>Center your {currentEye} eye</Text>
            </View>
        </View>

        <View style={styles.statusPanel}>
            <Text style={styles.phaseText}>{phase.toUpperCase()} PHASE</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Baseline</Text>
                    <Text style={styles.statValue}>{baselineSize?.toFixed(1) || '--'}mm</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Current</Text>
                    <Text style={styles.statValue}>{pupilSize?.toFixed(1) || '--'}mm</Text>
                </View>
            </View>
        </View>

        {step === 'results' && (
            <View style={styles.resultsOverlay}>
                <CheckCircle2 size={60} color="#10B981" />
                <Text style={styles.resultsTitle}>Diagnostic Complete</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                    <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  infoCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  infoTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  infoDesc: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 20 },
  stepBox: { gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  stepText: { fontSize: 13, color: '#475569' },
  startBtn: { marginTop: 40, backgroundColor: '#0A2E6B', padding: 20, borderRadius: 20, alignItems: 'center' },
  startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  testContainer: { flex: 1, backgroundColor: '#000' },
  cameraLayer: { flex: 3, justifyContent: 'center', alignItems: 'center' },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF' },
  eyeGuide: { position: 'absolute', alignItems: 'center' },
  guideText: { color: '#FFF', fontWeight: 'bold', marginTop: 10, textShadowColor: '#000', textShadowRadius: 4 },
  statusPanel: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30 },
  phaseText: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#1CB6D0', letterSpacing: 2, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  resultsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#0F172A' },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#0A2E6B', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});
