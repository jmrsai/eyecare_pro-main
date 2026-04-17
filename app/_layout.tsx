import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SoundProvider } from '../contexts/SoundContext';
import { registerBackgroundTasks } from '../services/BackgroundTasks';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import {
  Lexend_400Regular,
  Lexend_700Bold
} from '@expo-google-fonts/lexend';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Lexend_400Regular,
    Lexend_700Bold,
  });

  useEffect(() => {
    registerBackgroundTasks();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or a fatal error was encountered)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
