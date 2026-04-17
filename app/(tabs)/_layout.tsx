import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, User, Settings, Gamepad2, CheckSquare } from 'lucide-react-native';
import BiometricAuthScreen from '../features/BiometricAuthScreen';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const [unlocked, setUnlocked] = useState(false);
  const { theme } = useTheme();

  if (!unlocked) {
    return <BiometricAuthScreen onAuthenticated={() => setUnlocked(true)} />;
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.subtext,
      tabBarStyle: {
        backgroundColor: theme.colors.card,
        borderTopColor: theme.colors.border,
      },
      headerStyle: {
        backgroundColor: theme.colors.card,
      },
      headerTintColor: theme.colors.text,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="checkup"
        options={{
          title: 'Check-up',
          tabBarIcon: ({ color }) => <CheckSquare color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="kids"
        options={{
          title: 'Kids Zone',
          tabBarIcon: ({ color }) => <Gamepad2 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          href: null, // Hidden tab but still accessible via router
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
