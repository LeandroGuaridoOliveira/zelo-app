import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useAlertaDetalheQuery } from '@/hooks/useAlertaDetalheQuery';
import { useConfirmarAlertaMutation } from '@/hooks/useConfirmarAlertaMutation';
import { useDesfechoAlertaMutation } from '@/hooks/useDesfechoAlertaMutation';
import { useAuth } from '@/providers/AuthProvider';
import { DesfechoAlerta } from '@/types/zelo';
import { Colors, Spacing, Typography, TouchTarget } from '@/theme/colors';

const DESFECHO_OPCOES: { label: string; valor: DesfechoAlerta; desc: string }[] = [
  {
    label: 'Falso Alarme',
    valor: 'FALSO_ALARME',
    desc: 'Idoso estava dormindo ou fora de alcance dos sensores temporariamente.',
  },
  {
    label: 'Resolvido por Contato',
    valor: 'RESOLVIDO_CONTATO',
    desc: 'Conversamos por telefone e confirmamos que está tudo bem.',
  },
  {
    label: 'Visita Presencial Realizada',
    valor: 'VISITA_FEITA',
    desc: 'Familiar ou vizinho compareceu à residência e prestou apoio.',
  },
  {
    label: 'Socorro Médico Acionado',
    valor: 'SOCORRO_ACIONADO',
    desc: 'Equipe de resgate / SAMU foi mobilizada para atendimento urgente.',
  },
];

function formatDataHora(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function formatHora(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AlertaDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const { data: alerta, isLoading, isError, refetch } = useAlertaDetalheQuery(id || '');
  const confirmarMutation = useConfirmarAlertaMutation();
  const desfechoMutation = useDesfechoAlertaMutation();

  const [desfechoSelecionado, setDesfechoSelecionado] = useState<DesfechoAlerta>('FALSO_ALARME');
  const [observacao, setObservacao] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirmar = async () => {
    if (!alerta || !user) return;
    setErrorMessage(null);
    try {
      await confirmarMutation.mutateAsync({
        alertaId: alerta.id,
        cuidadorId: user.id,
        nomeCuidador: user.nome,
      });
      setFeedbackMessage('Atendimento assumido! Registre o desfecho abaixo após verificar.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao confirmar alerta.');
    }
  };

  const handleRegistrarDesfecho = async () => {
    if (!alerta) return;
    setErrorMessage(null);
    try {
      await desfechoMutation.mutateAsync({
        alertaId: alerta.id,
        desfecho: desfechoSelecionado,
        observacao: observacao.trim() || undefined,
      });
      setFeedbackMessage('Atendimento concluído com sucesso!');
      setTimeout(() => router.replace('/cuidador'), 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar desfecho.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderZelo title="Detalhes do Alerta" showBack onBack={() => router.back()} />
        <LoadingState message="Buscando informações do alerta..." large />
      </View>
    );
  }

  if (isError || !alerta) {
    return (
      <View style={styles.container}>
        <HeaderZelo title="Detalhes do Alerta" showBack onBack={() => router.back()} />
        <ErrorState message="Alerta não localizado ou indisponível." onRetry={refetch} />
      </View>
    );
  }

  const podeConfirmar =
    alerta.estado === 'DISPARADO' ||
    alerta.estado === 'AGUARDANDO_IDOSO' ||
    alerta.estado === 'ESCALADO';

  const podeRegistrarDesfecho = alerta.estado === 'CONFIRMADO';
  const encerrado = alerta.estado === 'ENCERRADO';

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Detalhes do Alerta"
        subtitle="Acompanhamento de ocorrência"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {feedbackMessage && (
          <View style={styles.feedbackBox} accessibilityRole="alert">
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Cartão de Informações Principais */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.badgeGroup}>
              <View
                style={[
                  styles.grauBadge,
                  alerta.grau === 'CRITICO' || alerta.grau === 'ALTO'
                    ? styles.grauAlto
                    : styles.grauMedio,
                ]}
              >
                <Text style={styles.grauText}>GRAVIDADE {alerta.grau}</Text>
              </View>
            </View>
            <StatusBadge
              estado={
                alerta.estado === 'ENCERRADO'
                  ? 'NORMAL'
                  : alerta.grau === 'CRITICO'
                  ? 'EMERGENCIA'
                  : 'ALERTA'
              }
              size="small"
            />
          </View>

          <Text style={styles.mensagem}>{alerta.mensagem}</Text>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Origem:</Text>
              <Text style={styles.metaValue}>{alerta.origem}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Disparado em:</Text>
              <Text style={styles.metaValue}>
                {formatDataHora(alerta.disparadoEm)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estado Atual:</Text>
              <Text style={styles.metaValueHighlight}>{alerta.estado}</Text>
            </View>

            {alerta.confirmadoPor && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Confirmado por:</Text>
                <Text style={styles.metaValue}>
                  {alerta.confirmadoPor}
                  {alerta.confirmadoEm ? ` às ${formatHora(alerta.confirmadoEm)}` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Assumir verificação */}
        {podeConfirmar && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Assumir verificação</Text>
            <Text style={styles.sectionSubtitle}>
              Ao confirmar, você avisa à família e aos vizinhos que está assumindo a verificação da Dona Maria.
            </Text>

            <TouchableOpacity
              style={[styles.confirmButton, confirmarMutation.isPending && styles.buttonDisabled]}
              onPress={handleConfirmar}
              disabled={confirmarMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Vou verificar agora"
            >
              <Text style={styles.confirmButtonText}>
                {confirmarMutation.isPending ? 'Confirmando...' : 'Vou verificar agora'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Registrar desfecho */}
        {podeRegistrarDesfecho && (
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Registrar desfecho</Text>
            <Text style={styles.sectionSubtitle}>
              Selecione o resultado da verificação para arquivar o evento e restaurar o status da residência:
            </Text>

            {DESFECHO_OPCOES.map((item) => (
              <TouchableOpacity
                key={item.valor}
                style={[
                  styles.desfechoOption,
                  desfechoSelecionado === item.valor && styles.desfechoOptionActive,
                ]}
                onPress={() => setDesfechoSelecionado(item.valor)}
                accessibilityRole="button"
                accessibilityLabel={`Opção de desfecho: ${item.label}`}
              >
                <View style={styles.radioOuter}>
                  {desfechoSelecionado === item.valor && <View style={styles.radioInner} />}
                </View>
                <View style={styles.desfechoTextContainer}>
                  <Text style={styles.desfechoLabel}>{item.label}</Text>
                  <Text style={styles.desfechoDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.inputLabel}>Observações adicionais (opcional):</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Descreva detalhes do contato com a Dona Maria..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={observacao}
              onChangeText={setObservacao}
            />

            <TouchableOpacity
              style={[styles.encerrarButton, desfechoMutation.isPending && styles.buttonDisabled]}
              onPress={handleRegistrarDesfecho}
              disabled={desfechoMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Concluir atendimento"
            >
              <Text style={styles.encerrarButtonText}>
                {desfechoMutation.isPending ? 'Salvando...' : 'Concluir atendimento'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Alerta já encerrado */}
        {encerrado && (
          <View style={styles.encerradoCard}>
            <Text style={styles.encerradoTitle}>Alerta finalizado</Text>
            <Text style={styles.encerradoText}>
              <Text style={styles.bold}>Desfecho:</Text> {alerta.desfecho || 'Concluído'}
            </Text>
            {alerta.observacao && (
              <Text style={styles.encerradoText}>
                <Text style={styles.bold}>Observação:</Text> {alerta.observacao}
              </Text>
            )}
          </View>
        )}
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
  feedbackBox: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackText: {
    color: Colors.success,
    fontSize: Typography.standard.sm,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.standard.sm,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeGroup: {
    flexDirection: 'row',
  },
  grauBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  grauAlto: {
    backgroundColor: Colors.dangerBg,
  },
  grauMedio: {
    backgroundColor: Colors.warningBg,
  },
  grauText: {
    fontWeight: 'bold',
    fontSize: Typography.standard.xs,
    color: Colors.danger,
  },
  mensagem: {
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: '600',
    marginVertical: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  metaGrid: {
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaValueHighlight: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.brandDark,
  },
  actionSection: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: Colors.brand,
    minHeight: TouchTarget.minTouchTarget,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  desfechoOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  desfechoOptionActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.successBg,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand,
  },
  desfechoTextContainer: {
    flex: 1,
  },
  desfechoLabel: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  desfechoDesc: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.standard.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  encerrarButton: {
    backgroundColor: Colors.success,
    minHeight: TouchTarget.minTouchTarget,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encerrarButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  encerradoCard: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 22,
  },
  encerradoTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  encerradoText: {
    fontSize: Typography.standard.sm,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});
