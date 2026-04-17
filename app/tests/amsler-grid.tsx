import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Grid3X3, ArrowLeft, RotateCcw, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRID_SIZE = Math.min(width - 40, 300);
const GRID_LINES = 20;

interface DistortionMark {
  x: number;
  y: number;
  id: string;
}

export default function AmslerGridTest() {
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [distortionMarks, setDistortionMarks] = useState<{ [key: string]: DistortionMark[] }>({});
  const [testComplete, setTestComplete] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      addDistortionMark(locationX, locationY);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      addDistortionMark(locationX, locationY);
    },
  });

  const addDistortionMark = (x: number, y: number) => {
    const eyeKey = currentEye;
    const newMark: DistortionMark = {
      x,
      y,
      id: Date.now().toString() + Math.random(),
    };

    setDistortionMarks(prev => ({
      ...prev,
      [eyeKey]: [...(prev[eyeKey] || []), newMark]
    }));
  };

  const clearMarks = () => {
    setDistortionMarks(prev => ({
      ...prev,
      [currentEye]: []
    }));
  };

  const completeCurrentEye = async () => {
    if (currentEye === 'right') {
      setCurrentEye('left');
    } else {
      await saveResults();
      setTestComplete(true);
    }
  };

  const saveResults = async () => {
    try {
      const rightMarks = distortionMarks.right || [];
      const leftMarks = distortionMarks.left || [];
      const totalDistortions = rightMarks.length + leftMarks.length;
      
      let severity = 'normal';
      let score = 100;
      
      if (totalDistortions > 10) {
        severity = 'concern';
        score = 30;
      } else if (totalDistortions > 5) {
        severity = 'attention';
        score = 60;
      } else if (totalDistortions > 0) {
        severity = 'attention';
        score = 80;
      }

      const result = {
        id: Date.now().toString(),
        testType: 'Amsler Grid',
        date: new Date().toISOString().split('T')[0],
        score,
        status: severity,
        details: `Right eye: ${rightMarks.length} distortions, Left eye: ${leftMarks.length} distortions`,
      };

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift(result);
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const resetTest = () => {
    setCurrentEye('right');
    setDistortionMarks({});
    setTestComplete(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10B981';
      case 'attention': return '#F59E0B';
      case 'concern': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal Grid Vision';
      case 'attention': return 'Minor Distortions';
      case 'concern': return 'Significant Distortions';
      default: return 'Unknown';
    }
  };

  const renderGrid = () => {
    const lines = [];
    const spacing = GRID_SIZE / GRID_LINES;

    // Vertical lines
    for (let i = 0; i <= GRID_LINES; i++) {
      const x = i * spacing;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={GRID_SIZE}
          stroke="#374151"
          strokeWidth="1"
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= GRID_LINES; i++) {
      const y = i * spacing;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={GRID_SIZE}
          y2={y}
          stroke="#374151"
          strokeWidth="1"
        />
      );
    }

    return lines;
  };

  if (testComplete) {
    const rightMarks = distortionMarks.right || [];
    const leftMarks = distortionMarks.left || [];
    const totalDistortions = rightMarks.length + leftMarks.length;
    
    let severity = 'normal';
    let score = 100;
    
    if (totalDistortions > 10) {
      severity = 'concern';
      score = 30;
    } else if (totalDistortions > 5) {
      severity = 'attention';
      score = 60;
    } else if (totalDistortions > 0) {
      severity = 'attention';
      score = 80;
    }
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Grid3X3 size={48} color="#EF4444" />
            <Text style={styles.scoreTitle}>Amsler Grid Results</Text>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(severity) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(severity) }]}>
                {getStatusText(severity)}
              </Text>
            </View>

            <View style={styles.eyeResults}>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Right Eye</Text>
                <Text style={styles.eyeScore}>{rightMarks.length} marks</Text>
              </View>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Left Eye</Text>
                <Text style={styles.eyeScore}>{leftMarks.length} marks</Text>
              </View>
            </View>
          </View>

          {severity !== 'normal' && (
            <View style={styles.warningCard}>
              <AlertTriangle size={20} color="#EF4444" />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Important Notice</Text>
                <Text style={styles.warningText}>
                  Grid distortions may indicate macular problems. Please consult an eye care professional promptly for comprehensive evaluation.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Clinical Significance</Text>
            <Text style={styles.interpretationText}>
              {severity === 'normal' 
                ? 'No significant grid distortions detected. Continue regular monitoring.'
                : severity === 'attention'
                ? 'Minor grid distortions detected. Recommend professional evaluation within 2-4 weeks.'
                : 'Significant grid distortions detected. Urgent ophthalmologic evaluation recommended within 1-2 weeks for macular assessment.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#EF4444" />
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amsler Grid Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {currentEye} eye
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Grid3X3 size={24} color="#EF4444" />
          <Text style={styles.instructionText}>
            {currentEye === 'right' 
              ? 'Cover your left eye. Stare at the center dot and tap any areas where lines appear wavy, blurry, or missing.'
              : 'Cover your right eye. Stare at the center dot and tap any areas where lines appear wavy, blurry, or missing.'
            }
          </Text>
        </View>

        <View style={styles.gridContainer}>
          <View 
            style={styles.gridWrapper}
            {...panResponder.panHandlers}
          >
            <Svg width={GRID_SIZE} height={GRID_SIZE}>
              {renderGrid()}
              
              {/* Center fixation dot */}
              <Circle
                cx={GRID_SIZE / 2}
                cy={GRID_SIZE / 2}
                r="3"
                fill="#1F2937"
              />
              
              {/* Distortion marks */}
              {(distortionMarks[currentEye] || []).map((mark) => (
                <Circle
                  key={mark.id}
                  cx={mark.x}
                  cy={mark.y}
                  r="4"
                  fill="#EF4444"
                  opacity="0.7"
                />
              ))}
            </Svg>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.marksCount}>
            Distortion marks: {(distortionMarks[currentEye] || []).length}
          </Text>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearMarks}>
            <Text style={styles.clearButtonText}>Clear Marks</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={completeCurrentEye}>
          <Text style={styles.continueButtonText}>
            {currentEye === 'right' ? 'Test Left Eye' : 'Complete Test'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FCA5A5',
    opacity: 0.9,
  },
  testContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#991B1B',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  gridContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gridWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  marksCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  scoreOutOf: {
    fontSize: 24,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eyeResults: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  eyeResult: {
    alignItems: 'center',
  },
  eyeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eyeScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  interpretationCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});