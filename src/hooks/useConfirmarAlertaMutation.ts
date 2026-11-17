import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';

interface ConfirmarAlertaArgs {
  alertaId: string;
  cuidadorId: string;
  nomeCuidador?: string;
}

export function useConfirmarAlertaMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ alertaId, cuidadorId, nomeCuidador }: ConfirmarAlertaArgs) => {
      return await monitorService.confirmarAlerta(
        alertaId,
        cuidadorId,
        nomeCuidador,
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
