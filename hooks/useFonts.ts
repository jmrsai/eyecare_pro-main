
import { useFonts as useExpoFonts } from 'expo-font';

export const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  return fontsLoaded;
};
