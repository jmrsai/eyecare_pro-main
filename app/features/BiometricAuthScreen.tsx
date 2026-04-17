import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Lock, Fingerprint } from 'lucide-react-native';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { LinearGradient } from 'expo-linear-gradient';

export default function BiometricAuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { authenticate } = useBiometricAuth();

  const handlePress = async () => {
    const success = await authenticate();
    if (success) {
      onAuthenticated();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Fingerprint size={80} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Secure Access</Text>
        <Text style={styles.subtitle}>EyeCare Pro is locked to protect your health data.</Text>

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Lock size={20} color="#FFF" style={{ marginRight: 10 }} />
          <Text style={styles.buttonText}>Unlock App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconContainer: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 40
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  button: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 18, 
    paddingHorizontal: 40, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
