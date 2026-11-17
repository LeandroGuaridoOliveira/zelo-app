import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useRedeApoioQuery } from '@/hooks/useRedeApoioQuery';
import { useCreateContatoMutation } from '@/hooks/useCreateContatoMutation';
import { CanalNotificacao, FIXED_IDOSO_ID } from '@/types/zelo';
import { Colors, Spacing, Typography } from '@/theme/colors';

const CANAIS: CanalNotificacao[] = ['WHATSAPP', 'LIGACAO', 'SMS'];

const getCanalLabel = (canal: CanalNotificacao): string => {
  switch (canal) {
    case 'WHATSAPP':
      return 'WhatsApp';
    case 'LIGACAO':
      return 'Ligação';
    case 'SMS':
      return 'SMS';
    default:
      return canal;
  }
};

export default function RedeApoioScreen() {
  const router = useRouter();
  const { data: contatos, isLoading, isError, refetch } = useRedeApoioQuery();
  const createMutation = useCreateContatoMutation();

  const [mostraForm, setMostraForm] = useState(false);
  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [canal, setCanal] = useState<CanalNotificacao>('WHATSAPP');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCadastrar = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!nome.trim() || !parentesco.trim() || !telefone.trim()) {
      setErrorMessage('Preencha todos os campos do novo contato.');
      return;
    }

    try {
      const prioridadeProxima = (contatos?.length || 0) + 1;
      await createMutation.mutateAsync({
        idosoId: FIXED_IDOSO_ID,
        nome: nome.trim(),
        parentesco: parentesco.trim(),
        telefone: telefone.trim(),
        ordemPrioridade: prioridadeProxima,
        notificarPor: canal,
      });

      setNome('');
      setParentesco('');
      setTelefone('');
      setMostraForm(false);
      setSuccessMessage('Novo contato adicionado à rede de apoio.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao adicionar contato.');
    }
  };

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Rede de Apoio"
        subtitle="Contatos de emergência"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.brand]}
          />
        }
      >
        {successMessage && (
          <View style={styles.successBox} accessibilityRole="alert">
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Ordem de Notificação em Emergências</Text>
          <Text style={styles.introText}>
            Quando um alerta não é respondido pela Dona Maria, o Zelo aciona automaticamente os membros abaixo seguindo a prioridade definida:
          </Text>
        </View>

        {isLoading ? (
          <LoadingState message="Carregando contatos da rede de apoio..." large />
        ) : isError ? (
          <ErrorState
            message="Erro ao carregar a rede de apoio."
            onRetry={refetch}
          />
        ) : contatos && contatos.length > 0 ? (
          contatos.map((contato) => (
            <View key={contato.id} style={styles.contatoCard}>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{contato.ordemPrioridade}º</Text>
              </View>

              <View style={styles.contatoInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.contatoNome}>{contato.nome}</Text>
                  <View style={styles.channelBadge}>
                    <Text style={styles.channelText}>
                      {getCanalLabel(contato.notificarPor)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.parentescoText}>Vínculo: {contato.parentesco}</Text>
                <Text style={styles.telefoneText}>Telefone: {contato.telefone}</Text>
              </View>
            </View>
          ))
        ) : null}

        {/* Botão / Formulário para Adicionar Contato */}
        {!mostraForm ? (
          <TouchableOpacity
            style={styles.openFormButton}
            onPress={() => setMostraForm(true)}
            accessibilityRole="button"
            accessibilityLabel="Adicionar novo contato de apoio"
          >
            <Text style={styles.openFormButtonText}>+ Adicionar Novo Contato de Apoio</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Cadastrar Novo Contato</Text>

            {errorMessage && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Dr. Carlos (Médico da família)"
                placeholderTextColor={Colors.textMuted}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parentesco / Vínculo *</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Médico, Vizinho do 32, Sobrinho"
                placeholderTextColor={Colors.textMuted}
                value={parentesco}
                onChangeText={setParentesco}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 98888-7777"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Canal de Notificação Preferencial</Text>
              <View style={styles.channelRow}>
                {CANAIS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.channelOption, canal === c && styles.channelOptionActive]}
                    onPress={() => setCanal(c)}
                  >
                    <Text
                      style={[
                        styles.channelOptionText,
                        canal === c && styles.channelOptionTextActive,
                      ]}
                    >
                      {getCanalLabel(c)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMostraForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, createMutation.isPending && styles.buttonDisabled]}
                onPress={handleCadastrar}
                disabled={createMutation.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Contato'}
                </Text>
              </TouchableOpacity>
            </View>
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
  successBox: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.standard.sm,
    fontWeight: '600',
  },
  introCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  introText: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  contatoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  priorityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  priorityText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
  contatoInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contatoNome: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  channelBadge: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  channelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  parentescoText: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  telefoneText: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  openFormButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.brand,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  openFormButtonText: {
    color: Colors.brandDark,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  formTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.standard.sm,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.standard.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  channelRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  channelOption: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  channelOptionActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.successBg,
  },
  channelOptionText: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  channelOptionTextActive: {
    color: Colors.brandDark,
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
  submitButton: {
    flex: 2,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.brand,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
});
