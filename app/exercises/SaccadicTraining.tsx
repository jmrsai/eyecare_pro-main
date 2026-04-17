
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

export default function SaccadicTraining() {
  const position = useSharedValue(0);

  useEffect(() => {
    // Jump between left (0) and right (1) every 500ms
    position.value = withRepeat(
      withTiming(1, { duration: 500, easing: Easing.steps(2) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * 300 - 150 }],
  }));

  return (
    <Animated.View style={[styles.target, animatedStyle]}>
      <View style={styles.dot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  }
});
