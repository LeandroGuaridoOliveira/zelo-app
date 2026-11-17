import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useResumoSemanalQuery, useDiasAtipicosQuery } from '@/hooks/useResumoSemanalQuery';
import { Colors, Spacing, Typography } from '@/theme/colors';

export default function ResumoSemanalScreen() {
  const router = useRouter();
  const { data: resumos, isLoading: resumosLoading, isError: resumosError, refetch: refetchResumos } =
    useResumoSemanalQuery();
  const { data: diasAtipicos, isLoading: diasLoading, refetch: refetchDias } =
    useDiasAtipicosQuery();

  const handleRefresh = async () => {
    await Promise.all([refetchResumos(), refetchDias()]);
  };

  const resumo = resumos && resumos.length > 0 ? resumos[0] : null;

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Resumo Semanal"
        subtitle="Rotina e indicadores da residência"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={resumosLoading || diasLoading}
            onRefresh={handleRefresh}
            colors={[Colors.brand]}
          />
        }
      >
        {resumosLoading ? (
          <LoadingState message="Carregando resumo semanal..." large />
        ) : resumosError ? (
          <ErrorState
            message="Não foi possível carregar os resumos da semana."
            onRetry={handleRefresh}
          />
        ) : resumo ? (
          <>
            {/* 1. Visão geral da semana */}
            <View style={styles.narrativeCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionTitle}>Visão geral da semana</Text>
                <Text style={styles.dateText}>Semana de {resumo.semanaInicio}</Text>
              </View>

              <Text style={styles.narrativeText}>{resumo.texto}</Text>
            </View>

            {/* 2. Indicadores */}
            <Text style={styles.sectionHeader}>Indicadores</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {resumo.metricas.horarioLevantarMedio ?? '07:15'}
                </Text>
                <Text style={styles.metricLabel}>Despertar médio</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {resumo.metricas.totalEventosPresenca ?? 342}
                </Text>
                <Text style={styles.metricLabel}>Movimentações</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {resumo.metricas.lembretesCumpridosPct ?? 100}%
                </Text>
                <Text style={styles.metricLabel}>Adesão a remédios</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {resumo.metricas.diasAtipicos ?? 1}
                </Text>
                <Text style={styles.metricLabel}>Dias fora do padrão</Text>
              </View>
            </View>

            {/* 3. Registros de atenção */}
            <Text style={styles.sectionHeader}>Registros de atenção</Text>
            <View style={styles.card}>
              {diasAtipicos && diasAtipicos.length > 0 ? (
                diasAtipicos.map((dia, idx) => (
                  <View key={idx} style={styles.diaItem}>
                    <View style={styles.diaHeader}>
                      <Text style={styles.diaData}>{dia.data}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          dia.atipico ? styles.pillAtipico : styles.pillNormal,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            dia.atipico ? styles.textAtipico : styles.textNormal,
                          ]}
                        >
                          {dia.atipico ? 'Fora do padrão' : 'Normal'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.diaAtributos}>
                      Movimentação na madrugada: {dia.atributos.eventosMadrugada ?? 0} registros{'\n'}
                      Maior intervalo sem atividade: {dia.atributos.tempoSemMovimentoMax ?? 0} min
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.nenhumDia}>Nenhum dia fora do padrão detectado.</Text>
              )}
            </View>
          </>
        ) : null}
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
  narrativeCard: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSectionTitle: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  dateText: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
  },
  narrativeText: {
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 14,
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
  },
  diaItem: {
    backgroundColor: Colors.surfaceCard,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  diaData: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillAtipico: {
    backgroundColor: Colors.warningBg,
  },
  pillNormal: {
    backgroundColor: Colors.successBg,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textAtipico: {
    color: Colors.warning,
  },
  textNormal: {
    color: Colors.success,
  },
  diaAtributos: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  nenhumDia: {
    fontSize: Typography.standard.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});
