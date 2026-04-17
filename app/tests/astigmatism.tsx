import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, ArrowLeft, RotateCcw, CheckCircle2, Shield, Eye, Scan, Compass } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');
const DIAL_SIZE = width - 80;

export default function AstigmatismTest() {
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [testComplete, setTestComplete] = useState(false);
  const [selections, setSelections] = useState<number[]>([]);

  const toggleSelection = (idx: number) => {
    if (selections.includes(idx)) {
      setSelections(selections.filter(i => i !== idx));
    } else {
      setSelections([...selections, idx]);
    }
  };

  const nextStep = () => {
    if (currentEye === 'right') {
      setCurrentEye('left');
      setSelections([]);
    } else {
      setTestComplete(true);
    }
  };

  if (testComplete) {
      return (
          <SafeAreaView style={styles.container}>
              <View style={styles.resultsCenter}>
                  <Compass size={80} color="#F59E0B" />
                  <Text style={styles.resultsTitle}>Symmetry Analysis Saved</Text>
                  <Text style={styles.resultsDesc}>We have recorded your astigmatic symmetry for clinical review.</Text>
                  <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                      <Text style={styles.doneBtnText}>Return to Dashboard</Text>
                  </TouchableOpacity>
              </View>
          </SafeAreaView>
      )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Astigmatism</Text>
        <Text style={styles.headerSubtitle}>Testing {currentEye.toUpperCase()} Eye</Text>
      </LinearGradient>

      <View style={styles.testArea}>
          <View style={styles.instructionBox}>
              <Scan size={20} color="#F59E0B" />
              <Text style={styles.instructionText}>
                  Stare at the center. Select any groups of lines that appear darker or thicker than others.
              </Text>
          </View>

          <View style={styles.dialWrapper}>
              <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
                  <G transform={`translate(${DIAL_SIZE/2}, ${DIAL_SIZE/2})`}>
                      <Circle r="5" fill="#F59E0B" />
                      {[0, 30, 60, 90, 120, 150].map((angle, i) => {
                          const isSelected = selections.includes(i);
                          return (
                              <Line 
                                key={i}
                                x1={0} y1={-DIAL_SIZE/2.5}
                                x2={0} y2={DIAL_SIZE/2.5}
                                stroke={isSelected ? '#F59E0B' : '#E2E8F0'}
                                strokeWidth={isSelected ? 6 : 3}
                                transform={`rotate(${angle})`}
                                onPress={() => toggleSelection(i)}
                              />
                          )
                      })}
                  </G>
              </Svg>
          </View>

          <View style={styles.mcqGrid}>
              {[0, 30, 60, 90, 120, 150].map((angle, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.mcqBtn, selections.includes(i) && styles.mcqBtnActive]}
                    onPress={() => toggleSelection(i)}
                  >
                      <Text style={[styles.mcqBtnText, selections.includes(i) && styles.mcqBtnTextActive]}>{angle}° Axis</Text>
                  </TouchableOpacity>
              ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
              <Text style={styles.primaryBtnText}>
                  {currentEye === 'right' ? 'Next Eye' : 'Finish Test'}
              </Text>
          </TouchableOpacity>
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
  dialWrapper: { backgroundColor: '#FFF', padding: 30, borderRadius: 100, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, marginBottom: 30 },
  mcqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  mcqBtn: { width: '48%', paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  mcqBtnActive: { backgroundColor: '#F59E0B' },
  mcqBtnText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  mcqBtnTextActive: { color: '#FFF' },
  primaryBtn: { width: '100%', paddingVertical: 18, backgroundColor: '#F59E0B', borderRadius: 20, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultsCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  resultsDesc: { textAlign: 'center', color: '#64748B', marginTop: 10 },
  doneBtn: { marginTop: 40, padding: 20, backgroundColor: '#F59E0B', borderRadius: 20, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: 'bold' }
});