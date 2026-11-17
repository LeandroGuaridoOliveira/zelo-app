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
import { ErrorState } from '@/components/ErrorState';
import { useLembretesQuery } from '@/hooks/useLembretesQuery';
import { useDeleteLembreteMutation } from '@/hooks/useDeleteLembreteMutation';
import { Lembrete } from '@/types/zelo';
import { Colors, Spacing, Typography } from '@/theme/colors';

export default function LembretesIndexScreen() {
  const router = useRouter();
  const { data: lembretes, isLoading, isError, refetch } = useLembretesQuery();
  const deleteMutation = useDeleteLembreteMutation();

  const [lembreteParaExcluir, setLembreteParaExcluir] = useState<Lembrete | null>(null);

  const handleConfirmarExclusao = async () => {
    if (!lembreteParaExcluir) return;
    try {
      await deleteMutation.mutateAsync(lembreteParaExcluir.id);
    } catch (_err) {
      // Falha capturada pela mutation
    } finally {
      setLembreteParaExcluir(null);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Lembretes de Remédios"
        subtitle="Horários e medicamentos da rotina"
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
        {/* Barra superior de Ação */}
        <View style={styles.actionHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.sectionTitle}>Medicamentos</Text>
            <Text style={styles.sectionDesc}>
              {lembretes?.length ?? 0} {lembretes?.length === 1 ? 'remédio ativo' : 'remédios ativos'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/cuidador/lembretes/form')}
            accessibilityRole="button"
            accessibilityLabel="Criar novo lembrete de remédio"
          >
            <Text style={styles.addButtonText}>+ Novo Lembrete</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <LoadingState message="Carregando lembretes..." large />
        ) : isError ? (
          <ErrorState
            message="Erro ao carregar os lembretes de medicação."
            onRetry={refetch}
          />
        ) : lembretes && lembretes.length > 0 ? (
          lembretes.map((item) => (
            <View key={item.id} style={styles.lembreteCard}>
              <View style={styles.cardHeader}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{item.horario}</Text>
                </View>

                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {item.ativo ? 'Ativo' : 'Pausado'}
                  </Text>
                </View>
              </View>

              <Text style={styles.descricao}>{item.descricao}</Text>

              <View style={styles.diasRow}>
                <Text style={styles.diasLabel}>Dias programados: </Text>
                <Text style={styles.diasValue}>{item.diasSemana}</Text>
              </View>

              {/* Ações (Editar / Excluir) */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/cuidador/lembretes/form?id=${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar lembrete ${item.descricao}`}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setLembreteParaExcluir(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir lembrete ${item.descricao}`}
                >
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum lembrete cadastrado</Text>
            <Text style={styles.emptyDesc}>
              Toque em "+ Novo Lembrete" acima para cadastrar o primeiro medicamento da rotina.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Confirmação de Exclusão (funciona 100% no Web e Mobile) */}
      <Modal
        visible={!!lembreteParaExcluir}
        transparent
        animationType="fade"
        onRequestClose={() => setLembreteParaExcluir(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} accessibilityRole="alert">
            <Text style={styles.modalTitle}>Excluir lembrete?</Text>
            <Text style={styles.modalDescription}>
              Tem certeza que deseja excluir "{lembreteParaExcluir?.descricao}"?
            </Text>

            <TouchableOpacity
              style={[
                styles.modalDeleteButton,
                deleteMutation.isPending && styles.buttonDisabled,
              ]}
              onPress={handleConfirmarExclusao}
              disabled={deleteMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Sim, excluir"
            >
              <Text style={styles.modalDeleteButtonText}>
                {deleteMutation.isPending ? 'Excluindo...' : 'Sim, excluir'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setLembreteParaExcluir(null)}
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
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 48,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  sectionDesc: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
  },
  addButton: {
    backgroundColor: Colors.brand,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  addButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
  lembreteCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timeBadge: {
    backgroundColor: Colors.infoBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.infoBorder,
  },
  timeText: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.info,
  },
  statusPill: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.success,
  },
  descricao: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginVertical: 6,
  },
  diasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  diasLabel: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
  },
  diasValue: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dangerBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  deleteButtonText: {
    fontSize: Typography.standard.xs,
    fontWeight: '600',
    color: Colors.danger,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  modalDeleteButton: {
    backgroundColor: Colors.danger,
    minHeight: 48,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalDeleteButtonText: {
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
