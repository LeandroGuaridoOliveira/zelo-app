import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lembretesService } from '@/services/lembretesService';
import { useAuth } from '@/providers/AuthProvider';
import { UpdateLembreteInput } from '@/types/zelo';

interface UpdateLembreteArgs {
  id: string;
  dados: UpdateLembreteInput;
}

export function useUpdateLembreteMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, dados }: UpdateLembreteArgs) => {
      return await lembretesService.updateLembrete(id, dados, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lembretes'] });
      queryClient.invalidateQueries({ queryKey: ['lembretesHoje'] });
    },
  });
}
