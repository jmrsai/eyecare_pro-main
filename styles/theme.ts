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
  success: '#10B981',
  error: '#EF4444',
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

export const COLORS = {
  ...colors,
  surface: colors.card,
  success: colors.accent,
  alert: colors.notification,
  textSecondary: colors.subtext,
};

export const SIZES = {
  base: spacing.xs,
  padding: spacing.md,
  radius: layout.borderRadius.md,
};

export const FONTS = {
  body: typography.body,
  caption: typography.caption,
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const TOUCH_TARGET = {
  minWidth: 44,
  minHeight: 44,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

export type Theme = typeof lightTheme;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Layout = typeof layout;

const fullTheme = {
  ...theme,
  COLORS,
  SIZES,
  FONTS,
  SHADOWS,
  TOUCH_TARGET,
};

export default fullTheme;

