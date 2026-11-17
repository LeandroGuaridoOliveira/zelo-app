import { useQuery } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';

export function useAlertasQuery() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['alertas'],
    queryFn: () => monitorService.getAlertas(token ?? undefined),
    enabled: !!user,
    refetchInterval: 10_000, // Consulta periódica dos alertas
  });
}
