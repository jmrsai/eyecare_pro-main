import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundContextType {
  playSound: (soundName: 'success' | 'click' | 'levelUp' | 'gameOver') => Promise<void>;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType>({
  playSound: async () => {},
  isSoundEnabled: true,
  toggleSound: () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [sounds, setSounds] = useState<Record<string, Audio.Sound>>({});

  useEffect(() => {
    loadSettings();
    // Preload sounds here if you have actual files
    // In a real app, you would load files:
    // const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/click.mp3'));
    
    return () => {
      // Unload sounds
      Object.values(sounds).forEach(sound => sound.unloadAsync());
    };
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.soundEffects !== undefined) {
          setIsSoundEnabled(parsed.soundEffects);
        }
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  };

  const toggleSound = async () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    // Update AsyncStorage settings
    try {
      const stored = await AsyncStorage.getItem('settings');
      const parsed = stored ? JSON.parse(stored) : {};
      await AsyncStorage.setItem('settings', JSON.stringify({ ...parsed, soundEffects: newValue }));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  };

  const playSound = async (soundName: 'success' | 'click' | 'levelUp' | 'gameOver') => {
    if (!isSoundEnabled) return;

    try {
      // Placeholder for sound playing logic
      // Since we don't have actual files, we can simulate or just log
      console.log(`Playing sound: ${soundName}`);
      
      // Example of how it would look with files:
      // if (sounds[soundName]) {
      //   await sounds[soundName].replayAsync();
      // }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  return (
    <SoundContext.Provider value={{ playSound, isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
