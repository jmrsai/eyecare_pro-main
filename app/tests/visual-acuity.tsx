import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, RotateCcw, CheckCircle2, Type, Hash, Grip, Smartphone, Apple, Home, Hand, Flower2 } from 'lucide-react-native';
import { router } from 'expo-router';

import { useAuth } from '../../context/AuthContext';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { DistanceMonitor } from '../../components/camera/DistanceMonitor';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { useEyeStore } from '../../store/useEyeStore';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

type ChartType = 'LETTERS' | 'NUMBERS' | 'TUMBLING_E' | 'PICTURES';

const CHART_DATA = {
  LETTERS: ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C'],
  NUMBERS: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  TUMBLING_E: ['E', 'Ǝ', 'M', 'W'],
  PICTURES: [
    { name: 'apple', icon: Apple },
    { name: 'house', icon: Home },
    { name: 'hand', icon: Hand },
    { name: 'flower', icon: Flower2 },
  ]
};

const SNELLEN_LINES = [
  { size: 120, line: '20/200' },
  { size: 80, line: '20/100' },
  { size: 60, line: '20/70' },
  { size: 45, line: '20/50' },
  { size: 35, line: '20/40' },
  { size: 25, line: '20/30' },
  { size: 20, line: '20/25' },
  { size: 15, line: '20/20' },
];

export default function VisualAcuityTest() {
  const { user } = useAuth();
  const { addResult, updateDailyProgress } = useEyeStore();

  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [testingEye, setTestingEye] = useState<'left' | 'right'>('right');
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [options, setOptions] = useState<any[]>([]);
  const [currentTarget, setCurrentTarget] = useState<any>(null);

  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { isDistanceCorrect, frameOutput } = useFaceDistance();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (chartType && !testComplete) {
      generateNextQuestion();
    }
  }, [chartType, currentLine, testingEye, testComplete]);

  const generateNextQuestion = () => {
    const data = CHART_DATA[chartType!];
    const target = data[Math.floor(Math.random() * data.length)];
    setCurrentTarget(target);

    let newOptions = [target];
    while (newOptions.length < 4) {
      const random = data[Math.floor(Math.random() * data.length)];
      const randomKey = typeof random === 'string' ? random : random.name;
      const targetKey = typeof target === 'string' ? target : target.name;

      if (!newOptions.some(opt => (typeof opt === 'string' ? opt : opt.name) === randomKey)) {
        newOptions.push(random);
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (selected: any) => {
    const selectedKey = typeof selected === 'string' ? selected : selected.name;
    const targetKey = typeof currentTarget === 'string' ? currentTarget : currentTarget.name;

    if (selectedKey === targetKey) {
      if (currentLine < SNELLEN_LINES.length - 1) {
        setCurrentLine(currentLine + 1);
      } else {
        finishEyeTest(100);
      }
    } else {
      const score = Math.round((currentLine / SNELLEN_LINES.length) * 100);
      finishEyeTest(score);
    }
  };

  const finishEyeTest = (score: number) => {
    const updatedResults = { ...results, [testingEye]: score };
    setResults(updatedResults);

    if (testingEye === 'right') {
      Alert.alert(
        'Right Eye Complete',
        'Switching to Left Eye. Please cover your right eye.',
        [{
          text: 'Start Left Eye', onPress: () => {
            setTestingEye('left');
            setCurrentLine(0);
          }
        }]
      );
    } else {
      saveFinalResults(updatedResults);
      setTestComplete(true);
    }
  };

  const saveFinalResults = async (finalResults: any) => {
    const avgScore = Math.round((finalResults.right + finalResults.left) / 2);

    await addResult({
      type: 'Visual Acuity',
      date: new Date().toISOString(),
      score: avgScore,
      status: avgScore >= 80 ? 'normal' : avgScore >= 60 ? 'attention' : 'concern',
      details: `Right: ${finalResults.right}%, Left: ${finalResults.left}%`
    }, user?.uid);

    updateDailyProgress(20);
  };

  if (!chartType) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0A2E6B', '#1CB6D0']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visual Acuity</Text>
          <Text style={styles.headerSubtitle}>Select your test chart</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.selectionGrid}>
          {[
            { id: 'LETTERS', title: 'Letters', icon: Type, desc: 'Literate Adults' },
            { id: 'NUMBERS', title: 'Numbers', icon: Hash, desc: 'Literate Adults' },
            { id: 'TUMBLING_E', title: 'Tumbling E', icon: Grip, desc: 'Illiterate & Children' },
            { id: 'PICTURES', title: 'Pictures', icon: Smartphone, desc: 'Young Children' },
          ].map((chart) => (
            <TouchableOpacity
              key={chart.id}
              style={styles.chartCard}
              onPress={() => setChartType(chart.id as ChartType)}
            >
              <View style={styles.chartIconBox}>
                <chart.icon size={32} color="#1CB6D0" />
              </View>
              <Text style={styles.chartTitle}>{chart.title}</Text>
              <Text style={styles.chartDesc}>{chart.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (testComplete) {
    const avgAcc = results.left !== undefined ? Math.round((results.right + results.left) / 2) : results.right;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsCenter}>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle2 size={80} color="#10B981" />
          </MotiView>
          <Text style={styles.resultsTitle}>Test Complete</Text>
          <Text style={styles.resultsText}>Average Accuracy: {avgAcc}%</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.testHeader}>
        <Text style={styles.eyeIndicator}>Testing {testingEye.toUpperCase()} Eye</Text>
        <Text style={styles.lineInfo}>Line: {SNELLEN_LINES[currentLine].line}</Text>
      </View>

      <View style={styles.cameraPreview}>
        {device && hasPermission && (
          {/* @ts-ignore - VisionCamera type conflict */}
          <VisionCamera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            outputs={[frameOutput]}
          />
        )}
        <DistanceMonitor />
      </View>

      <View style={[styles.targetContainer, { opacity: isDistanceCorrect ? 1 : 0.2 }]}>
        {chartType === 'PICTURES' ? (
          <currentTarget.icon size={SNELLEN_LINES[currentLine].size} color="#0F172A" />
        ) : (
          <Text style={[styles.targetText, { fontSize: SNELLEN_LINES[currentLine].size }]}>
            {currentTarget}
          </Text>
        )}
      </View>

      <View style={styles.mcqContainer}>
        <Text style={styles.mcqTitle}>Select what you see:</Text>
        <View style={styles.mcqGrid}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.mcqBtn}
              onPress={() => handleAnswer(opt)}
              disabled={!isDistanceCorrect}
            >
              {chartType === 'PICTURES' ? (
                <opt.icon size={24} color="#0A2E6B" />
              ) : (
                <Text style={styles.mcqBtnText}>{opt}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  selectionGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  chartCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5
  },
  chartIconBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  chartDesc: { fontSize: 12, color: '#64748B', marginTop: 4 },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  eyeIndicator: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  lineInfo: { fontSize: 14, fontWeight: 'bold', color: '#1CB6D0' },
  cameraPreview: { height: 120, margin: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  targetContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  targetText: { fontWeight: 'bold', color: '#0F172A' },
  mcqContainer: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  mcqTitle: { textAlign: 'center', marginBottom: 20, fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mcqBtn: { width: '48%', height: 60, backgroundColor: '#F1F5F9', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  mcqBtnText: { fontSize: 24, fontWeight: 'bold', color: '#0A2E6B' },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  resultsText: { fontSize: 16, color: '#64748B', marginTop: 10 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#1CB6D0', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
