import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SoundProvider } from '../contexts/SoundContext';
import { registerBackgroundTasks } from '../services/BackgroundTasks';

export default function RootLayout() {
  useEffect(() => {
    registerBackgroundTasks();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <SoundProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ presentation: 'modal' }} />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SoundProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
