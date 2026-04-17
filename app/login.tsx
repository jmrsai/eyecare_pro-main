import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react-native';
import appTheme from '../styles/theme';

export default function LoginScreen() {
  const { COLORS, SIZES, FONTS, SHADOWS } = appTheme;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MotiView 
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.card}
      >
        <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={styles.subtitle}>{isRegistering ? 'Start your eye care journey today' : 'Log in to sync your vision health data'}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              {isRegistering ? <UserPlus size={20} color="#FFF" /> : <LogIn size={20} color="#FFF" />}
              <Text style={styles.buttonText}>{isRegistering ? 'Register' : 'Log In'}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switchText}>
            {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Register"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestButtonText}>Continue as Guest</Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 30, ...appTheme.SHADOWS.medium },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 12, color: '#1E293B' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingRight: 16 },
  eyeIcon: { padding: 4 },
  button: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  switchText: { textAlign: 'center', marginTop: 20, color: '#3B82F6', fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 15, color: '#94A3B8', fontWeight: 'bold' },
  guestButton: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
  guestButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
});
