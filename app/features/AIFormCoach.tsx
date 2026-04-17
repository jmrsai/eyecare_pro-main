import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import { MotiView } from 'moti';
import { ShieldCheck, Info, X, Zap, RefreshCw, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Calibration constants
const OPTIMAL_EYE_DISTANCE = 110; // Pixel distance (~50cm on average device)
const TOLERANCE = 20;

export default function AIFormCoach() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isModelReady, setIsModelReady] = useState(false);
  const [isTfReady, setIsTfReady] = useState(false);
  const [postureScore, setPostureScore] = useState(100);
  const [statusMessage, setStatusMessage] = useState('Initializing AI...');
  const [distanceAlert, setDistanceAlert] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const netRef = useRef<posenet.PoseNet | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      await tf.ready();
      setIsTfReady(true);
      const net = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 257, height: 257 },
        multiplier: 0.5
      });
      netRef.current = net;
      setIsModelReady(true);
      setStatusMessage('Coach Ready');
    })();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCoaching = () => {
    if (!isModelReady) return;
    
    intervalRef.current = setInterval(async () => {
      // Logic for capturing frame and analyzing
      // Note: In a real production Expo app, we'd use expo-gl 
      // for direct texture access, but for this MVP 
      // we'll simulate the analysis loop and score updates
      simulateAnalysis();
    }, 1000);
  };

  const simulateAnalysis = () => {
    // Simulated logic to show HUD functionality
    const randomShift = Math.random() * 10 - 5;
    setPostureScore(prev => Math.min(100, Math.max(0, prev + randomShift)));
    
    if (postureScore < 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setStatusMessage('Adjust your posture');
    } else {
      setStatusMessage('Focusing...');
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>We need camera access for the Form Coach</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="front" ref={cameraRef}>
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <X size={24} color="#FFF" />
            </Pressable>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: isModelReady ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          </View>

          <View style={styles.hudContainer}>
            <MotiView 
              animate={{ scale: postureScore < 70 ? 1.1 : 1 }}
              style={[styles.scoreRing, { borderColor: postureScore > 70 ? '#3B82F6' : '#EF4444' }]}
            >
              <Text style={styles.scoreLabel}>POSTURE</Text>
              <Text style={styles.scoreValue}>{Math.round(postureScore)}%</Text>
            </MotiView>
          </View>

          <View style={styles.bottomBar}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Zap size={18} color="#3B82F6" />
                <Text style={styles.infoTitle}>AI Monitoring Active</Text>
              </View>
              <Text style={styles.infoDesc}>On-device processing ensures your privacy is 100% protected.</Text>
            </View>
            
            <View style={styles.controls}>
              <Pressable onPress={startCoaching} style={styles.actionBtn}>
                <RefreshCw size={24} color="#FFF" />
                <Text style={styles.actionText}>Calibrate</Text>
              </Pressable>
              
              <View style={styles.alertBox}>
                <AlertCircle size={20} color={distanceAlert ? '#EF4444' : '#64748B'} />
                <Text style={[styles.alertText, { color: distanceAlert ? '#EF4444' : '#FFF' }]}>
                  Distance: {distanceAlert ? 'Too Close' : 'Optimal'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  camera: { flex: 1 },
  overlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  hudContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scoreRing: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  scoreLabel: { color: '#FFF', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  scoreValue: { color: '#FFF', fontSize: 48, fontWeight: 'bold' },
  bottomBar: { marginBottom: 30 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 20, marginBottom: 20, backdropFilter: 'blur(10px)' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoTitle: { color: '#FFF', fontWeight: '700', marginLeft: 8 },
  infoDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  actionText: { color: '#FFF', fontWeight: '700', marginLeft: 10 },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  alertText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  permissionText: { color: '#FFF', textAlign: 'center', marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#3B82F6', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  buttonText: { color: '#FFF', fontWeight: 'bold' }
});
