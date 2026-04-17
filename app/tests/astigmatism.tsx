import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOCK_POSITIONS = [
  { angle: 0, label: '12', position: 12 },
  { angle: 30, label: '1', position: 1 },
  { angle: 60, label: '2', position: 2 },
  { angle: 90, label: '3', position: 3 },
  { angle: 120, label: '4', position: 4 },
  { angle: 150, label: '5', position: 5 },
  { angle: 180, label: '6', position: 6 },
  { angle: 210, label: '7', position: 7 },
  { angle: 240, label: '8', position: 8 },
  { angle: 270, label: '9', position: 9 },
  { angle: 300, label: '10', position: 10 },
  { angle: 330, label: '11', position: 11 },
];

export default function AstigmatismTest() {
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [selectedLines, setSelectedLines] = useState<{ [key: string]: number[] }>({});
  const [testComplete, setTestComplete] = useState(false);

  const handleLineSelection = (position: number) => {
    const eyeKey = currentEye;
    const currentSelections = selectedLines[eyeKey] || [];
    
    if (currentSelections.includes(position)) {
      // Remove selection
      setSelectedLines({
        ...selectedLines,
        [eyeKey]: currentSelections.filter(p => p !== position)
      });
    } else {
      // Add selection
      setSelectedLines({
        ...selectedLines,
        [eyeKey]: [...currentSelections, position]
      });
    }
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
      const rightSelections = selectedLines.right || [];
      const leftSelections = selectedLines.left || [];
      const totalSelections = rightSelections.length + leftSelections.length;
      
      // Calculate severity based on number of distorted lines
      let severity = 'normal';
      let score = 100;
      
      if (totalSelections > 6) {
        severity = 'concern';
        score = 40;
      } else if (totalSelections > 3) {
        severity = 'attention';
        score = 70;
      } else if (totalSelections > 0) {
        severity = 'attention';
        score = 85;
      }

      const result = {
        id: Date.now().toString(),
        testType: 'Astigmatism',
        date: new Date().toISOString().split('T')[0],
        score,
        status: severity,
        details: `Right eye: ${rightSelections.length} distorted lines, Left eye: ${leftSelections.length} distorted lines`,
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
    setSelectedLines({});
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
      case 'normal': return 'No Astigmatism Detected';
      case 'attention': return 'Mild Astigmatism';
      case 'concern': return 'Significant Astigmatism';
      default: return 'Unknown';
    }
  };

  if (testComplete) {
    const rightSelections = selectedLines.right || [];
    const leftSelections = selectedLines.left || [];
    const totalSelections = rightSelections.length + leftSelections.length;
    
    let severity = 'normal';
    let score = 100;
    
    if (totalSelections > 6) {
      severity = 'concern';
      score = 40;
    } else if (totalSelections > 3) {
      severity = 'attention';
      score = 70;
    } else if (totalSelections > 0) {
      severity = 'attention';
      score = 85;
    }
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Target size={48} color="#F59E0B" />
            <Text style={styles.scoreTitle}>Astigmatism Test Results</Text>
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
                <Text style={styles.eyeScore}>{rightSelections.length} lines</Text>
              </View>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Left Eye</Text>
                <Text style={styles.eyeScore}>{leftSelections.length} lines</Text>
              </View>
            </View>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Interpretation</Text>
            <Text style={styles.interpretationText}>
              {severity === 'normal' 
                ? 'No significant astigmatism detected. Your vision appears to have normal symmetry.'
                : severity === 'attention'
                ? 'Mild astigmatism detected. Consider an eye exam to discuss correction options.'
                : 'Significant astigmatism detected. We recommend scheduling an eye exam for proper evaluation and correction.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#F59E0B" />
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
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Astigmatism Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {currentEye} eye
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Target size={24} color="#F59E0B" />
          <Text style={styles.instructionText}>
            {currentEye === 'right' 
              ? 'Cover your left eye. Look at the center of the clock dial below and tap any lines that appear darker, thicker, or more distinct than others.'
              : 'Cover your right eye. Look at the center of the clock dial below and tap any lines that appear darker, thicker, or more distinct than others.'
            }
          </Text>
        </View>

        <View style={styles.clockContainer}>
          <View style={styles.clockDial}>
            {/* Center dot */}
            <View style={styles.centerDot} />
            
            {/* Clock lines */}
            {CLOCK_POSITIONS.map((pos) => {
              const isSelected = (selectedLines[currentEye] || []).includes(pos.position);
              return (
                <TouchableOpacity
                  key={pos.position}
                  style={[
                    styles.clockLine,
                    {
                      transform: [{ rotate: `${pos.angle}deg` }],
                      backgroundColor: isSelected ? '#F59E0B' : '#374151',
                      opacity: isSelected ? 1 : 0.7,
                    }
                  ]}
                  onPress={() => handleLineSelection(pos.position)}
                  activeOpacity={0.7}
                />
              );
            })}
            
            {/* Position labels */}
            {CLOCK_POSITIONS.map((pos) => {
              const radius = 110;
              const x = Math.cos((pos.angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((pos.angle - 90) * Math.PI / 180) * radius;
              
              return (
                <View
                  key={`label-${pos.position}`}
                  style={[
                    styles.positionLabel,
                    {
                      left: 150 + x - 12,
                      top: 150 + y - 12,
                    }
                  ]}
                >
                  <Text style={styles.positionText}>{pos.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected lines: {(selectedLines[currentEye] || []).length}
          </Text>
          <Text style={styles.selectionHint}>
            Tap lines that appear darker or more distinct
          </Text>
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
    color: '#FDE68A',
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
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  clockDial: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F2937',
    position: 'absolute',
    zIndex: 10,
  },
  clockLine: {
    position: 'absolute',
    width: 2,
    height: 80,
    top: 30,
    left: 149,
    transformOrigin: '50% 120px',
  },
  positionLabel: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectionInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectionHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  continueButton: {
    backgroundColor: '#F59E0B',
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
    color: '#F59E0B',
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
    borderColor: '#F59E0B',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#F59E0B',
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