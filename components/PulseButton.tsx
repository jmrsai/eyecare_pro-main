import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface PulseButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  pulse?: boolean;
}

const Ring = ({ delay }: { delay: number }) => {
  const ring = useSharedValue(0);
  const theme = useTheme();

  useEffect(() => {
    ring.value = withRepeat(
      withDelay(
        delay,
        withTiming(1, {
          duration: 2000,
        })
      ),
      -1,
      false
    );
  }, [delay, ring]);

  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(ring.value, [0, 0.5, 1], [0, 0.3, 0]),
      transform: [
        {
          scale: interpolate(ring.value, [0, 1], [1, 2.5]),
        },
      ],
    };
  });

  return <Animated.View style={[styles.ring, { borderColor: theme.theme.colors.primary }, style]} />;
};

export function PulseButton({ onPress, title, style, textStyle, pulse = true }: PulseButtonProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {pulse && (
        <>
          <Ring delay={0} />
          <Ring delay={500} />
          <Ring delay={1000} />
        </>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.theme.colors.secondary },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.text, { fontFamily: 'Inter_600SemiBold' }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    zIndex: 1,
  },
});
