import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { LoginCredentials } from '@/services/authService';

export function useLoginMutation() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await signIn(credentials);
    },
    retry: false,
  });
}
