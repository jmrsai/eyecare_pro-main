
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '../../context/AuthContext'; 
import BiometricAuthScreen from './features/BiometricAuthScreen';

// Import your feature components
import AmslerGrid from './features/AmslerGrid';
import ContrastSensitivity from './features/ContrastSensitivity';
import ResultsDashboard from './features/ResultsDashboard';
import SaccadicTraining from './exercises/SaccadicTraining';
import UserProfile from './features/UserProfile';
import DeviceCalibration from './features/DeviceCalibration';
import CalibrationScreen from './features/CalibrationScreen';
import PupilResponseTest from './features/PupilResponseTest'; // Import the new component

const Tab = createBottomTabNavigator();

const ProtectedDashboard = () => {
  const { isAuthenticated, login } = useAuth();
  
  if (!isAuthenticated) {
    return <BiometricAuthScreen onAuthenticated={login} />;
  }
  
  return <ResultsDashboard />;
};

const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Amsler Grid" component={AmslerGrid} />
      <Tab.Screen name="Contrast" component={ContrastSensitivity} />
      <Tab.Screen name="Saccadic" component={SaccadicTraining} />
      <Tab.Screen name="Dashboard" component={ProtectedDashboard} />
      <Tab.Screen name="Profile" component={UserProfile} />
      <Tab.Screen name="Device Calibration" component={DeviceCalibration} />
      <Tab.Screen name="Calibrate" component={CalibrationScreen} />
      <Tab.Screen name="Pupil Test" component={PupilResponseTest} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer independent={true}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
