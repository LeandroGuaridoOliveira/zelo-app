import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lembretesService } from '@/services/lembretesService';
import { useAuth } from '@/providers/AuthProvider';
import { CreateLembreteInput } from '@/types/zelo';

export function useCreateLembreteMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (dados: CreateLembreteInput) => {
      return await lembretesService.createLembrete(dados, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lembretes'] });
      queryClient.invalidateQueries({ queryKey: ['lembretesHoje'] });
    },
  });
}
