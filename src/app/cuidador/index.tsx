import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useCasaStatusQuery } from '@/hooks/useCasaStatusQuery';
import { useAlertasQuery } from '@/hooks/useAlertasQuery';
import { Colors, Spacing, Typography } from '@/theme/colors';

function formatHora(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return isNaN(d.getTime())
    ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CuidadorHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    data: casaStatus,
    isLoading: statusLoading,
    isError: statusError,
    refetch: refetchStatus,
  } = useCasaStatusQuery();

  const {
    data: alertas,
    isLoading: alertasLoading,
    refetch: refetchAlertas,
  } = useAlertasQuery();

  const handleRefresh = async () => {
    await Promise.all([refetchStatus(), refetchAlertas()]);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const alertaAtivo = alertas?.find(
    (a) => a.estado === 'DISPARADO' || a.estado === 'AGUARDANDO_IDOSO' || a.estado === 'ESCALADO'
  );

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Painel"
        subtitle="Acompanhamento da residência"
        userName={user?.nome ?? 'Cuidador'}
        onLogout={handleLogout}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={statusLoading || alertasLoading}
            onRefresh={handleRefresh}
            colors={[Colors.brand]}
          />
        }
      >
        {/* Status da Casa Monitorada */}
        {statusLoading && !casaStatus ? (
          <LoadingState message="Obtendo status da residência..." />
        ) : statusError ? (
          <ErrorState
            message="Não foi possível consultar os sensores da casa."
            onRetry={handleRefresh}
          />
        ) : casaStatus ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardSubTitle}>RESIDÊNCIA</Text>
                <Text style={styles.cardTitle}>{casaStatus.nomeIdoso}</Text>
              </View>
              <StatusBadge estado={casaStatus.estado} />
            </View>

            <Text style={styles.statusDescription}>{casaStatus.mensagemStatus}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Última atividade registrada às{' '}
                <Text style={styles.metaHighlight}>
                  {formatHora(casaStatus.ultimoEventoEm)}
                </Text>
              </Text>
            </View>
          </View>
        ) : null}

        {/* Banner de Alerta Ativo */}
        {alertaAtivo && (
          <View style={styles.alertaCard} accessibilityRole="alert">
            <View style={styles.alertaHeader}>
              <View style={styles.alertaHeaderTextContainer}>
                <Text style={styles.alertaTitle}>Alerta em aberto</Text>
                <Text style={styles.alertaGrau}>Prioridade: {alertaAtivo.grau}</Text>
              </View>
            </View>

            <Text style={styles.alertaMensagem}>{alertaAtivo.mensagem}</Text>

            <TouchableOpacity
              style={styles.alertaButton}
              onPress={() => router.push(`/cuidador/alerta/${alertaAtivo.id}`)}
              accessibilityRole="button"
              accessibilityLabel="Verificar alerta"
            >
              <Text style={styles.alertaButtonText}>Verificar alerta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gerenciamento */}
        <Text style={styles.sectionHeader}>Gerenciamento</Text>

        {/* Card Lembretes de Medicamentos */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/cuidador/lembretes')}
          accessibilityRole="button"
          accessibilityLabel="Lembretes de remédios"
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Lembretes de remédios</Text>
            <Text style={styles.actionDescription}>
              Horários e medicamentos da rotina
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Card Rede de Apoio */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/cuidador/rede-apoio')}
          accessibilityRole="button"
          accessibilityLabel="Rede de apoio"
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Rede de apoio</Text>
            <Text style={styles.actionDescription}>
              Contatos acionados em caso de alerta
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Card Resumo Semanal */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/cuidador/resumo')}
          accessibilityRole="button"
          accessibilityLabel="Resumo semanal"
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Resumo semanal</Text>
            <Text style={styles.actionDescription}>
              Histórico de rotina e registros da semana
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 18,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardSubTitle: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: Typography.standard.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
  statusDescription: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginVertical: Spacing.xs,
  },
  metaRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
  },
  metaHighlight: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  alertaCard: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 22,
    marginBottom: 20,
  },
  alertaHeader: {
    marginBottom: 8,
  },
  alertaHeaderTextContainer: {
    flex: 1,
  },
  alertaTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.danger,
  },
  alertaGrau: {
    fontSize: Typography.standard.xs,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 2,
  },
  alertaMensagem: {
    fontSize: Typography.standard.sm,
    color: Colors.textPrimary,
    marginVertical: 8,
    lineHeight: 20,
  },
  alertaButton: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  alertaButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 14,
    marginTop: 6,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
});
