
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useCalibration } from '../../hooks/useCalibration';

const { width: screenWidth } = Dimensions.get('window');
const CREDIT_CARD_WIDTH_IN = 3.37; // Standard credit card width in inches

export default function CalibrationScreen() {
  const { savePpi } = useCalibration();
  const [calibrated, setCalibrated] = useState(false);
  const boxWidth = useSharedValue(screenWidth * 0.5); // Initial width

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      boxWidth.value += event.changeX;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(boxWidth.value, { damping: 2, stiffness: 90 }),
    };
  });

  const handleCalibration = () => {
    const ppi = boxWidth.value / CREDIT_CARD_WIDTH_IN;
    savePpi(ppi);
    setCalibrated(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
        <Text style={styles.title}>Screen Calibration</Text>
        <Text style={styles.instructions}>
            Place a credit card against the screen and drag the edge of the blue box to match its width.
        </Text>
        
        <View style={styles.calibrationArea}>
            <Animated.View style={[styles.resizableBox, animatedStyle]}>
                <GestureDetector gesture={panGesture}>
                    <View style={styles.handle} />
                </GestureDetector>
            </Animated.View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCalibration}>
            <Text style={styles.buttonText}>Save Calibration</Text>
        </TouchableOpacity>
        
        {calibrated && <Text style={styles.successMessage}>Calibration Saved!</Text>}

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
    color: '#333',
  },
  calibrationArea: {
    height: 100, 
    width: '100%',
    justifyContent: 'center', 
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  resizableBox: {
    height: 80,
    backgroundColor: 'rgba(0, 122, 255, 0.7)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 8,
  },
  handle: {
    width: 30,
    height: '100%',
    borderRightWidth: 4,
    borderRightColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successMessage: {
    marginTop: 20,
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  }
});
