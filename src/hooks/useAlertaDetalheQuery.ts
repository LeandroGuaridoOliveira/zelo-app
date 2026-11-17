import { useQuery } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';

export function useAlertaDetalheQuery(alertaId: string) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['alerta', alertaId],
    queryFn: () => monitorService.getAlertaDetalhe(alertaId, token ?? undefined),
    enabled: !!user && !!alertaId,
    refetchInterval: 5_000,
  });
}
