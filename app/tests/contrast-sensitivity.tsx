import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Layers, ArrowLeft, RotateCcw, CheckCircle2, Shield, Eye, Scan, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

const CONTRAST_LEVELS = [
  { opacity: 1.0, score: 100 },
  { opacity: 0.5, score: 90 },
  { opacity: 0.25, score: 80 },
  { opacity: 0.1, score: 70 },
  { opacity: 0.05, score: 60 },
  { opacity: 0.02, score: 50 },
  { opacity: 0.01, score: 40 },
];

export default function ContrastSensitivityTest() {
  const [level, setLevel] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('E');
  const [options, setOptions] = useState<string[]>([]);
  const [testComplete, setTestComplete] = useState(false);

  useEffect(() => {
    generateQuestion();
  }, [level]);

  const generateQuestion = () => {
    const letters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D', 'C'];
    const target = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(target);

    let newOpts = [target];
    while (newOpts.length < 4) {
      const r = letters[Math.floor(Math.random() * letters.length)];
      if (!newOpts.includes(r)) newOpts.push(r);
    }
    setOptions(newOpts.sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (ans: string) => {
    if (ans === currentLetter) {
      if (level < CONTRAST_LEVELS.length - 1) {
        setLevel(level + 1);
      } else {
        setTestComplete(true);
      }
    } else {
      setTestComplete(true);
    }
  };

  if (testComplete) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.resultsCenter}>
                  <Sun size={80} color="#8B5CF6" />
                  <Text style={styles.resultsTitle}>Contrast Gradient Saved</Text>
                  <Text style={styles.resultsDesc}>Your ability to distinguish low-contrast patterns has been recorded.</Text>
                  <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                      <Text style={styles.doneBtnText}>Return to Dashboard</Text>
                  </TouchableOpacity>
              </View>
          </SafeAreaView>
      )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contrast Sensitivity</Text>
        <Text style={styles.headerSubtitle}>Threshold Level: {level + 1}</Text>
      </LinearGradient>

      <View style={styles.testArea}>
          <View style={styles.instructionBox}>
              <Scan size={20} color="#8B5CF6" />
              <Text style={styles.instructionText}>
                  Select the letter you see. The letters will become increasingly faint.
              </Text>
          </View>

          <MotiView 
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={level}
            style={styles.targetWrapper}
          >
              <Text style={[styles.targetText, { opacity: CONTRAST_LEVELS[level].opacity }]}>
                  {currentLetter}
              </Text>
          </MotiView>

          <View style={styles.mcqGrid}>
              {options.map((opt, i) => (
                  <TouchableOpacity key={i} style={styles.mcqBtn} onPress={() => handleAnswer(opt)}>
                      <Text style={styles.mcqBtnText}>{opt}</Text>
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
  testArea: { flex: 1, padding: 20, alignItems: 'center' },
  instructionBox: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 50, alignItems: 'center', gap: 12 },
  instructionText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 18 },
  targetWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  targetText: { fontSize: 80, fontWeight: 'bold', color: '#0F172A' },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  mcqBtn: { width: '48%', height: 60, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  mcqBtnText: { fontSize: 24, fontWeight: 'bold', color: '#8B5CF6' },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  resultsDesc: { textAlign: 'center', color: '#64748B', marginTop: 10 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#8B5CF6', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});