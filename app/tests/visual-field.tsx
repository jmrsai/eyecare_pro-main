import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, RotateCcw, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';

const { width, height } = Dimensions.get('window');

interface TestPoint {
  x: number;
  y: number;
  detected: boolean;
  shown: boolean;
}

export default function VisualFieldTest() {
  const { user } = useAuth();
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [testPoints, setTestPoints] = useState<TestPoint[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [isFixating, setIsFixating] = useState(true);

  useEffect(() => {
    generateTestPoints();
  }, [currentEye]);

  const generateTestPoints = () => {
    const points: TestPoint[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    // Generate 24 points in a circular pattern around the center
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180); // 15-degree intervals
      const distance = radius * (0.5 + Math.random() * 0.5); // Vary distance
      
      points.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        detected: false,
        shown: false,
      });
    }

    setTestPoints(points);
    setCurrentPointIndex(0);
  };

  const showNextStimulus = () => {
    if (currentPointIndex >= testPoints.length) {
      completeCurrentEye();
      return;
    }

    const updatedPoints = [...testPoints];
    updatedPoints[currentPointIndex].shown = true;
    setTestPoints(updatedPoints);
    setShowStimulus(true);

    // Hide stimulus after 1 second
    setTimeout(() => {
      setShowStimulus(false);
      setTimeout(() => {
        setCurrentPointIndex(currentPointIndex + 1);
      }, 500);
    }, 1000);
  };

  const handleStimulusDetected = () => {
    if (showStimulus && currentPointIndex < testPoints.length) {
      const updatedPoints = [...testPoints];
      updatedPoints[currentPointIndex].detected = true;
      setTestPoints(updatedPoints);
    }
  };

  const completeCurrentEye = async () => {
    const detectedCount = testPoints.filter(point => point.detected).length;
    const accuracy = (detectedCount / testPoints.length) * 100;
    
    const eyeResults = { ...results, [currentEye]: accuracy };
    setResults(eyeResults);

    if (currentEye === 'right') {
      setCurrentEye('left');
      generateTestPoints();
    } else {
      await saveTestResults(eyeResults);
      setTestComplete(true);
    }
  };

  const saveTestResults = async (testResults: { [key: string]: number }) => {
    try {
      const avgScore = Math.round((testResults.right + testResults.left) / 2);
      const result = {
        testType: 'Visual Field',
        date: new Date().toISOString().split('T')[0],
        score: avgScore,
        status: getStatus(avgScore),
        details: `Right eye: ${testResults.right.toFixed(1)}%, Left eye: ${testResults.left.toFixed(1)}%`,
      };

      if (user?.uid) {
        await saveTestResult(user.uid, result);
      }

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift({ id: Date.now().toString(), ...result });
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const getStatus = (score: number): 'normal' | 'attention' | 'concern' => {
    if (score >= 85) return 'normal';
    if (score >= 70) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentEye('right');
    setCurrentPointIndex(0);
    setTestComplete(false);
    setResults({});
    generateTestPoints();
  };

  if (testComplete) {
    const avgScore = Math.round((results.right + results.left) / 2);
    const status = getStatus(avgScore);
    
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Complete</Text>
        </LinearGradient>

        <View style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Target size={48} color="#8B5CF6" />
            <Text style={styles.scoreTitle}>Visual Field Results</Text>
            <Text style={styles.scoreNumber}>{avgScore}</Text>
            <Text style={styles.scoreOutOf}>/100</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>

            <View style={styles.eyeResults}>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Right Eye</Text>
                <Text style={styles.eyeScore}>{results.right?.toFixed(1)}%</Text>
              </View>
              <View style={styles.eyeResult}>
                <Text style={styles.eyeLabel}>Left Eye</Text>
                <Text style={styles.eyeScore}>{results.left?.toFixed(1)}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Clinical Significance</Text>
            <Text style={styles.interpretationText}>
              {status === 'normal' 
                ? 'Your peripheral vision appears normal. Continue regular monitoring.'
                : status === 'attention'
                ? 'Some peripheral vision defects detected. Consider professional evaluation for glaucoma screening.'
                : 'Significant peripheral vision loss detected. Urgent ophthalmologic evaluation recommended for glaucoma assessment.'
              }
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeButton} onPress={resetTest}>
            <RotateCcw size={20} color="#8B5CF6" />
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
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visual Field Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {currentEye} eye • Point {currentPointIndex + 1} of {testPoints.length}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.instructionCard}>
          <Target size={24} color="#8B5CF6" />
          <Text style={styles.instructionText}>
            {currentEye === 'right' 
              ? 'Cover your left eye. Stare at the center dot and tap when you see flashes in your peripheral vision.'
              : 'Cover your right eye. Stare at the center dot and tap when you see flashes in your peripheral vision.'
            }
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.testArea}
          onPress={handleStimulusDetected}
          activeOpacity={1}
        >
          {/* Central fixation point */}
          <View style={styles.fixationPoint} />
          
          {/* Test stimuli */}
          {testPoints.map((point, index) => (
            <View
              key={index}
              style={[
                styles.stimulus,
                {
                  left: point.x - 10,
                  top: point.y - 10,
                  opacity: showStimulus && index === currentPointIndex ? 0.7 : 0,
                }
              ]}
            />
          ))}
        </TouchableOpacity>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={showNextStimulus}
            disabled={showStimulus}
          >
            <Text style={styles.nextButtonText}>
              {currentPointIndex === 0 ? 'Start Test' : 'Next Point'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {currentPointIndex} / {testPoints.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentPointIndex / testPoints.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    case 'normal': return 'Normal';
    case 'attention': return 'Needs Attention';
    case 'concern': return 'Concerning';
    default: return 'Unknown';
  }
};

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
    color: '#DDD6FE',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  testArea: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    position: 'relative',
    marginBottom: 20,
  },
  fixationPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    left: width / 2 - 4,
    top: '50%',
    marginTop: -4,
  },
  stimulus: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
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
    color: '#8B5CF6',
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
    borderColor: '#8B5CF6',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#8B5CF6',
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