import { useQuery } from '@tanstack/react-query';
import { insightsService } from '@/services/insightsService';
import { useAuth } from '@/providers/AuthProvider';
import { FIXED_CASA_ID } from '@/types/zelo';

export function useResumoSemanalQuery(casaId: string = FIXED_CASA_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['resumos', casaId],
    queryFn: () => insightsService.getResumos(casaId, token ?? undefined),
    enabled: !!user,
  });
}

export function useDiasAtipicosQuery(casaId: string = FIXED_CASA_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['diasAtipicos', casaId],
    queryFn: () => insightsService.getDiasAtipicos(casaId, token ?? undefined),
    enabled: !!user,
  });
}
