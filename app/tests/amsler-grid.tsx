import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, PanResponder, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Grid3X3, ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, Shield, Eye, Scan } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../hooks/useTheme';
import { useEyeStore } from '../../store/useEyeStore';
import { useAuth } from '../../context/AuthContext';


const { width } = Dimensions.get('window');
const GRID_SIZE = width - 40;
const GRID_LINES = 20;

export default function AmslerGridTest() {
  const theme = useTheme();
  const { user } = useAuth();
  const { addResult } = useEyeStore();
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [testComplete, setTestComplete] = useState(false);
  const [marks, setMarks] = useState<{ x: number, y: number }[]>([]);

  const handlePress = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    setMarks([...marks, { x: locationX, y: locationY }]);
  };

  const renderGrid = () => {
    const lines = [];
    const spacing = GRID_SIZE / GRID_LINES;
    for (let i = 0; i <= GRID_LINES; i++) {
      lines.push(
        <Line key={`v-${i}`} x1={i * spacing} y1={0} x2={i * spacing} y2={GRID_SIZE} stroke="#E2E8F0" strokeWidth="1" />,
        <Line key={`h-${i}`} x1={0} y1={i * spacing} x2={GRID_SIZE} y2={i * spacing} stroke="#E2E8F0" strokeWidth="1" />
      );
    }
    return lines;
  };

  const nextStep = () => {
    if (currentEye === 'right') {
      setCurrentEye('left');
      setMarks([]);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    const totalMarks = marks.length; // Placeholder logic for distortion detection
    await addResult({
      type: 'Amsler Grid',
      date: new Date().toISOString(),
      score: Math.max(0, 100 - (totalMarks * 10)),
      status: totalMarks === 0 ? 'normal' : totalMarks < 5 ? 'attention' : 'concern',
      details: `${totalMarks} distortion areas marked.`
    }, user?.uid);
    setTestComplete(true);
  };

  if (testComplete) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsCenter}>
          <Shield size={80} color="#10B981" />
          <Text style={styles.resultsTitle}>Macular Integrity Saved</Text>
          <Text style={styles.resultsDesc}>Your macular health screening has been recorded for longitudinal tracking.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amsler Grid</Text>
        <Text style={styles.headerSubtitle}>Testing {currentEye.toUpperCase()} Eye</Text>
      </LinearGradient>

      <View style={styles.testArea}>
        <View style={styles.instructionBox}>
          <Scan size={20} color="#1CB6D0" />
          <Text style={styles.instructionText}>
            Stare at the center dot. Tap any areas where the lines look wavy, blurred, or missing.
          </Text>
        </View>

        <View style={styles.gridWrapper} onTouchStart={handlePress}>
          <Svg width={GRID_SIZE} height={GRID_SIZE}>
            {renderGrid()}
            <Circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="5" fill="#1CB6D0" />
            {marks.map((m, i) => (
              <Circle key={i} cx={m.x} cy={m.y} r="8" fill="#EF4444" opacity={0.6} />
            ))}
          </Svg>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setMarks([])}>
            <RotateCcw size={18} color="#64748B" />
            <Text style={styles.clearText}>Reset Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
            <Text style={styles.primaryBtnText}>
              {currentEye === 'right' ? 'Next Eye' : 'Finish Test'}
            </Text>
          </TouchableOpacity>
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
  instructionBox: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 30, alignItems: 'center', gap: 12 },
  instructionText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 18 },
  gridWrapper: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  actions: { width: '100%', marginTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearText: { color: '#64748B', fontWeight: 'bold' },
  primaryBtn: { paddingVertical: 15, paddingHorizontal: 30, backgroundColor: '#1CB6D0', borderRadius: 20 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold' },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  resultsDesc: { textAlign: 'center', color: '#64748B', marginTop: 10, lineHeight: 22 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#1CB6D0', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});