import { useQuery } from '@tanstack/react-query';
import { lembretesService } from '@/services/lembretesService';
import { useAuth } from '@/providers/AuthProvider';
import { FIXED_IDOSO_ID } from '@/types/zelo';

export function useLembretesQuery(idosoId: string = FIXED_IDOSO_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['lembretes', idosoId],
    queryFn: () => lembretesService.getLembretes(idosoId, token ?? undefined),
    enabled: !!user,
  });
}

export function useLembretesHojeQuery(idosoId: string = FIXED_IDOSO_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['lembretesHoje', idosoId],
    queryFn: () => lembretesService.getLembretesHoje(idosoId, token ?? undefined),
    enabled: !!user,
    refetchInterval: 10_000,
  });
}
