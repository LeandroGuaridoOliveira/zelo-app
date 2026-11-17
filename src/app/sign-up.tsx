import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { HeaderZelo } from '@/components/HeaderZelo';
import { useSignupMutation } from '@/hooks/useSignupMutation';
import { PapelUsuario } from '@/types/zelo';
import { Colors, Spacing, Typography, TouchTarget } from '@/theme/colors';

export default function SignUpScreen() {
  const router = useRouter();
  const signupMutation = useSignupMutation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [papel, setPapel] = useState<PapelUsuario>('FAMILIAR');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErrorMessage('Preencha todos os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    if (senha.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      await signupMutation.mutateAsync({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        papel: papel === 'ADMIN' || papel === 'SERVICO' ? 'FAMILIAR' : papel,
        telefone: telefone.trim(),
      });

      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao realizar cadastro.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HeaderZelo
        title="Criar Conta"
        subtitle="Junte-se à rede de cuidado do Zelo"
        showBack
        onBack={() => router.back()}
        showSobre={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {errorMessage && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Ana Clara Oliveira"
              placeholderTextColor={Colors.textMuted}
              value={nome}
              onChangeText={setNome}
              accessibilityLabel="Campo de nome completo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: ana@zelo.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              accessibilityLabel="Campo de e-mail"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha (mínimo 6 caracteres) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite uma senha segura"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              accessibilityLabel="Campo de senha"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone para Notificações</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: (11) 98765-4321"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
              accessibilityLabel="Campo de telefone"
            />
          </View>

          {/* Seleção do Papel */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qual o seu papel no cuidado? *</Text>
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  papel === 'FAMILIAR' && styles.roleButtonActive,
                ]}
                onPress={() => setPapel('FAMILIAR')}
                accessibilityRole="button"
                accessibilityLabel="Papel Familiar"
              >
                <Text
                  style={[
                    styles.roleText,
                    papel === 'FAMILIAR' && styles.roleTextActive,
                  ]}
                >
                  Familiar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  papel === 'GUARDIAO' && styles.roleButtonActive,
                ]}
                onPress={() => setPapel('GUARDIAO')}
                accessibilityRole="button"
                accessibilityLabel="Papel Vizinho Guardião"
              >
                <Text
                  style={[
                    styles.roleText,
                    papel === 'GUARDIAO' && styles.roleTextActive,
                  ]}
                >
                  Guardião
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  papel === 'IDOSO' && styles.roleButtonActive,
                ]}
                onPress={() => setPapel('IDOSO')}
                accessibilityRole="button"
                accessibilityLabel="Papel Idoso"
              >
                <Text
                  style={[
                    styles.roleText,
                    papel === 'IDOSO' && styles.roleTextActive,
                  ]}
                >
                  Idoso
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, signupMutation.isPending && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={signupMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Confirmar cadastro"
          >
            <Text style={styles.submitButtonText}>
              {signupMutation.isPending ? 'Cadastrando...' : 'Concluir Cadastro'}
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
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: Spacing.xxl,
  },
  formCard: {
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
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    minHeight: 48,
  },
  roleButtonActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.successBg,
  },
  roleText: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  roleTextActive: {
    color: Colors.brandDark,
    fontWeight: 'bold',
  },
  submitButton: {
    height: TouchTarget.minTouchTarget,
    backgroundColor: Colors.brand,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
});
