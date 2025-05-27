import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlightStatus } from '../types';
import { colors, fontSizes, spacing, borderRadius } from '../utils/theme';

interface StatusBadgeProps {
  status: FlightStatus;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  return (
    <View style={[styles.badge, getStatusStyle(status), getSizeStyle(size)]}>
      <Text style={[styles.text, getTextSizeStyle(size)]}>{status}</Text>
    </View>
  );
};

// Helper function to get status style
const getStatusStyle = (status: FlightStatus) => {
  switch (status) {
    case FlightStatus.ACTIVE:
      return styles.active;
    case FlightStatus.LANDED:
      return styles.landed;
    case FlightStatus.DELAYED:
      return styles.delayed;
    case FlightStatus.CANCELLED:
      return styles.cancelled;
    case FlightStatus.DIVERTED:
      return styles.diverted;
    default:
      return styles.scheduled;
  }
};

// Helper function to get size style
const getSizeStyle = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return styles.badgeSmall;
    case 'large':
      return styles.badgeLarge;
    default:
      return styles.badgeMedium;
  }
};

// Helper function to get text size style
const getTextSizeStyle = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return styles.textSmall;
    case 'large':
      return styles.textLarge;
    default:
      return styles.textMedium;
  }
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: colors.surface,
  },
  // Status styles
  active: {
    backgroundColor: colors.success,
  },
  landed: {
    backgroundColor: colors.info,
  },
  delayed: {
    backgroundColor: colors.warning,
  },
  cancelled: {
    backgroundColor: colors.error,
  },
  diverted: {
    backgroundColor: colors.error,
  },
  scheduled: {
    backgroundColor: colors.accent,
  },
  // Size styles
  badgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Text size styles
  textSmall: {
    fontSize: fontSizes.xs,
  },
  textMedium: {
    fontSize: fontSizes.sm,
  },
  textLarge: {
    fontSize: fontSizes.md,
  },
});

export default StatusBadge;