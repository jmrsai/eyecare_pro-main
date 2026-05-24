import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, CheckCircle2, Scan, Activity, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { usePupilAnalysis } from '../../hooks/usePupilAnalysis';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { DistanceMonitor } from '../../components/camera/DistanceMonitor';
import { useEyeStore } from '../../store/useEyeStore';
import { useAuth } from '../../context/AuthContext';
import { MotiView, AnimatePresence } from 'moti';

/**
 * EYECARE PRO - PUPIL RESPONSE DIAGNOSTIC
 * ---------------------------------------
 * Real-time AI pupillometry using MediaPipe Iris Segmentation.
 * Compatible with Vision Camera v5 Nitro Architecture.
 */

export default function PupilResponseTest() {
  const { user } = useAuth();
  const { addResult } = useEyeStore();
  
  const [step, setStep] = useState<'instructions' | 'test' | 'results'>('instructions');
  const [phase, setPhase] = useState<'baseline' | 'flash' | 'recovery'>('baseline');
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [measurements, setMeasurements] = useState<any[]>([]);
  
  const [baselineSize, setBaselineSize] = useState<number | null>(null);
  const [minSize, setMinSize] = useState<number | null>(null);

  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  
  const { pupilSize, frameOutput: pupilFrameOutput } = usePupilAnalysis(phase);
  const { isDistanceCorrect, frameOutput: distanceFrameOutput } = useFaceDistance();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
      if (step === 'test' && pupilSize) {
          if (phase === 'baseline' && !baselineSize) {
              setBaselineSize(pupilSize);
          } else if (phase === 'flash') {
              if (!minSize || pupilSize < minSize) {
                  setMinSize(pupilSize);
              }
          }
      }
  }, [pupilSize, step, phase, minSize, baselineSize]);

  const runTest = async () => {
    if (!hasPermission) {
        Alert.alert("Permission Required", "Camera access is needed for AI diagnostics.");
        return;
    }
    setStep('test');
    setPhase('baseline');
    
    // Baseline Phase (2s)
    await new Promise(r => setTimeout(r, 2000));
    setPhase('flash');
    
    // Flash Phase (1.5s)
    await new Promise(r => setTimeout(r, 1500));
    setPhase('recovery');
    
    // Recovery Phase (2s)
    await new Promise(r => setTimeout(r, 2000));
    
    const constrictionPercent = baselineSize && minSize ? 
        ((baselineSize - minSize) / baselineSize) * 100 : 0;
    
    const newMeasurements = [...measurements, { eye: currentEye, constriction: constrictionPercent }];
    setMeasurements(newMeasurements);
    
    if (currentEye === 'right') {
        setCurrentEye('left');
        setPhase('baseline');
        setBaselineSize(null);
        setMinSize(null);
        Alert.alert("Right Eye Complete", "Now center your Left Eye for assessment.");
    } else {
        finishDiagnostic(newMeasurements);
    }
  };

  const finishDiagnostic = async (finalData: any[]) => {
    const avgPercent = finalData.reduce((acc, curr) => acc + curr.constriction, 0) / 2;
    
    await addResult({
      type: 'Pupil Response',
      date: new Date().toISOString(),
      score: Math.round(avgPercent * 2), // Normalized score
      status: avgPercent >= 20 ? 'normal' : avgPercent >= 10 ? 'attention' : 'concern',
      details: `Avg Constriction: ${avgPercent.toFixed(1)}%`
    }, user?.uid);

    setStep('results');
  };

  if (step === 'instructions') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pupil Response</Text>
        </View>

        <View style={styles.content}>
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.infoCard}>
                <Activity size={40} color="#1CB6D0" style={{ marginBottom: 15 }} />
                <Text style={styles.infoTitle}>Neurological Assessment</Text>
                <Text style={styles.infoDesc}>
                    This medical-grade assessment uses AI to monitor how your pupils react to controlled light stimuli. 
                </Text>
                <View style={styles.stepBox}>
                    <Text style={styles.stepText}>• Center your eye in the circular guide</Text>
                    <Text style={styles.stepText}>• Maintain 40cm distance (indicated in green)</Text>
                    <Text style={styles.stepText}>• Avoid blinking during the flash phase</Text>
                </View>
            </MotiView>
            
            <TouchableOpacity style={styles.startBtn} onPress={runTest}>
                <Zap size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.startBtnText}>Start Assessment</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.testContainer}>
        <View style={styles.cameraLayer}>
            {device && (
                <VisionCamera 
                    style={StyleSheet.absoluteFill} 
                    device={device} 
                    isActive={true} 
                    outputs={[pupilFrameOutput, distanceFrameOutput]} // REQUIRED FOR V5
                />
            )}
            <DistanceMonitor />
            
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
                <Text style={styles.guideText}>Center {currentEye.toUpperCase()} Eye</Text>
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
                <CheckCircle2 size={80} color="#10B981" />
                <Text style={styles.resultsTitle}>Assessment Complete</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                    <Text style={styles.doneBtnText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFF' },
  backBtn: { padding: 10, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  content: { padding: 20, flex: 1 },
  infoCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  infoTitle: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  infoDesc: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 20 },
  stepBox: { gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 },
  stepText: { fontSize: 13, color: '#475569' },
  startBtn: { marginTop: 40, backgroundColor: '#0A2E6B', padding: 20, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  testContainer: { flex: 1, backgroundColor: '#000' },
  cameraLayer: { flex: 3, justifyContent: 'center', alignItems: 'center' },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FFF', zIndex: 10 },
  eyeGuide: { position: 'absolute', alignItems: 'center' },
  guideText: { color: '#FFF', marginTop: 15, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  statusPanel: { flex: 1, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  phaseText: { fontSize: 12, fontWeight: 'bold', color: '#64748B', letterSpacing: 2, marginBottom: 15, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  resultsOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#0F172A' },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#0A2E6B', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
