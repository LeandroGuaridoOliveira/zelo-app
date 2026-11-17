import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/theme/colors';

interface LoadingStateProps {
  message?: string;
  large?: boolean;
}

export function LoadingState({
  message = 'Carregando informações...',
  large = false,
}: LoadingStateProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator
        size={large ? 'large' : 'small'}
        color={Colors.brand}
      />
      <Text style={[styles.text, large && styles.textLarge]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: Spacing.sm,
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  textLarge: {
    fontSize: Typography.elderlyAccessible.sm,
    marginTop: Spacing.md,
  },
});
