import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { SignupData } from '@/services/authService';

export function useSignupMutation() {
  const { signUp } = useAuth();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      await signUp(data);
    },
    retry: false,
  });
}
