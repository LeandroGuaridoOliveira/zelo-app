import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingState } from '@/components/LoadingState';
import { Colors } from '@/theme/colors';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingState message="Inicializando sessão Zelo..." large />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  if (user.papel === 'IDOSO') {
    return <Redirect href="/idoso" />;
  }

  // Cuidador (Familiar ou Guardião)
  return <Redirect href="/cuidador" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
