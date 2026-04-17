
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Alert } from 'react-native';
import { Svg, Line, Circle } from 'react-native-svg';
import { Accelerometer } from 'expo-sensors';
import { HardDriveDownload, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import appTheme from '../../styles/theme';
import { getFunctions, httpsCallable } from 'firebase/functions';

const { width } = Dimensions.get('window');
const GRID_SIZE = width * 0.9;
const CELL_SIZE = GRID_SIZE / 20;
const CENTER_DOT_RADIUS = 5;
const TREMOR_THRESHOLD = 1.2;

export default function AmslerGrid() {
  const { COLORS, SIZES, FONTS, SHADOWS, TOUCH_TARGET } = appTheme;

  const [distortions, setDistortions] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [tremorDetected, setTremorDetected] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  const handlePress = (event: any) => {
    if (!isTesting) return;
    const { locationX, locationY } = event.nativeEvent;
    setDistortions([...distortions, { x: locationX, y: locationY, timestamp: new Date().toISOString() }]);
    setIsSaved(false); // New data, not saved yet
  };

  const startTest = () => {
    setDistortions([]);
    setTremorDetected(false);
    setIsTesting(true);
    setIsSaved(false);

    const sub = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > TREMOR_THRESHOLD) {
        setTremorDetected(true);
      }
    });
    setSubscription(sub);
  };

  const finishTest = async () => {
    if (subscription) {
      subscription.remove();
    }
    setSubscription(null);
    setIsTesting(false);

    // Save data to backend
    const functions = getFunctions();
    const logTestResult = httpsCallable(functions, 'logTestResult');

    try {
      await logTestResult({
        testType: 'AMSLER_GRID',
        testData: {
          distortions,
          tremorDetected,
          gridSize: GRID_SIZE,
          timestamp: new Date().toISOString(),
        },
      });
      setIsSaved(true);
      Alert.alert("Test Saved", "Your Amsler Grid test results have been saved.");
    } catch (error) {
      console.error("Error saving test result:", error);
      Alert.alert("Save Failed", "There was an error saving your results. Please try again.");
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    title: { ...FONTS.h2, color: COLORS.text, textAlign: 'center', marginBottom: SIZES.padding },
    gridContainer: { width: GRID_SIZE, height: GRID_SIZE, backgroundColor: 'white', ...SHADOWS.medium },
    button: { ...TOUCH_TARGET, flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.padding, borderRadius: SIZES.radius, marginTop: SIZES.padding, ...SHADOWS.medium },
    buttonText: { ...FONTS.body, color: COLORS.surface, marginLeft: SIZES.base },
    savedText: { ...FONTS.body, color: COLORS.success, marginLeft: SIZES.base },
    tremorWarning: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.padding, paddingHorizontal: SIZES.padding, paddingVertical: SIZES.base, backgroundColor: '#FFF3F3', borderRadius: SIZES.radius },
    warningText: { ...FONTS.body, color: COLORS.alert, marginLeft: SIZES.base },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Amsler Grid Test</Text>
      <Pressable onPress={handlePress}>
        <Svg height={GRID_SIZE} width={GRID_SIZE} style={styles.gridContainer}>
          {Array.from({ length: 21 }).map((_, i) => (
            <React.Fragment key={i}>
              <Line x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={GRID_SIZE} stroke={COLORS.textSecondary} strokeWidth="1" />
              <Line x1="0" y1={i * CELL_SIZE} x2={GRID_SIZE} y2={i * CELL_SIZE} stroke={COLORS.textSecondary} strokeWidth="1" />
            </React.Fragment>
          ))}
          <Circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={CENTER_DOT_RADIUS} fill={COLORS.text} />
          {distortions.map((d, i) => <Circle key={i} cx={d.x} cy={d.y} r={CELL_SIZE / 2} fill={COLORS.alert} opacity="0.5" />)}
        </Svg>
      </Pressable>
      
      {isTesting && tremorDetected && (
        <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.tremorWarning}>
          <AlertTriangle color={COLORS.alert} size={24} />
          <Text style={styles.warningText}>Hand tremor detected. Results may be inaccurate.</Text>
        </MotiView>
      )}

      <Pressable 
        style={({ pressed }) => [styles.button, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        onPress={isTesting ? finishTest : startTest}
      >
        {isSaved ? (
          <><CheckCircle color={COLORS.surface} size={24} /><Text style={styles.savedText}>Test Saved</Text></>
        ) : (
          <><HardDriveDownload color={COLORS.surface} size={24} /><Text style={styles.buttonText}>{isTesting ? 'Finish & Save Test' : 'Start Test'}</Text></>
        )}
      </Pressable>
    </View>
  );
}
