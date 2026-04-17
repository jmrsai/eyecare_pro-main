import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, Group, Paint, useSharedValue, withRepeat, withTiming, Easing, Rect } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

export function DichopticCanvas() {
  const circlePos = useSharedValue({ x: width / 2, y: height / 2 });
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [scale]);

  return (
    <Canvas style={styles.canvas}>
      {/* Background - Visible to both eyes generally or specific eye if filtered */}
      <Rect x={0} y={0} width={width} height={height} color="#000" />
      
      {/* Target for Left Eye (Red) */}
      <Group>
        <Paint color="#FF0000" />
        <Circle cx={width * 0.3} cy={height / 2} r={30} />
      </Group>

      {/* Target for Right Eye (Blue) */}
      <Group>
        <Paint color="#0000FF" />
        <Circle cx={width * 0.7} cy={height / 2} r={30} />
      </Group>

      {/* Moving Central Target for Fusion Training */}
      <Group>
        <Paint color="#FFF" />
        <Circle cx={width / 2} cy={height / 2} r={20} />
      </Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
