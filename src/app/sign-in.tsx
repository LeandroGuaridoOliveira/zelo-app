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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useLoginMutation } from '@/hooks/useLoginMutation';
import { Colors, Spacing, Typography, TouchTarget } from '@/theme/colors';

export default function SignInScreen() {
  const router = useRouter();
  const { loginAsDemo } = useAuth();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !senha.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), senha });
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    }
  };

  const handleDemoSelect = async (perfil: 'maria' | 'ana' | 'jose') => {
    setErrorMessage(null);
    try {
      await loginAsDemo(perfil);
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro no login de demonstração.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Banner Superior da Marca */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>ZELO</Text>
          </View>
          <Text style={styles.title}>Cuidado e Presença</Text>
          <Text style={styles.subtitle}>
            Monitoramento de rotina e proteção para quem vive sozinho.
          </Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>

          {errorMessage && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
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
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
              accessibilityLabel="Campo de senha"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loginMutation.isPending && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Entrar no aplicativo Zelo"
          >
            <Text style={styles.primaryButtonText}>
              {loginMutation.isPending ? 'Verificando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Ainda não tem conta? </Text>
            <TouchableOpacity
              onPress={() => router.push('/sign-up')}
              accessibilityRole="button"
              accessibilityLabel="Cadastre-se"
            >
              <Text style={styles.signupLink}>Cadastre-se aqui</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acesso Rápido */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Acesso rápido</Text>

          <TouchableOpacity
            style={[styles.demoButton, styles.demoIdoso]}
            onPress={() => handleDemoSelect('maria')}
            accessibilityRole="button"
            accessibilityLabel="Entrar como Dona Maria, Idosa"
          >
            <View style={styles.demoButtonTextContainer}>
              <Text style={styles.demoButtonTitle}>Dona Maria (Idosa)</Text>
              <Text style={styles.demoButtonSubtitle}>Remédios e SOS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoSelect('ana')}
            accessibilityRole="button"
            accessibilityLabel="Entrar como Ana, Filha"
          >
            <View style={styles.demoButtonTextContainer}>
              <Text style={styles.demoButtonTitle}>Ana (Filha)</Text>
              <Text style={styles.demoButtonSubtitle}>Painel e lembretes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => handleDemoSelect('jose')}
            accessibilityRole="button"
            accessibilityLabel="Entrar como José, Vizinho"
          >
            <View style={styles.demoButtonTextContainer}>
              <Text style={styles.demoButtonTitle}>José (Vizinho)</Text>
              <Text style={styles.demoButtonSubtitle}>Alertas da rede</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Link para Sobre o App */}
        <TouchableOpacity
          style={styles.sobreLinkButton}
          onPress={() => router.push('/sobre')}
          accessibilityRole="button"
          accessibilityLabel="Ver informações sobre o aplicativo Zelo"
        >
          <Text style={styles.sobreLinkText}>ℹ️ Sobre o app</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  logoText: {
    color: Colors.textLight,
    fontWeight: '900',
    fontSize: Typography.standard.lg,
    letterSpacing: 3,
  },
  title: {
    fontSize: Typography.standard.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 24,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: Typography.standard.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.md,
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
  inputLabel: {
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
  primaryButton: {
    height: TouchTarget.minTouchTarget,
    backgroundColor: Colors.brand,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.md,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signupText: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.brand,
  },
  demoCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    minHeight: 48,
  },
  demoIdoso: {
    borderColor: Colors.brand,
    backgroundColor: '#F0FDFA',
  },
  demoButtonTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoButtonTitle: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  demoButtonSubtitle: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sobreLinkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  sobreLinkText: {
    fontSize: Typography.standard.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
