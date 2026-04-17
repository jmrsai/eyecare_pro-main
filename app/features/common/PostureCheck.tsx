
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { MotiView } from 'moti';

interface PostureCheckProps {
  onPostureCorrect: (isCorrect: boolean) => void;
}

const PostureCheck: React.FC<PostureCheckProps> = ({ onPostureCorrect }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const [feedback] = useState('Positioning camera...');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.feedbackText}>No access to camera. Please enable permissions.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VisionCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        // In a real implementation with a native plugin, we would add:
        // outputs={[frameOutput]}
      />
      
      <MotiView 
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.overlay}
      >
        <View style={styles.guideFrame} />
        <View style={styles.feedbackBadge}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
        
        {/* Mocking successful detection for demo purposes since we lack the native plugin */}
        <TouchableOpacity 
          onPress={() => onPostureCorrect(true)}
          style={styles.simulateBtn}
        >
          <Text style={styles.simulateBtnText}>Simulate Correct Posture</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  guideFrame: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 125,
    borderStyle: 'dashed',
  },
  feedbackBadge: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  feedbackText: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  simulateBtn: {
    position: 'absolute',
    top: 60,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 12,
  },
  simulateBtnText: { color: '#FFF', fontWeight: 'bold' }
});

export default PostureCheck;
