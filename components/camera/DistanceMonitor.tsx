import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useFaceDistance } from '../../hooks/useFaceDistance';
import { MotiView, AnimatePresence } from 'moti';

export const DistanceMonitor = () => {
  const { distance, isDistanceCorrect } = useFaceDistance();

  if (distance === null) return null;

  return (
    <AnimatePresence>
      {!isDistanceCorrect && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          style={[styles.container, styles.errorContainer]}
        >
          <AlertTriangle size={20} color="#FFF" />
          <View>
            <Text style={styles.title}>Adjust Distance</Text>
            <Text style={styles.subtitle}>Currently: {distance}cm (Target: 40cm)</Text>
          </View>
        </MotiView>
      )}
      
      {isDistanceCorrect && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          style={[styles.container, styles.successContainer]}
        >
          <CheckCircle2 size={20} color="#FFF" />
          <View>
            <Text style={styles.title}>Perfect Distance</Text>
            <Text style={styles.subtitle}>Hold steady at {distance}cm</Text>
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
    borderRadius: 20,
    gap: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  errorContainer: {
    backgroundColor: '#EF4444',
  },
  successContainer: {
    backgroundColor: '#10B981',
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  }
});
