import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Info, HelpCircle } from 'lucide-react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { DichopticCanvas } from '../../../components/training/DichopticCanvas';

export default function DichopticTraining() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Dichoptic Training</Text>
          <TouchableOpacity>
            <HelpCircle size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.canvasContainer}>
        <DichopticCanvas />
        
        <View style={styles.overlay}>
          <View style={styles.instructionBox}>
            <Info size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.instructionText}>Wear your Red/Blue glasses. Ensure the red lens is on your weak eye.</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.endBtn} onPress={() => router.back()}>
          <Text style={styles.endBtnText}>Finish Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  canvasContainer: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 10,
  },
  instructionText: { color: '#FFF', fontSize: 12, textAlign: 'center' },
  controls: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#000',
  },
  endBtn: {
    backgroundColor: '#EF4444',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  endBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
