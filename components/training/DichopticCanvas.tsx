import React, { useEffect } from 'react';
import { Canvas, Circle, Group, ColorMatrix, useValue, useFrame, Blur, RoundedRect } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const RED_MATRIX = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
const BLUE_MATRIX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

export const DichopticCanvas = () => {
  // Use Reanimated Shared Values for hardware-accelerated motion
  const translateX = useSharedValue(width / 2);
  const translateY = useSharedValue(height / 2);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Advanced Lissajous motion pattern for complex neural tracking
    translateX.value = withRepeat(
      withTiming(width - 100, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(height - 200, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    pulse.value = withRepeat(
      withTiming(1.5, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  // Convert SharedValues to Skia Values for zero-lag rendering
  const skiaX = useDerivedValue(() => translateX.value);
  const skiaY = useDerivedValue(() => translateY.value);
  const skiaPulse = useDerivedValue(() => pulse.value);

  return (
    <Canvas style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Background Neural Noise to stimulate contrast sensitivity */}
      <Group opacity={0.1}>
          <Circle cx={width/2} cy={height/2} r={width}>
              <Blur blur={20} />
          </Circle>
      </Group>

      {/* Weak Eye Layer (Red) - Therapeutic Targets */}
      <Group>
        <ColorMatrix matrix={RED_MATRIX} />
        <Circle cx={skiaX} cy={skiaY} r={30}>
            <Blur blur={2} />
        </Circle>
        <RoundedRect x={100} y={150} width={40} height={40} r={10} color="red" />
      </Group>

      {/* Strong Eye Layer (Blue) - Navigational Obstacles */}
      <Group>
        <ColorMatrix matrix={BLUE_MATRIX} />
        <Circle cx={width / 2} cy={height / 2} r={100 * skiaPulse.value} color="blue" opacity={0.5} />
        <Circle cx={width / 4} cy={height / 4} r={50} color="blue" />
        <Circle cx={3 * width / 4} cy={3 * height / 4} r={50} color="blue" />
      </Group>
    </Canvas>
  );
};
