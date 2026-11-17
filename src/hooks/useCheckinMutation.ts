import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';

interface CheckinArgs {
  alertaId: string;
  respostaTexto: string;
}

export function useCheckinMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ alertaId, respostaTexto }: CheckinArgs) => {
      return await monitorService.enviarCheckin(alertaId, respostaTexto, token ?? undefined);
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['casaStatus'] });
    },
  });
}
