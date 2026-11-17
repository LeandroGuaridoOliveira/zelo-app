import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lembretesService } from '@/services/lembretesService';
import { useAuth } from '@/providers/AuthProvider';

export function useConfirmarLembreteHojeMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (registroHojeId: string) => {
      return await lembretesService.confirmarLembreteHoje(registroHojeId, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lembretesHoje'] });
    },
  });
}
