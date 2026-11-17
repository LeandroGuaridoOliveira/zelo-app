import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/theme/colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  message = 'Ocorreu um erro ao carregar os dados.',
  onRetry,
  retryText = 'Tentar novamente',
}: ErrorStateProps) {
  return (
    <View
      style={styles.card}
      accessibilityRole="alert"
      accessibilityLabel={`Aviso de erro: ${message}`}
    >
      <Text style={styles.title}>Não foi possível carregar</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryText}
        >
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 24,
    marginVertical: Spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.danger,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.danger,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
});
