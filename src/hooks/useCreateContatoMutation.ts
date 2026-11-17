import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redeApoioService } from '@/services/redeApoioService';
import { useAuth } from '@/providers/AuthProvider';
import { CreateContatoInput } from '@/types/zelo';

export function useCreateContatoMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (dados: CreateContatoInput) => {
      return await redeApoioService.createContato(dados, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redeApoio'] });
    },
  });
}
