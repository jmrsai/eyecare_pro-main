
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const lightTheme = {
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    subtext: '#6D6D72',
    border: '#C6C6C8',
    notification: '#FF3B30',
    warning: '#FFCC00',
    info: '#007AFF',
  },
};

export const darkTheme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    subtext: '#8E8E93',
    border: '#38383A',
    notification: '#FF453A',
    warning: '#FFD60A',
    info: '#0A84FF',
  },
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as 'normal',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as 'normal',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
};

export const layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
};

export type Theme = typeof lightTheme;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Layout = typeof layout;

const theme = {
  lightTheme,
  darkTheme,
  typography,
  spacing,
  layout
};

export default theme;
