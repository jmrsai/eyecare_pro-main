import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { MotiView } from 'moti';
import { X, Zap, RefreshCw, AlertCircle, Eye } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useFormCoachAnalysis } from '../../hooks/useFormCoachAnalysis';

export default function AIFormCoach() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { postureScore, blinkRate, distanceAlert, frameOutput, modelState } = useFormCoachAnalysis();
  
  const [isCoaching, setIsCoaching] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing AI...');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (modelState === 'loaded') {
      setStatusMessage('AI Mesh Model Loaded');
    } else {
      setStatusMessage('Model loading (Running Simulation)...');
    }
  }, [modelState]);

  useEffect(() => {
    if (!isCoaching) return;

    // Trigger haptics on posture warning
    if (postureScore < 70) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [postureScore, isCoaching]);

  const startCoaching = () => {
    setIsCoaching(true);
    setStatusMessage('Coaching Active');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.permissionText}>Awaiting camera permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device && (
        <VisionCamera 
          style={styles.camera} 
          device={device} 
          isActive={true} 
          outputs={[frameOutput]}
        />
      )}
      
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']} style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color="#FFF" />
          </Pressable>
          <View style={styles.statusBadge}>
            <View style={[styles.dot, { backgroundColor: isCoaching ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>

        <View style={styles.hudContainer}>
          <MotiView 
            animate={{ scale: postureScore < 70 && isCoaching ? 1.1 : 1 }}
            style={[styles.scoreRing, { borderColor: !isCoaching ? '#64748B' : postureScore > 70 ? '#3B82F6' : '#EF4444' }]}
          >
            <Text style={styles.scoreLabel}>POSTURE</Text>
            <Text style={styles.scoreValue}>{isCoaching ? Math.round(postureScore) : '--'}%</Text>
          </MotiView>

          <View style={styles.secondaryHud}>
            <MotiView 
              animate={{ opacity: blinkRate < 10 && isCoaching ? 1 : 0.7 }}
              style={[styles.miniHud, { borderColor: !isCoaching ? '#64748B' : blinkRate > 10 ? '#10B981' : '#F59E0B' }]}
            >
              <Eye size={16} color="#FFF" />
              <Text style={styles.miniHudValue}>{isCoaching ? Math.round(blinkRate) : '--'}</Text>
              <Text style={styles.miniHudLabel}>BPM</Text>
            </MotiView>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Zap size={18} color="#3B82F6" />
              <Text style={styles.infoTitle}>On-Device AI Active</Text>
            </View>
            <Text style={styles.infoDesc}>On-device processing ensures your privacy is 100% protected.</Text>
          </View>
          
          <View style={styles.disclaimerBox}>
            <AlertCircle size={14} color="#FF9500" />
            <Text style={styles.disclaimerText}>
              EyeCare Coach is not a medical device. Use for postural guidance only.
            </Text>
          </View>
          
          <View style={styles.controls}>
            <Pressable onPress={startCoaching} style={styles.actionBtn}>
              <RefreshCw size={24} color="#FFF" />
              <Text style={styles.actionText}>{isCoaching ? 'Recalibrate' : 'Start Coach'}</Text>
            </Pressable>
            
            <View style={styles.alertBox}>
              <AlertCircle size={20} color={isCoaching && distanceAlert ? '#EF4444' : '#64748B'} />
              <Text style={[styles.alertText, { color: isCoaching && distanceAlert ? '#EF4444' : '#FFF' }]}>
                Distance: {!isCoaching ? '--' : distanceAlert ? 'Too Close' : 'Optimal'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 40 },
  camera: { ...StyleSheet.absoluteFillObject },
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
  secondaryHud: {
    position: 'absolute',
    right: -60,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  miniHud: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniHudValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniHudLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 8,
    fontWeight: '700',
  },
  bottomBar: { marginBottom: 30 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoTitle: { color: '#FFF', fontWeight: '700', marginLeft: 8 },
  infoDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  actionText: { color: '#FFF', fontWeight: '700', marginLeft: 10 },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  alertText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  permissionText: { color: '#FFF', marginTop: 16, textAlign: 'center', fontSize: 16 },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  disclaimerText: {
    color: '#FF9500',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
});
