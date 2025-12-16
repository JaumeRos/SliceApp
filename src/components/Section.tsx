import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { H3, P2 } from './Text';
import { spacing } from '../theme';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  spacing?: 'small' | 'medium' | 'large';
}

export const Section: React.FC<SectionProps> = ({ 
  title, 
  subtitle,
  children, 
  style,
  spacing: spacingSize = 'large',
}) => {
  const spacingValue = {
    small: spacing.md,
    medium: spacing.lg,
    large: spacing.xl,
  }[spacingSize];

  return (
    <View style={[styles.section, { marginBottom: spacingValue }, style]}>
      {title && <H3 style={styles.title}>{title}</H3>}
      {subtitle && <P2 style={styles.subtitle}>{subtitle}</P2>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    // marginBottom is set dynamically
  },
  title: {
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginBottom: spacing.md,
  },
});
