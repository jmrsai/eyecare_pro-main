import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, ArrowLeft, CheckCircle2, Scan, Circle as CircleIcon, Square, Triangle, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { DistanceMonitor } from '../../components/camera/DistanceMonitor';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { useEyeStore } from '../../store/useEyeStore';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const STIMULUS_COLORS = [
  { name: 'Red', color: '#EF4444' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Green', color: '#10B981' },
  { name: 'Yellow', color: '#F59E0B' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Orange', color: '#F97316' },
];

const STIMULUS_SHAPES = [
  { name: 'Circle', icon: CircleIcon },
  { name: 'Square', icon: Square },
  { name: 'Triangle', icon: Triangle },
];

export default function VisualFieldTest() {
  const { user } = useAuth();
  const { addResult, updateDailyProgress } = useEyeStore();

  const [step, setStep] = useState<'instructions' | 'test' | 'results'>('instructions');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stimuli, setStimuli] = useState<any[]>([]);
  const [activeStimulus, setActiveStimulus] = useState<any | null>(null);
  const [showMCQ, setShowMCQ] = useState(false);
  const [score, setScore] = useState(0);

  const device = useCameraDevice('front');
  const { hasPermission } = useCameraPermission();
  const { isDistanceCorrect, frameOutput } = useFaceDistance();

  const totalPoints = 15;

  const startTest = () => {
    const newStimuli = [];
    for (let i = 0; i < totalPoints; i++) {
      const color = STIMULUS_COLORS[Math.floor(Math.random() * STIMULUS_COLORS.length)];
      const shape = STIMULUS_SHAPES[Math.floor(Math.random() * STIMULUS_SHAPES.length)];

      const side = Math.random() > 0.5 ? 'left' : 'right';
      const vert = Math.random() > 0.5 ? 'top' : 'bottom';

      newStimuli.push({
        id: i,
        color,
        shape,
        pos: {
          x: side === 'left' ? Math.random() * 100 + 20 : width - Math.random() * 100 - 60,
          y: vert === 'top' ? Math.random() * 100 + 100 : height - Math.random() * 100 - 300,
        },
        duration: Math.max(200, 600 - (i * 20))
      });
    }
    setStimuli(newStimuli);
    setStep('test');
    runCycle(0, newStimuli);
  };

  const runCycle = (idx: number, stims: any[]) => {
    if (idx >= totalPoints) {
      finishTest();
      return;
    }

    setCurrentIndex(idx);
    setActiveStimulus(stims[idx]);
    setShowMCQ(false);

    setTimeout(() => {
      setActiveStimulus(null);
      setTimeout(() => {
        setShowMCQ(true);
      }, 400);
    }, stims[idx].duration);
  };

  const handleAnswer = (selectedColor: string) => {
    if (selectedColor === stimuli[currentIndex].color.name) {
      setScore(s => s + 1);
    }

    if (currentIndex < totalPoints - 1) {
      setTimeout(() => runCycle(currentIndex + 1, stimuli), 400);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    const finalScore = Math.round((score / totalPoints) * 100);
    setStep('results');

    await addResult({
      type: 'Visual Field',
      date: new Date().toISOString(),
      score: finalScore,
      status: finalScore >= 80 ? 'normal' : finalScore >= 60 ? 'attention' : 'concern',
      details: `Peripheral Awareness: ${finalScore}% accuracy`
    }, user?.uid);

    updateDailyProgress(25);
  };

  if (step === 'instructions') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Side Sight</Text>
          <Text style={styles.headerSubtitle}>Peripheral Field Training</Text>
        </LinearGradient>

        <View style={styles.instructionArea}>
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.infoCard}>
            <Target size={40} color="#8B5CF6" style={{ marginBottom: 15 }} />
            <Text style={styles.infoTitle}>How to Play</Text>
            <Text style={styles.infoDesc}>
              Keep your eyes fixed on the central white dot. A colored shape will flash in your side vision. Identify its color to score.
            </Text>
            <View style={styles.warningBox}>
              <Scan size={16} color="#F59E0B" />
              <Text style={styles.warningText}>Maintain 40cm distance for accuracy.</Text>
            </View>
          </MotiView>
          <TouchableOpacity style={styles.startBtn} onPress={startTest}>
            <Text style={styles.startBtnText}>Start Diagnostic Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'results') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsCenter}>
          <Trophy size={80} color="#10B981" />
          <Text style={styles.resultsTitle}>Assessment Saved</Text>
          <Text style={styles.resultsDesc}>Your peripheral sensitivity score: {Math.round((score / totalPoints) * 100)}%</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.testContainer}>
      <View style={styles.fixationLayer}>
        {device && hasPermission && (
          <View style={styles.camBox}>
            <VisionCamera style={StyleSheet.absoluteFill} device={device} isActive={true} outputs={[frameOutput]} />
            <DistanceMonitor />
          </View>
        )}
        <View style={styles.centerDot} />
      </View>

      <AnimatePresence>
        {activeStimulus && (
          <MotiView
            from={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={[styles.stimulus, { left: activeStimulus.pos.x, top: activeStimulus.pos.y, backgroundColor: activeStimulus.color.color }]}
          >
            <activeStimulus.shape.icon size={20} color="#FFF" fill="#FFF" />
          </MotiView>
        )}
      </AnimatePresence>

      {showMCQ && (
        <MotiView from={{ translateY: 200 }} animate={{ translateY: 0 }} style={styles.mcqOverlay}>
          <Text style={styles.mcqPrompt}>Identify the color you saw:</Text>
          <View style={styles.mcqGrid}>
            {STIMULUS_COLORS.map((c) => (
              <TouchableOpacity
                key={c.name}
                style={[styles.mcqBtn, { backgroundColor: c.color }]}
                onPress={() => handleAnswer(c.name)}
              >
                <Text style={styles.mcqBtnText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  instructionArea: { flex: 1, padding: 30, justifyContent: 'center' },
  infoCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, alignItems: 'center' },
  infoTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  infoDesc: { textAlign: 'center', fontSize: 14, color: '#64748B', lineHeight: 22 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 10 },
  warningText: { fontSize: 12, color: '#92400E' },
  startBtn: { marginTop: 40, backgroundColor: '#8B5CF6', padding: 20, borderRadius: 20, alignItems: 'center' },
  startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  testContainer: { flex: 1, backgroundColor: '#000' },
  fixationLayer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  centerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', elevation: 10 },
  camBox: { position: 'absolute', top: 60, width: 100, height: 130, borderRadius: 20, overflow: 'hidden' },
  stimulus: { position: 'absolute', width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  mcqOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  mcqPrompt: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 25 },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mcqBtn: { width: '48%', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  mcqBtnText: { color: '#FFF', fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  resultsDesc: { textAlign: 'center', color: '#64748B', marginTop: 10 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#8B5CF6', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});
