import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EstadoCasa } from '@/types/zelo';
import { Colors, Spacing, Typography } from '@/theme/colors';

interface StatusBadgeProps {
  estado: EstadoCasa;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ estado, size = 'medium' }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (estado) {
      case 'NORMAL':
        return {
          label: 'Normal',
          symbol: '●',
          bg: Colors.successBg,
          text: Colors.success,
          border: Colors.successBorder,
        };
      case 'ATENCAO':
        return {
          label: 'Atenção',
          symbol: '●',
          bg: Colors.warningBg,
          text: Colors.warning,
          border: Colors.warningBorder,
        };
      case 'ALERTA':
        return {
          label: 'Alerta',
          symbol: '●',
          bg: Colors.dangerBg,
          text: Colors.danger,
          border: Colors.dangerBorder,
        };
      case 'EMERGENCIA':
        return {
          label: 'Emergência',
          symbol: '●',
          bg: Colors.dangerBg,
          text: Colors.danger,
          border: Colors.danger,
        };
      default:
        return {
          label: 'Indefinido',
          symbol: '●',
          bg: Colors.surfaceCard,
          text: Colors.textMuted,
          border: Colors.border,
        };
    }
  };

  const config = getBadgeConfig();

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 2 : isLarge ? Spacing.sm : Spacing.xs,
          paddingHorizontal: isSmall ? Spacing.xs : isLarge ? Spacing.md : Spacing.sm,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status da casa: ${config.label}`}
    >
      <Text
        style={[
          styles.symbol,
          {
            color: config.text,
            fontSize: isSmall ? 10 : isLarge ? Typography.standard.lg : Typography.standard.sm,
          },
        ]}
      >
        {config.symbol}{' '}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: config.text,
            fontSize: isSmall ? Typography.standard.xs : isLarge ? Typography.standard.md : Typography.standard.sm,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  symbol: {
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '700',
  },
});
