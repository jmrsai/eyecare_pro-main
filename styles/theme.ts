import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Premium Palette based on new logo
export const colors = {
  primary: '#1CB6D0', // Vibrant light blue
  secondary: '#0A2E6B', // Deep medical blue
  accent: '#10B981', // Healing green
  background: '#F8FAFC', // Slate background
  card: '#FFFFFF',
  text: '#0F172A', // Slate 900
  subtext: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  notification: '#EF4444', // Rose 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6', // Blue 500
};

export const lightTheme = {
  colors: {
    ...colors,
  },
};

export const darkTheme = {
  colors: {
    ...colors,
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    subtext: '#94A3B8',
    border: '#334155',
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  h3: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    color: '#64748B',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
  },
};

const theme = {
  lightTheme,
  darkTheme,
  typography,
  spacing,
  layout,
};

export default theme;
