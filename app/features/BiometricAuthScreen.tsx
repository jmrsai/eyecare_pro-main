
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';

interface BiometricAuthScreenProps {
  onAuthenticated: () => void;
}

export default function BiometricAuthScreen({ onAuthenticated }: BiometricAuthScreenProps) {
  const { isSupported, authenticate } = useBiometricAuth();

  const handleAuth = async () => {
    if (isSupported) {
      const success = await authenticate();
      if (success) {
        onAuthenticated();
      } else {
        Alert.alert('Authentication failed', 'Please try again.');
      }
    } else {
      Alert.alert('Biometric authentication not supported on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Required</Text>
      <Text style={styles.instructions}>
        Please authenticate to access sensitive clinical data.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>Authenticate with Biometrics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
