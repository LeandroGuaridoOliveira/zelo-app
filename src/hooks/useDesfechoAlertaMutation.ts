import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';
import { DesfechoAlerta } from '@/types/zelo';

interface DesfechoAlertaArgs {
  alertaId: string;
  desfecho: DesfechoAlerta;
  observacao?: string;
}

export function useDesfechoAlertaMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ alertaId, desfecho, observacao }: DesfechoAlertaArgs) => {
      return await monitorService.registrarDesfecho(
        alertaId,
        desfecho,
        observacao,
        token ?? undefined
      );
    },
    retry: false,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['alerta', variables.alertaId] });
      queryClient.invalidateQueries({ queryKey: ['casaStatus'] });
    },
  });
}
