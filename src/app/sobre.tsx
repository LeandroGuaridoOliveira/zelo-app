import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { HeaderZelo } from '@/components/HeaderZelo';
import { API_CONFIG, fetchWithTimeout } from '@/services/apiConfig';
import { Colors, Spacing, Typography } from '@/theme/colors';

interface ApiStatus {
  name: string;
  url: string;
  online: boolean | null;
  loading: boolean;
}

export default function SobreScreen() {
  const router = useRouter();

  // Metadados da aplicação
  const appName = Application.applicationName ?? 'Zelo';
  const packageName = Application.applicationId ?? 'br.fiap.mad.zelo.rm561760';
  const appVersion = Application.nativeApplicationVersion ?? '1.0.0';
  const buildVersion = Application.nativeBuildVersion ?? '1';
  const commitHash = Constants.expoConfig?.extra?.commitHash ?? 'dev';

  const [apis, setApis] = useState<ApiStatus[]>([
    {
      name: 'API .NET (Cuidado)',
      url: API_CONFIG.cuidadoApiUrl,
      online: null,
      loading: true,
    },
    {
      name: 'API Java (Monitor & Alertas)',
      url: API_CONFIG.monitorApiUrl,
      online: null,
      loading: true,
    },
    {
      name: 'API Python (Insights)',
      url: API_CONFIG.insightsApiUrl,
      online: null,
      loading: true,
    },
  ]);

  useEffect(() => {
    async function checkApis() {
      const updated = await Promise.all(
        apis.map(async (api) => {
          try {
            const testUrl = api.url.includes('/api/v1')
              ? `${api.url}/casas/00000000-0000-0000-0000-000000000100/resumos`
              : api.url;

            let res = await fetchWithTimeout(testUrl, { method: 'GET' }, 2000).catch(() => null);
            if (!res) {
              res = await fetchWithTimeout(api.url, { method: 'GET' }, 2000).catch(() => null);
            }
            const isOnline = res !== null && res.status < 500;
            return { ...api, online: isOnline, loading: false };
          } catch (_e) {
            return { ...api, online: false, loading: false };
          }
        })
      );
      setApis(updated);
    }
    checkApis();
  }, []);

  return (
    <View style={styles.container}>
      <HeaderZelo
        title="Sobre o Aplicativo"
        subtitle="Identificação de versão, build e integridade"
        showBack
        onBack={() => router.back()}
        showSobre={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cartão de Informações de Build & Git Hash */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Versão e Build</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nome da Aplicação:</Text>
            <Text style={styles.infoValue}>{appName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Identificador do Pacote:</Text>
            <Text style={styles.infoValue}>{packageName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão Semântica:</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número da Build:</Text>
            <Text style={styles.infoValue}>{buildVersion}</Text>
          </View>

          <View style={[styles.infoRow, styles.commitRow]}>
            <Text style={styles.infoLabel}>Hash do Commit (Git):</Text>
            <View style={styles.commitBadge}>
              <Text style={styles.commitText}>{commitHash}</Text>
            </View>
          </View>
        </View>

        {/* Informações Acadêmicas e Avaliação */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações Acadêmicas</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instituição:</Text>
            <Text style={styles.infoValue}>FIAP — Global Solution 2026/2</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tema:</Text>
            <Text style={styles.infoValue}>CitizenTech</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Disciplina:</Text>
            <Text style={styles.infoValue}>Mobile Application Development</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Professor:</Text>
            <Text style={styles.infoValue}>Felipe Cavalcante Vilella de Oliveira</Text>
          </View>
        </View>

        {/* Conectividade com as APIs do Ecossistema */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conectividade das APIs</Text>

          {apis.map((api, index) => (
            <View key={index} style={styles.apiCard}>
              <View style={styles.apiHeaderRow}>
                <Text style={styles.apiName}>{api.name}</Text>
                <View
                  style={[
                    styles.statusPill,
                    api.loading
                      ? styles.statusLoading
                      : api.online
                      ? styles.statusOnline
                      : styles.statusOffline,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {api.loading ? 'Testando...' : api.online ? 'Online' : 'Desligada'}
                  </Text>
                </View>
              </View>
              <Text style={styles.apiUrl}>{api.url}</Text>
            </View>
          ))}

          <Text style={styles.fallbackNotice}>
            <Text style={styles.bold}>Modo Fallback Resiliente Ativo:</Text> O aplicativo funciona perfeitamente mesmo quando as APIs externas estiverem desligadas, utilizando dados fixos persistidos no dispositivo.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Typography.standard.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  commitRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
    paddingTop: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.standard.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: Typography.standard.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  commitBadge: {
    backgroundColor: Colors.brandDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  commitText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: Typography.standard.sm,
  },
  bold: {
    fontWeight: 'bold',
  },
  apiCard: {
    backgroundColor: Colors.surfaceCard,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apiName: {
    fontSize: Typography.standard.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  apiUrl: {
    fontSize: Typography.standard.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: Colors.successBg,
  },
  statusOffline: {
    backgroundColor: Colors.warningBg,
  },
  statusLoading: {
    backgroundColor: Colors.infoBg,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  fallbackNotice: {
    fontSize: Typography.standard.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  backButton: {
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  backButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: Typography.standard.sm,
  },
});
