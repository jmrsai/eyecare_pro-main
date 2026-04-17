
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { DeviceMotion } from 'expo-sensors';

const HEAD_MOVEMENT_THRESHOLD = 0.2; // Radians

export default function SaccadicTrainingWithHeadMovement() {
  const position = useSharedValue(0);
  const [isHeadMoving, setIsHeadMoving] = useState(false);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(500);
    const subscription = DeviceMotion.addListener(deviceMotionData => {
      if (
        Math.abs(deviceMotionData.rotation.beta) > HEAD_MOVEMENT_THRESHOLD ||
        Math.abs(deviceMotionData.rotation.gamma) > HEAD_MOVEMENT_THRESHOLD
      ) {
        setIsHeadMoving(true);
      } else {
        setIsHeadMoving(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);


  useEffect(() => {
    // Jump between left (0) and right (1) every 500ms
    position.value = withRepeat(
      withTiming(1, { duration: 500, easing: Easing.steps(2) }),
      -1,
      true
    );
  }, [position]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * 300 - 150 }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.target, animatedStyle]}>
        <View style={styles.dot} />
      </Animated.View>
      {isHeadMoving && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Please keep your head still.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  warning: {
    position: 'absolute',
    top: 50,
    backgroundColor: 'rgba(255, 255, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  warningText: {
    color: 'black',
    fontWeight: 'bold',
  }
});
