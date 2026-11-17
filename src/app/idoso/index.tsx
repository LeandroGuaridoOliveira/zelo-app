import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/providers/AuthProvider';
import { useAlertasQuery } from '@/hooks/useAlertasQuery';
import { useLembretesHojeQuery } from '@/hooks/useLembretesQuery';
import { useConfirmarLembreteHojeMutation } from '@/hooks/useConfirmarLembreteHojeMutation';
import { useEmergenciaMutation } from '@/hooks/useEmergenciaMutation';
import { FIXED_CASA_ID, FIXED_IDOSO_ID } from '@/types/zelo';
import { Colors, Spacing, Typography } from '@/theme/colors';

export default function IdosoHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const { data: alertas, refetch: refetchAlertas } = useAlertasQuery();
  const { data: lembretesHoje, isLoading: lembretesLoading, refetch: refetchLembretes } =
    useLembretesHojeQuery(FIXED_IDOSO_ID);

  const confirmarLembreteMutation = useConfirmarLembreteHojeMutation();
  const emergenciaMutation = useEmergenciaMutation();

  const [modalSosVisivel, setModalSosVisivel] = useState(false);
  const [sosEnviado, setSosEnviado] = useState(false);

  const handleRefresh = async () => {
    await Promise.all([refetchAlertas(), refetchLembretes()]);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const alertaPendente = alertas?.find(
    (a) => a.estado === 'AGUARDANDO_IDOSO' || a.estado === 'DISPARADO'
  );

  const handleConfirmarTomou = async (idRegistro: string) => {
    try {
      await confirmarLembreteMutation.mutateAsync(idRegistro);
    } catch (_err) {
      // Falha capturada na mutation
    }
  };

  const handleDispararSos = async () => {
    try {
      await emergenciaMutation.mutateAsync(FIXED_CASA_ID);
      setModalSosVisivel(false);
      setSosEnviado(true);
    } catch (_err) {
      setModalSosVisivel(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Olá, Dona Maria"
        userName={user?.nome ?? 'Dona Maria'}
        showSobre={false}
        onLogout={handleLogout}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={lembretesLoading}
            onRefresh={handleRefresh}
            colors={[Colors.brand]}
          />
        }
      >
        {/* Bloco 1 — Check-in / Bem-estar */}
        {alertaPendente ? (
          <View style={styles.alertaCard}>
            <Text style={styles.alertaCardTitle}>Está tudo bem com você?</Text>
            <Text style={styles.alertaCardSub}>
              Toque abaixo para avisar sua família.
            </Text>
            <TouchableOpacity
              style={styles.alertaButton}
              onPress={() => router.push('/idoso/checkin')}
              accessibilityRole="button"
              accessibilityLabel="Responder ao check-in agora"
            >
              <Text style={styles.alertaButtonText}>Responder agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.checkinCard}>
            <Text style={styles.checkinCardTitle}>Como você está hoje?</Text>
            <Text style={styles.checkinCardSub}>
              Avise sua família que está tudo tranquilo com você.
            </Text>
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => router.push('/idoso/checkin')}
              accessibilityRole="button"
              accessibilityLabel="Avisar que estou bem"
            >
              <Text style={styles.checkinButtonText}>Avisar que estou bem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bloco 2 — Remédios de hoje */}
        <View style={styles.remediosSection}>
          <Text style={styles.sectionTitle}>Remédios de hoje</Text>

          {lembretesLoading ? (
            <LoadingState message="Verificando seus remédios..." />
          ) : lembretesHoje && lembretesHoje.length > 0 ? (
            lembretesHoje.map((item) => (
              <View key={item.id} style={styles.medicamentoCard}>
                <View style={styles.medicamentoHeader}>
                  <Text style={styles.horaText}>{item.horario}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.tomado ? styles.statusPillTomado : styles.statusPillPendente,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.tomado ? styles.statusTextTomado : styles.statusTextPendente,
                      ]}
                    >
                      {item.tomado ? 'Tomado' : 'Pendente'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.medicamentoNome}>{item.descricao}</Text>

                {item.tomado ? (
                  <View style={styles.jaTomouBox}>
                    <Text style={styles.jaTomouText}>Já tomado hoje</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.botaoTomar}
                    onPress={() => handleConfirmarTomou(item.id)}
                    disabled={confirmarLembreteMutation.isPending}
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar que já tomei ${item.descricao}`}
                  >
                    <Text style={styles.botaoTomarText}>
                      {confirmarLembreteMutation.isPending
                        ? 'Salvando...'
                        : 'Confirmar que tomei'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.cardInfo}>
              <Text style={styles.cardInfoText}>
                Nenhum remédio pendente para este horário.
              </Text>
            </View>
          )}
        </View>

        {/* Bloco 3 — Emergência */}
        <View style={styles.emergenciaSection}>
          <Text style={styles.sectionTitle}>Precisa de ajuda?</Text>

          {sosEnviado && (
            <View style={styles.sosConfirmadoCard} accessibilityRole="alert">
              <Text style={styles.sosConfirmadoTitle}>Pedido de ajuda enviado!</Text>
              <Text style={styles.sosConfirmadoSub}>
                Ana e José já foram avisados e estão a caminho.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => setModalSosVisivel(true)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Botão de emergência. Pedir ajuda para Ana e José."
          >
            <Text style={styles.sosTitle}>Pedir ajuda</Text>
            <Text style={styles.sosSubtitle}>Avisar Ana e José imediatamente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE CONFIRMAÇÃO CONTRA TOQUE ACIDENTAL */}
      <Modal
        visible={modalSosVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSosVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} accessibilityRole="alert">
            <Text style={styles.modalTitle}>Confirmar pedido de ajuda?</Text>
            <Text style={styles.modalDescription}>
              Seus contatos de emergência (Ana e José) serão avisados agora por mensagem e ligação.
            </Text>

            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                emergenciaMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleDispararSos}
              disabled={emergenciaMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Sim, pedir ajuda"
            >
              <Text style={styles.modalConfirmButtonText}>
                {emergenciaMutation.isPending
                  ? 'Acionando contatos...'
                  : 'Sim, pedir ajuda'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalSosVisivel(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  alertaCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  alertaCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
  },
  alertaCardSub: {
    fontSize: Typography.standard.sm,
    color: '#78350F',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  alertaButton: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertaButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  checkinCard: {
    backgroundColor: Colors.surface,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  checkinCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkinCardSub: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  checkinButton: {
    backgroundColor: Colors.brand,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  remediosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 14,
  },
  medicamentoCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  medicamentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillTomado: {
    backgroundColor: Colors.successBg,
  },
  statusPillPendente: {
    backgroundColor: Colors.warningBg,
  },
  statusPillText: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
  },
  statusTextTomado: {
    color: Colors.success,
  },
  statusTextPendente: {
    color: Colors.warning,
  },
  medicamentoNome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 12,
  },
  botaoTomar: {
    backgroundColor: Colors.brand,
    minHeight: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  botaoTomarText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 18,
  },
  jaTomouBox: {
    paddingVertical: 8,
  },
  jaTomouText: {
    color: Colors.success,
    fontWeight: '600',
    fontSize: 16,
  },
  cardInfo: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardInfoText: {
    fontSize: Typography.standard.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  emergenciaSection: {
    marginBottom: 24,
  },
  sosConfirmadoCard: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  sosConfirmadoTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.success,
  },
  sosConfirmadoSub: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sosButton: {
    backgroundColor: Colors.danger,
    minHeight: 76,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sosTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sosSubtitle: {
    color: '#FEE2E2',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalConfirmButton: {
    backgroundColor: Colors.danger,
    minHeight: 52,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalConfirmButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
    textAlign: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.surfaceCard,
    minHeight: 48,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.standard.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
