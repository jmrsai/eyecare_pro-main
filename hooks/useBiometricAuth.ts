import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const authenticate = async () => {
    try {
      const hasBiometrics = await LocalAuthentication.isEnrolledAsync();
      if (!hasBiometrics) {
        return true; // Fallback if no biometrics enrolled
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access EyeCare Pro',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric error:', error);
      return false;
    }
  };

  return {
    isBiometricSupported,
    isAuthenticated,
    authenticate
  };
};
