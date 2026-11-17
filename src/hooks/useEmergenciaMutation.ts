import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';
import { FIXED_CASA_ID } from '@/types/zelo';

export function useEmergenciaMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (casaId: string = FIXED_CASA_ID) => {
      return await monitorService.dispararEmergencia(casaId, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['casaStatus'] });
    },
  });
}
