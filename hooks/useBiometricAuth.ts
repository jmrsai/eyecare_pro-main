
import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsSupported(compatible);
    })();
  }, []);

  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to view clinical results',
      fallbackLabel: 'Enter Passcode', // iOS only
    });

    setIsAuthenticated(result.success);
    return result.success;
  };

  return { isSupported, isAuthenticated, authenticate };
};
