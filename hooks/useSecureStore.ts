
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const useSecureStore = (key: string) => {
  const [value, setValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await SecureStore.getItemAsync(key);
        setValue(storedValue);
      } catch (e) {
        console.error(`Failed to load value for key '${key}' from secure store`, e);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const saveValue = async (newValue: string) => {
    try {
      await SecureStore.setItemAsync(key, newValue);
      setValue(newValue);
    } catch (e) {
      console.error(`Failed to save value for key '${key}' to secure store`, e);
    }
  };

  const deleteValue = async () => {
    try {
      await SecureStore.deleteItemAsync(key);
      setValue(null);
    } catch (e) {
      console.error(`Failed to delete value for key '${key}' from secure store`, e);
    }
  };

  return { value, saveValue, deleteValue, isLoading };
};
