import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/providers/AuthProvider';
import { Colors } from '@/theme/colors';

// Configuração global do QueryClient para gerenciamento de cache e requisições
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="sobre" />
          <Stack.Screen name="cuidador/index" />
          <Stack.Screen name="cuidador/alerta/[id]" />
          <Stack.Screen name="cuidador/lembretes/index" />
          <Stack.Screen name="cuidador/lembretes/form" />
          <Stack.Screen name="cuidador/rede-apoio" />
          <Stack.Screen name="cuidador/resumo" />
          <Stack.Screen name="idoso/index" />
          <Stack.Screen name="idoso/checkin" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
