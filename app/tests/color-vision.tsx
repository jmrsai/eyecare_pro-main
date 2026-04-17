import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, ArrowLeft, RotateCcw, CheckCircle2, Shield, Info, Layers, Beaker, Shapes } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

type ColorTestType = 'ISHIHARA' | 'HRR' | 'D-15';

interface Plate {
  id: number;
  type: string;
  correctAnswer: string;
  options: string[];
  colors: string[];
}

const TEST_CONFIG = {
  ISHIHARA: {
    title: 'Ishihara Test',
    desc: 'Classic Red-Green deficiency test',
    plates: [
      { id: 1, type: 'number', correctAnswer: '12', options: ['12', '72', '17', 'Nothing'], colors: ['#D2691E', '#228B22', '#32CD32'] },
      { id: 2, type: 'number', correctAnswer: '8', options: ['8', '3', '6', 'Nothing'], colors: ['#FF7F50', '#2E8B57', '#90EE90'] },
      { id: 3, type: 'number', correctAnswer: '29', options: ['29', '70', '20', 'Nothing'], colors: ['#FF4500', '#006400', '#8FBC8F'] },
    ]
  },
  HRR: {
    title: 'HRR Standard',
    desc: 'Advanced shapes & Blue-Yellow test',
    plates: [
      { id: 1, type: 'shape', correctAnswer: 'Circle', options: ['Circle', 'Triangle', 'Square', 'Nothing'], colors: ['#FF69B4', '#1CB6D0', '#E2E8F0'] },
      { id: 2, type: 'shape', correctAnswer: 'Triangle', options: ['Triangle', 'Cross', 'Star', 'Nothing'], colors: ['#9370DB', '#FFD700', '#F1F5F9'] },
    ]
  },
  'D-15': {
    title: 'D-15 Panel',
    desc: 'Hue discrimination & saturation test',
    plates: [
      { id: 1, type: 'hue', correctAnswer: 'Blue-Green', options: ['Blue-Green', 'Yellow-Green', 'Purple', 'Orange'], colors: ['#008B8B', '#00FFFF', '#20B2AA'] },
    ]
  }
};

export default function ColorVisionTest() {
  const { user } = useAuth();
  const [testType, setTestType] = useState<ColorTestType | null>(null);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [testComplete, setTestComplete] = useState(false);

  const handleAnswer = (selected: string) => {
    const config = TEST_CONFIG[testType!];
    const plate = config.plates[currentPlate];
    
    if (selected === plate.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }

    if (currentPlate < config.plates.length - 1) {
      setCurrentPlate(prev => prev + 1);
    } else {
      finishTest(correctCount + (selected === plate.correctAnswer ? 1 : 0));
    }
  };

  const finishTest = async (finalCorrect: number) => {
    const config = TEST_CONFIG[testType!];
    const score = Math.round((finalCorrect / config.plates.length) * 100);
    
    const result = {
      testType: `Color Vision (${testType})`,
      date: new Date().toISOString(),
      score,
      status: score >= 80 ? 'normal' : score >= 60 ? 'attention' : 'concern'
    };

    if (user?.uid) await saveTestResult(user.uid, result);
    setTestComplete(true);
  };

  if (!testType) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Color Vision</Text>
          <Text style={styles.headerSubtitle}>Select diagnostic standard</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.selectionGrid}>
          {[
            { id: 'ISHIHARA', title: 'Ishihara', icon: Layers, desc: 'Red-Green screening' },
            { id: 'HRR', title: 'HRR Standard', icon: Shapes, desc: 'Shapes & Blue-Yellow' },
            { id: 'D-15', title: 'D-15 Panel', icon: Beaker, desc: 'Hue Discrimination' },
          ].map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => setTestType(item.id as ColorTestType)}
            >
              <View style={styles.iconBox}>
                <item.icon size={28} color="#10B981" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (testComplete) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.resultsCenter}>
                <CheckCircle2 size={80} color="#10B981" />
                <Text style={styles.resultsTitle}>Assessment Complete</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                    <Text style={styles.doneBtnText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
  }

  const plate = TEST_CONFIG[testType].plates[currentPlate];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.testHeader}>
          <Text style={styles.plateInfo}>Plate {currentPlate + 1} of {TEST_CONFIG[testType].plates.length}</Text>
          <Text style={styles.testMode}>{testType}</Text>
      </View>

      <View style={styles.plateArea}>
          <MotiView 
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={currentPlate}
            style={styles.ishiharaPlate}
          >
              {/* Complex color dot generator placeholder */}
              <View style={[styles.platePlaceholder, { backgroundColor: plate.colors[0] }]}>
                  <Text style={styles.plateTargetText}>?</Text>
              </View>
          </MotiView>
      </View>

      <View style={styles.mcqContainer}>
          <Text style={styles.mcqTitle}>Identify the {plate.type}:</Text>
          <View style={styles.mcqGrid}>
              {plate.options.map((opt, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.mcqBtn}
                    onPress={() => handleAnswer(opt)}
                  >
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
  selectionGrid: { padding: 20 },
  card: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 25, 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  cardDesc: { fontSize: 14, color: '#64748B' },
  testHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  plateInfo: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  testMode: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  plateArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ishiharaPlate: { width: 250, height: 250, borderRadius: 125, overflow: 'hidden', elevation: 10 },
  platePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plateTargetText: { fontSize: 80, fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' },
  mcqContainer: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  mcqTitle: { textAlign: 'center', marginBottom: 20, fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  mcqBtn: { width: '48%', height: 60, backgroundColor: '#F1F5F9', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  mcqBtnText: { fontSize: 18, fontWeight: 'bold', color: '#065F46' },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#10B981', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});