import { useQuery } from '@tanstack/react-query';
import { monitorService } from '@/services/monitorService';
import { useAuth } from '@/providers/AuthProvider';
import { FIXED_CASA_ID } from '@/types/zelo';

export function useCasaStatusQuery(casaId: string = FIXED_CASA_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['casaStatus', casaId],
    queryFn: () => monitorService.getCasaStatus(casaId, token ?? undefined),
    enabled: !!user,
    refetchInterval: 10_000, // Atualização periódica a cada 10 segundos
  });
}
