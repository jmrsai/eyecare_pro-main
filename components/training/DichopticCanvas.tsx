import React from 'react';
import { Canvas, Circle, Group, ColorMatrix, useValue, useFrame } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Red filter matrix (only red channel passes)
const RED_MATRIX = [
  1, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0, 0, 1, 0,
];

// Blue filter matrix (only blue channel passes)
const BLUE_MATRIX = [
  0, 0, 0, 0, 0,
  0, 0, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

export const DichopticCanvas = () => {
  const x = useValue(width / 2);
  const y = useValue(height / 2);

  useFrame((t) => {
    // Simple circular motion
    x.current = width / 2 + Math.cos(t / 500) * 100;
    y.current = height / 2 + Math.sin(t / 500) * 100;
  });

  return (
    <Canvas style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Red Layer: Visible to Left Eye (with Red Lens) */}
      <Group>
        <ColorMatrix matrix={RED_MATRIX} />
        <Circle cx={x} cy={y} r={30} color="red" />
        {/* Target coin visible only to weak eye */}
        <Circle cx={width / 2} cy={height / 3} r={20} color="red" />
      </Group>

      {/* Blue Layer: Visible to Right Eye (with Blue Lens) */}
      <Group>
        <ColorMatrix matrix={BLUE_MATRIX} />
        {/* Obstacles visible only to strong eye */}
        <Circle cx={width / 4} cy={height / 2} r={50} color="blue" />
        <Circle cx={3 * width / 4} cy={height / 2} r={50} color="blue" />
      </Group>
    </Canvas>
  );
};
