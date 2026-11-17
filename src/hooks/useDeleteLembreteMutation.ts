import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lembretesService } from '@/services/lembretesService';
import { useAuth } from '@/providers/AuthProvider';

export function useDeleteLembreteMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      return await lembretesService.deleteLembrete(id, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lembretes'] });
      queryClient.invalidateQueries({ queryKey: ['lembretesHoje'] });
    },
  });
}
