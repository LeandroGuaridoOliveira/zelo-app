import { useQuery } from '@tanstack/react-query';
import { redeApoioService } from '@/services/redeApoioService';
import { useAuth } from '@/providers/AuthProvider';
import { FIXED_IDOSO_ID } from '@/types/zelo';

export function useRedeApoioQuery(idosoId: string = FIXED_IDOSO_ID) {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['redeApoio', idosoId],
    queryFn: () => redeApoioService.getContatos(idosoId, token ?? undefined),
    enabled: !!user,
  });
}
