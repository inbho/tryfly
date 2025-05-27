import { DefaultTheme } from 'react-native-paper';

// Color palette
export const colors = {
  // Primary colors
  primary: '#0A3D62', // Navy blue
  primaryLight: '#3C6382',
  primaryDark: '#051E31',
  
  // Accent colors
  accent: '#3498DB', // Soft blue
  accentLight: '#85C1E9',
  accentDark: '#1A5276',
  
  // Background colors
  background: '#F5F7FA',
  surface: '#FFFFFF',
  
  // Text colors
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  
  // Status colors
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Other
  border: '#E0E0E0',
  disabled: '#D3D3D3',
  placeholder: '#95A5A6',
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  header: 32,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Create a theme for React Native Paper
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.accent,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
};