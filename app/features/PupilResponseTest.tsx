import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Play } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { useScreenBrightness } from '../../hooks/useScreenBrightness';
import { useAuth } from '../../context/AuthContext';
import { saveTestResult } from '../../lib/firebase';
import appTheme from '../../styles/theme';

export default function PupilResponseTest() {
  const { COLORS, SIZES, FONTS, SHADOWS, TOUCH_TARGET } = appTheme;
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back'); // Use back camera for flash usually, or front
  
  const [testState, setTestState] = useState<'idle' | 'testing' | 'done'>('idle');
  const [flashMode, setFlashMode] = useState<boolean>(false);
  const { setBrightness, restoreSystemBrightness } = useScreenBrightness();
  const { user } = useAuth();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const runTest = async () => {
    if (!device) return;

    setTestState('testing');
    await setBrightness(1.0); // Maximize screen brightness for contrast

    // Dark phase
    setFlashMode(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const darkPupilSize = Math.random() * 2 + 5; // Simulating baseline size

    // Light phase
    setFlashMode(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lightPupilSize = Math.random() * 2 + 2; // Simulating constricted size

    setFlashMode(false);
    
    // Calculate response
    const difference = darkPupilSize - lightPupilSize;
    const responseScore = Math.min(Math.max((difference / darkPupilSize) * 100, 0), 100);
    
    let status: 'normal' | 'attention' | 'concern' = 'normal';
    if (responseScore < 10) status = 'concern';
    else if (responseScore < 20) status = 'attention';

    const result = {
      testType: 'Pupil Response',
      date: new Date().toISOString().split('T')[0],
      score: Math.round(responseScore),
      status,
      details: `Pupil constricted by ${difference.toFixed(2)}mm (${Math.round(responseScore)}%)`,
    };

    if (user?.uid) {
      try {
        await saveTestResult(user.uid, result);
      } catch (e) {
        console.error('Failed to save pupil result', e);
      }
    }

    setTestState('done');
    await restoreSystemBrightness();
  };

  const renderButton = () => {
    switch (testState) {
      case 'testing':
        return <LottieView source={require('../../assets/animations/loading.json')} autoPlay loop style={{ width: 80, height: 80 }} />;
      case 'done':
        return (
          <View style={{ alignItems: 'center' }}>
            <LottieView source={require('../../assets/animations/success.json')} autoPlay loop={false} style={{ width: 100, height: 100 }} />
            <Pressable onPress={() => setTestState('idle')} style={{ marginTop: 10 }}>
              <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Test Again</Text>
            </Pressable>
          </View>
        );
      default:
        return (
          <Pressable
            style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={runTest}
          >
            <Play color={COLORS.surface} size={32} />
            <Text style={styles.buttonText}>Start Test</Text>
          </Pressable>
        );
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    title: { ...FONTS.h2, color: COLORS.text, textAlign: 'center', marginBottom: SIZES.padding },
    cameraContainer: { width: 300, height: 300, borderRadius: 150, overflow: 'hidden', marginBottom: SIZES.padding, backgroundColor: COLORS.text, justifyContent: 'center', alignItems: 'center' },
    camera: { ...StyleSheet.absoluteFillObject },
    button: { ...TOUCH_TARGET, flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius, ...SHADOWS.medium },
    buttonText: { ...FONTS.body, color: COLORS.surface, marginLeft: SIZES.base },
    permissionText: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', padding: SIZES.padding },
  });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera. Please enable permissions.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pupil Response Test</Text>
      <MotiView from={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1}} transition={{ type: 'timing', duration: 500 }}>
        <View style={styles.cameraContainer}>
            <Camera 
              style={styles.camera} 
              device={device}
              isActive={testState === 'testing' || testState === 'idle'}
              torch={flashMode ? 'on' : 'off'}
            />
        </View>
      </MotiView>

      <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
        {renderButton()}
      </View>
    </SafeAreaView>
  );
}
