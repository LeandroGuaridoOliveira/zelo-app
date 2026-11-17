import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { useLembretesQuery } from '@/hooks/useLembretesQuery';
import { useCreateLembreteMutation } from '@/hooks/useCreateLembreteMutation';
import { useUpdateLembreteMutation } from '@/hooks/useUpdateLembreteMutation';
import { FIXED_IDOSO_ID } from '@/types/zelo';
import { Colors, Spacing, Typography, TouchTarget } from '@/theme/colors';

const DIAS_DISPONIVEIS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

export default function LembreteFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const { data: lembretes } = useLembretesQuery();
  const createMutation = useCreateLembreteMutation();
  const updateMutation = useUpdateLembreteMutation();

  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('08:00');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([
    'SEG',
    'TER',
    'QUA',
    'QUI',
    'SEX',
    'SAB',
    'DOM',
  ]);
  const [ativo, setAtivo] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preenche dados ao editar
  useEffect(() => {
    if (isEditing && lembretes) {
      const lembrete = lembretes.find((l) => l.id === id);
      if (lembrete) {
        setDescricao(lembrete.descricao);
        setHorario(lembrete.horario);
        setDiasSelecionados(lembrete.diasSemana.split(',').map((d) => d.trim()));
        setAtivo(lembrete.ativo);
      }
    }
  }, [id, isEditing, lembretes]);

  const toggleDia = (dia: string) => {
    if (diasSelecionados.includes(dia)) {
      if (diasSelecionados.length === 1) {
        setErrorMessage('Selecione pelo menos um dia da semana.');
        return;
      }
      setErrorMessage(null);
      setDiasSelecionados(diasSelecionados.filter((d) => d !== dia));
    } else {
      setErrorMessage(null);
      setDiasSelecionados([...diasSelecionados, dia]);
    }
  };

  const selecionarTodosDias = () => {
    setErrorMessage(null);
    setDiasSelecionados([...DIAS_DISPONIVEIS]);
  };

  const handleSalvar = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!descricao.trim()) {
      setErrorMessage('Informe a descrição do remédio ou cuidado.');
      return;
    }

    const horarioRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horarioRegex.test(horario.trim())) {
      setErrorMessage('Informe um horário válido no formato HH:mm (ex: 08:00 ou 14:30).');
      return;
    }

    const diasSemanaString = diasSelecionados.join(',');

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          dados: {
            descricao: descricao.trim(),
            horario: horario.trim(),
            diasSemana: diasSemanaString,
            ativo,
          },
        });
        setSuccessMessage('Lembrete atualizado com sucesso!');
        setTimeout(() => router.replace('/cuidador/lembretes'), 600);
      } else {
        await createMutation.mutateAsync({
          idosoId: FIXED_IDOSO_ID,
          descricao: descricao.trim(),
          horario: horario.trim(),
          diasSemana: diasSemanaString,
        });
        setSuccessMessage('Lembrete cadastrado com sucesso!');
        setTimeout(() => router.replace('/cuidador/lembretes'), 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar o lembrete.');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderZelo
        title={isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}
        subtitle="Configure o horário e os dias do medicamento"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {successMessage && (
            <View style={styles.successBox} accessibilityRole="alert">
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Campo Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicamento ou cuidado *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Losartana 50mg"
              placeholderTextColor={Colors.textMuted}
              value={descricao}
              onChangeText={setDescricao}
              accessibilityLabel="Campo descrição do medicamento"
            />
          </View>

          {/* Campo Horário */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horário programado (HH:mm) *</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              value={horario}
              onChangeText={setHorario}
              accessibilityLabel="Campo horário programado"
            />
          </View>

          {/* Dias da Semana */}
          <View style={styles.inputGroup}>
            <View style={styles.diasHeaderRow}>
              <Text style={styles.label}>Dias da semana</Text>
              <TouchableOpacity onPress={selecionarTodosDias}>
                <Text style={styles.selecionarTodosText}>Todos os dias</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.diasPillsContainer}>
              {DIAS_DISPONIVEIS.map((dia) => {
                const isSelected = diasSelecionados.includes(dia);
                return (
                  <TouchableOpacity
                    key={dia}
                    style={[styles.diaPill, isSelected && styles.diaPillSelected]}
                    onPress={() => toggleDia(dia)}
                    accessibilityRole="button"
                    accessibilityLabel={`Dia ${dia}`}
                  >
                    <Text
                      style={[styles.diaPillText, isSelected && styles.diaPillTextSelected]}
                    >
                      {dia}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Status Ativo (em caso de edição) */}
          {isEditing && (
            <View style={styles.switchRow}>
              <Text style={styles.label}>Status do lembrete</Text>
              <TouchableOpacity
                style={[styles.statusToggle, ativo ? styles.toggleAtivo : styles.toggleInativo]}
                onPress={() => setAtivo(!ativo)}
                accessibilityRole="button"
              >
                <Text style={styles.toggleText}>{ativo ? 'Ativo' : 'Pausado'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSalvar}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Salvar lembrete"
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Lembrete' : 'Salvar Lembrete'}
            </Text>
          </TouchableOpacity>
        </View>
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
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  successText: {
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
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.standard.sm,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.standard.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    height: TouchTarget.minTouchTarget,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.standard.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  diasHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  selecionarTodosText: {
    fontSize: Typography.standard.xs,
    color: Colors.brand,
    fontWeight: 'bold',
  },
  diasPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  diaPill: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minWidth: 44,
    alignItems: 'center',
  },
  diaPillSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
  },
  diaPillText: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  diaPillTextSelected: {
    color: Colors.textLight,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  statusToggle: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleAtivo: {
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  toggleInativo: {
    backgroundColor: Colors.warningBg,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  toggleText: {
    fontSize: Typography.standard.xs,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  saveButton: {
    height: TouchTarget.minTouchTarget,
    backgroundColor: Colors.brand,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
});
