import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';

export const DistanceMonitor = () => {
  const { distance, isDistanceCorrect } = useFaceDistance();

  if (distance === null) return null;

  return (
    <AnimatePresence>
      {!isDistanceCorrect && (
        <MotiView
          from={{ opacity: 0, translateY: -20, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -20, scale: 0.9 }}
          style={styles.container}
        >
          <BlurView intensity={90} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} />
          <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
            <AlertTriangle size={18} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>Adjust Distance</Text>
            <Text style={[styles.subtitle, { color: '#CBD5E1' }]}>Currently: {distance}cm (Target: 40cm)</Text>
          </View>
        </MotiView>
      )}
      
      {isDistanceCorrect && (
        <MotiView
          from={{ opacity: 0, translateY: -20, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          exit={{ opacity: 0, translateY: -20, scale: 0.9 }}
          style={styles.container}
        >
          <BlurView intensity={95} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} />
          <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
            <CheckCircle2 size={18} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.title, { color: '#0F172A' }]}>Perfect Distance</Text>
            <Text style={[styles.subtitle, { color: '#475569' }]}>Hold steady at {distance}cm</Text>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 12,
    zIndex: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
  }
});
