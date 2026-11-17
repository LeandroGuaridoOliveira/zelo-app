import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { useCheckinMutation } from '@/hooks/useCheckinMutation';
import { useAlertasQuery } from '@/hooks/useAlertasQuery';
import { CheckinResponse } from '@/types/zelo';
import { Colors, Spacing, Typography } from '@/theme/colors';

export default function CheckinConversacionalScreen() {
  const router = useRouter();
  const { data: alertas } = useAlertasQuery();
  const checkinMutation = useCheckinMutation();

  const [mensagemTexto, setMensagemTexto] = useState('');
  const [respostaRecebida, setRespostaRecebida] = useState<CheckinResponse | null>(null);
  const [erroTexto, setErroTexto] = useState<string | null>(null);

  const alertaAtivo = alertas?.find(
    (a) => a.estado === 'AGUARDANDO_IDOSO' || a.estado === 'DISPARADO'
  );
  const alertaId = alertaAtivo?.id || '00000000-0000-0000-0000-000000005001';

  const handleEnviarResposta = async (texto: string) => {
    setErroTexto(null);
    if (!texto.trim()) {
      setErroTexto('Por favor, selecione uma opção ou digite uma mensagem.');
      return;
    }

    try {
      const res = await checkinMutation.mutateAsync({
        alertaId,
        respostaTexto: texto.trim(),
      });
      setRespostaRecebida(res);
    } catch (err: any) {
      setErroTexto(err.message || 'Falha ao enviar resposta de check-in.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderZelo
        title="Como você está?"
        subtitle="Avisar a família com um toque"
        showBack
        showSobre={false}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {respostaRecebida ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>
              {respostaRecebida.classificacao === 'BEM'
                ? 'Tudo certo'
                : 'Pedido de ajuda enviado'}
            </Text>
            <Text style={styles.feedbackMessage}>{respostaRecebida.mensagem}</Text>

            <TouchableOpacity
              style={styles.voltarInicioButton}
              onPress={() => router.replace('/idoso')}
              accessibilityRole="button"
              accessibilityLabel="Voltar para o início"
            >
              <Text style={styles.voltarInicioButtonText}>Voltar para o início</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionHeader}>Como você está agora?</Text>

            {erroTexto && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorText}>{erroTexto}</Text>
              </View>
            )}

            {/* Opção 1: Estou bem */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                styles.optionBem,
                checkinMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={() => handleEnviarResposta('Estou muito bem! Só acordei mais tarde hoje.')}
              disabled={checkinMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Estou bem"
            >
              <Text style={styles.optionTitleBem}>Estou bem</Text>
            </TouchableOpacity>

            {/* Opção 2: Acordei mais tarde, tudo tranquilo */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                styles.optionTranquilo,
                checkinMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={() => handleEnviarResposta('Já levantei, está tudo tranquilo por aqui.')}
              disabled={checkinMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Acordei mais tarde, tudo tranquilo"
            >
              <Text style={styles.optionTitleTranquilo}>
                Acordei mais tarde, tudo tranquilo
              </Text>
            </TouchableOpacity>

            {/* Opção 3: Não estou bem, preciso de ajuda */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                styles.optionAjuda,
                checkinMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={() => handleEnviarResposta('Não estou me sentindo bem, preciso de ajuda da família.')}
              disabled={checkinMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Não estou bem, preciso de ajuda"
            >
              <Text style={styles.optionTitleAjuda}>
                Não estou bem, preciso de ajuda
              </Text>
            </TouchableOpacity>

            {/* Card com Digitação Livre */}
            <View style={styles.customMessageCard}>
              <Text style={styles.customMessageLabel}>Ou escreva uma mensagem</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Escreva aqui..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={mensagemTexto}
                onChangeText={setMensagemTexto}
                accessibilityLabel="Campo de texto para digitação livre do check-in"
              />

              <TouchableOpacity
                style={[
                  styles.sendCustomButton,
                  checkinMutation.isPending && styles.buttonDisabled,
                ]}
                onPress={() => handleEnviarResposta(mensagemTexto)}
                disabled={checkinMutation.isPending}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensagem"
              >
                <Text style={styles.sendCustomButtonText}>
                  {checkinMutation.isPending ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 48,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: Colors.dangerBg,
    borderColor: Colors.dangerBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.standard.sm,
    fontWeight: '500',
  },
  optionButton: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  optionBem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  optionTranquilo: {
    backgroundColor: '#F0FDFA',
    borderColor: Colors.brand,
  },
  optionAjuda: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  optionTitleBem: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: '#15803D',
  },
  optionTitleTranquilo: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.brandDark,
  },
  optionTitleAjuda: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: '#B91C1C',
  },
  customMessageCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 10,
  },
  customMessageLabel: {
    fontSize: Typography.standard.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  sendCustomButton: {
    backgroundColor: Colors.brand,
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCustomButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  feedbackCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    marginTop: 12,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  feedbackMessage: {
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  voltarInicioButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  voltarInicioButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
});
