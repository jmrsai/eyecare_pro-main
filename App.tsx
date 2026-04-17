
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Appearance, StyleSheet } from 'react-native';
import { Home, AmslerGrid, PupilResponseTest } from './app/features';
import appTheme from './styles/theme'; // Corrected import path

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = Appearance.getColorScheme() || 'light';
  const { COLORS, FONTS } = appTheme;

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorScheme === 'dark' ? '#121212' : COLORS.background,
    },
    tabBar: {
        backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : COLORS.surface,
        borderTopColor: colorScheme === 'dark' ? '#2f2f2f' : '#e0e0e0',
    },
    tabLabel: {
        ...FONTS.body,
        fontSize: 12, // Smaller font for tab labels
        color: colorScheme === 'dark' ? COLORS.surface : COLORS.text,
    },
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <NavigationContainer>
          <Tab.Navigator 
            screenOptions={{
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
            }}
          >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Amsler Grid" component={AmslerGrid} />
            <Tab.Screen name="Pupil Test" component={PupilResponseTest} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
