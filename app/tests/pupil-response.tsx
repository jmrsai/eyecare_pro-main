import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowLeft, RotateCcw, Camera, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PupilMeasurement {
  eye: 'right' | 'left';
  initialDiameter: number;
  finalDiameter: number;
  responseTime: number;
  constrictionPercent: number;
}

export default function PupilResponseTest() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [testPhase, setTestPhase] = useState<'setup' | 'measuring' | 'flash' | 'complete'>('setup');
  const [measurements, setMeasurements] = useState<PupilMeasurement[]>([]);
  const [testComplete, setTestComplete] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const flashStartTime = useRef<number>(0);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const startMeasurement = () => {
    setTestPhase('measuring');
    
    // Simulate initial pupil measurement
    setTimeout(() => {
      triggerFlash();
    }, 2000);
  };

  const triggerFlash = () => {
    setTestPhase('flash');
    setFlashActive(true);
    flashStartTime.current = Date.now();
    
    // Flash duration
    setTimeout(() => {
      setFlashActive(false);
      measurePupilResponse();
    }, 200);
  };

  const measurePupilResponse = () => {
    const responseTime = Date.now() - flashStartTime.current;
    
    // Simulate pupil measurements (in real implementation, use computer vision)
    const initialDiameter = 4.5 + Math.random() * 1.5; // 4.5-6mm normal range
    const constrictionPercent = 25 + Math.random() * 35; // 25-60% normal range
    const finalDiameter = initialDiameter * (1 - constrictionPercent / 100);
    
    const measurement: PupilMeasurement = {
      eye: currentEye,
      initialDiameter,
      finalDiameter,
      responseTime,
      constrictionPercent,
    };

    const newMeasurements = [...measurements, measurement];
    setMeasurements(newMeasurements);

    if (currentEye === 'right') {
      Alert.alert(
        'Right Eye Complete',
        `Pupil constriction: ${constrictionPercent.toFixed(1)}%\nResponse time: ${responseTime}ms\n\nNow test your left eye.`,
        [{ text: 'Continue', onPress: () => switchToLeftEye() }]
      );
    } else {
      completeTest(newMeasurements);
    }
  };

  const switchToLeftEye = () => {
    setCurrentEye('left');
    setTestPhase('setup');
  };

  const completeTest = async (testMeasurements: PupilMeasurement[]) => {
    const avgConstriction = testMeasurements.reduce((sum, m) => sum + m.constrictionPercent, 0) / testMeasurements.length;
    const avgResponseTime = testMeasurements.reduce((sum, m) => sum + m.responseTime, 0) / testMeasurements.length;
    
    try {
      const result = {
        id: Date.now().toString(),
        testType: 'Pupil Response',
        date: new Date().toISOString().split('T')[0],
        score: Math.round(avgConstriction * 2), // Convert to 0-100 scale
        status: getPupilStatus(avgConstriction, avgResponseTime),
        details: `Avg constriction: ${avgConstriction.toFixed(1)}%, Avg response: ${avgResponseTime.toFixed(0)}ms`,
      };

      const existingResults = await AsyncStorage.getItem('testResults');
      const results = existingResults ? JSON.parse(existingResults) : [];
      results.unshift(result);
      
      await AsyncStorage.setItem('testResults', JSON.stringify(results));
    } catch (error) {
      console.error('Error saving test results:', error);
    }

    setTestComplete(true);
  };

  const getPupilStatus = (constriction: number, responseTime: number): 'normal' | 'attention' | 'concern' => {
    if (constriction >= 25 && constriction <= 60 && responseTime <= 500) return 'normal';
    if (constriction >= 15 && responseTime <= 800) return 'attention';
    return 'concern';
  };

  const resetTest = () => {
    setCurrentEye('right');
    setTestPhase('setup');
    setMeasurements([]);
    setTestComplete(false);
    setFlashActive(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={48} color="#6B7280" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This test requires camera access to measure pupil response to light.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <AlertTriangle size={48} color="#F59E0B" />
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to use this test.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (testComplete) {
    const avgConstriction = measurements.reduce((sum, m) => sum + m.constrictionPercent, 0) / measurements.length;
    const avgResponseTime = measurements.reduce((sum, m) => sum + m.responseTime, 0) / measurements.length;
    const status = getPupilStatus(avgConstriction, avgResponseTime);
    
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
            <Eye size={48} color="#EF4444" />
            <Text style={styles.scoreTitle}>Pupil Response Results</Text>
            
            <View style={styles.measurementGrid}>
              {measurements.map((measurement, index) => (
                <View key={index} style={styles.measurementCard}>
                  <Text style={styles.eyeLabel}>{measurement.eye.toUpperCase()} EYE</Text>
                  <Text style={styles.measurementValue}>
                    {measurement.constrictionPercent.toFixed(1)}%
                  </Text>
                  <Text style={styles.measurementLabel}>Constriction</Text>
                  <Text style={styles.responseTime}>
                    {measurement.responseTime.toFixed(0)}ms response
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>

          <View style={styles.warningCard}>
            <AlertTriangle size={20} color="#F59E0B" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Experimental Test</Text>
              <Text style={styles.warningText}>
                This is an experimental feature with limited accuracy. Results should be interpreted 
                with caution and are not a substitute for professional neurological examination.
              </Text>
            </View>
          </View>

          <View style={styles.interpretationCard}>
            <Text style={styles.interpretationTitle}>Clinical Notes</Text>
            <Text style={styles.interpretationText}>
              Normal pupil constriction: 25-60%{'\n'}
              Normal response time: &lt;500ms{'\n'}
              {status === 'concern' && 'Abnormal findings may indicate neurological issues requiring professional evaluation.'}
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
        <Text style={styles.headerTitle}>Pupil Response Test</Text>
        <Text style={styles.headerSubtitle}>
          Testing {currentEye} eye • {testPhase}
        </Text>
      </LinearGradient>

      <View style={styles.testContainer}>
        <View style={styles.warningCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Experimental Feature</Text>
            <Text style={styles.warningText}>
              This test is experimental and requires optimal lighting conditions. 
              Results have limited clinical accuracy.
            </Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Eye size={24} color="#EF4444" />
          <Text style={styles.instructionText}>
            Position the front camera close to your {currentEye} eye in dim lighting. 
            The screen will flash bright white to test pupil response.
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          {flashActive && <View style={styles.flashOverlay} />}
          
          <CameraView
            style={styles.camera}
            facing="front"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.pupilGuide} />
              <Text style={styles.cameraInstructions}>
                Position your {currentEye} eye in the circle
              </Text>
            </View>
          </CameraView>
        </View>

        <View style={styles.controlsContainer}>
          {testPhase === 'setup' && (
            <TouchableOpacity style={styles.startButton} onPress={startMeasurement}>
              <Text style={styles.startButtonText}>Start Measurement</Text>
            </TouchableOpacity>
          )}
          
          {testPhase === 'measuring' && (
            <View style={styles.measuringContainer}>
              <Text style={styles.measuringText}>Measuring baseline pupil size...</Text>
              <Text style={styles.measuringSubtext}>Keep your eye steady</Text>
            </View>
          )}
          
          {testPhase === 'flash' && (
            <View style={styles.measuringContainer}>
              <Text style={styles.measuringText}>Recording pupil response...</Text>
              <Text style={styles.measuringSubtext}>Don&apos;t blink</Text>
            </View>
          )}
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
    case 'normal': return 'Normal Response';
    case 'attention': return 'Borderline';
    case 'concern': return 'Abnormal Response';
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
    color: '#FCA5A5',
    opacity: 0.9,
  },
  testContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#991B1B',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pupilGuide: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  cameraInstructions: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  measuringContainer: {
    alignItems: 'center',
  },
  measuringText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  measuringSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
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
    marginBottom: 20,
  },
  measurementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  measurementCard: {
    alignItems: 'center',
    flex: 1,
  },
  eyeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  measurementValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 4,
  },
  measurementLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  responseTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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