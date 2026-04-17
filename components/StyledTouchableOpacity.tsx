
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface StyledTouchableOpacityProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export const StyledTouchableOpacity: React.FC<StyledTouchableOpacityProps> = ({ children, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }, style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
