import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/theme/colors';

interface HeaderZeloProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSobre?: boolean;
  onBack?: () => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export function HeaderZelo({
  title,
  subtitle,
  showBack = false,
  showSobre = true,
  onBack,
  userName,
  userRole,
  onLogout,
}: HeaderZeloProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSobre = () => {
    router.push('/sobre');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela anterior"
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>ZELO</Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          {userName && (
            <View style={styles.userBadge}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
            </View>
          )}

          {showSobre && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSobre}
              accessibilityRole="button"
              accessibilityLabel="Ir para tela sobre o aplicativo"
            >
              <Text style={styles.actionButtonText}>Sobre</Text>
            </TouchableOpacity>
          )}

          {onLogout && (
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={onLogout}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta e encerrar sessão"
            >
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  brandBadge: {
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandBadgeText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.xs,
    letterSpacing: 1.5,
  },
  backButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
  },
  backButtonText: {
    color: Colors.textLight,
    fontSize: Typography.standard.sm,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    maxWidth: 160,
  },
  userName: {
    color: Colors.textLight,
    fontSize: Typography.standard.xs,
    fontWeight: '600',
  },
  userRole: {
    color: Colors.brandLight,
    fontSize: Typography.standard.xs,
  },
  actionButton: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.textLight,
    fontSize: Typography.standard.xs,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.danger,
  },
  logoutButtonText: {
    color: Colors.textLight,
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
  },
  titleSection: {
    marginTop: Spacing.xs,
  },
  title: {
    fontSize: Typography.standard.xl,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  subtitle: {
    fontSize: Typography.standard.sm,
    color: Colors.border,
    marginTop: 2,
  },
});
