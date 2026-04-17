
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PPI_KEY = 'app_ppi';

export const useCalibration = () => {
  const [ppi, setPpi] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPpi = async () => {
      try {
        const storedPpi = await AsyncStorage.getItem(PPI_KEY);
        if (storedPpi !== null) {
          setPpi(parseFloat(storedPpi));
        }
      } catch (e) {
        console.error("Failed to load PPI from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPpi();
  }, []);

  const savePpi = async (newPpi: number) => {
    try {
      await AsyncStorage.setItem(PPI_KEY, newPpi.toString());
      setPpi(newPpi);
    } catch (e) {
      console.error("Failed to save PPI to storage", e);
    }
  };

  return { ppi, savePpi, isLoading };
};
