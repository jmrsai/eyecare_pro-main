
// hooks/useScreenBrightness.ts
import { useState, useEffect } from 'react';
import * as Brightness from 'expo-brightness';

/**
 * A custom hook to control the screen brightness during diagnostic tests.
 * @returns An object with functions to set brightness and restore system brightness.
 */
export const useScreenBrightness = () => {
  const [systemBrightness, setSystemBrightness] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        const brightness = await Brightness.getSystemBrightnessAsync();
        setSystemBrightness(brightness);
      }
    })();
  }, []);

  const setBrightness = async (brightness: number) => {
    const { status } = await Brightness.requestPermissionsAsync();
    if (status === 'granted') {
      await Brightness.setBrightnessAsync(brightness);
    }
  };

  const restoreSystemBrightness = async () => {
    if (systemBrightness !== null) {
      await Brightness.setSystemBrightnessAsync(systemBrightness);
    }
  };

  return { setBrightness, restoreSystemBrightness };
};
