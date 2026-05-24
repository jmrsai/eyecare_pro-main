import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient,
  vec,
  Blur,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export const NeuralSync = () => {
  const { width, height } = useWindowDimensions();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [pulse]);

  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <Canvas style={styles.canvas}>
      <Group>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={['#0A2E6B', '#1CB6D0', '#0A2E6B']}
        />
        
        {/* Core Neural Hub */}
        <Circle cx={centerX} cy={centerY} r={60}>
            <Blur blur={10} />
        </Circle>

        {/* Pulsating Neural Waves */}
        {[1, 2, 3].map((i) => (
          <Circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={60 + i * 40}
            opacity={0.1}
          >
            <Blur blur={5} />
          </Circle>
        ))}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
