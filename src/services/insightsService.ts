import { API_CONFIG, fetchWithTimeout } from './apiConfig';
import { ResumoSemanal, DiaAtipico, FIXED_CASA_ID } from '@/types/zelo';

const FALLBACK_RESUMOS: ResumoSemanal[] = [
  {
    casaId: FIXED_CASA_ID,
    semanaInicio: '2026-11-09',
    texto:
      'Na última semana, a rotina da Dona Maria manteve-se predominantemente estável e tranquila. O horário habitual de despertar foi às 07h15, com boa movimentação entre o quarto, sala e cozinha. Todos os medicamentos da pressão foram tomados no horário correto, sem necessidade de intervenção.',
    metricas: {
      totalEventosPresenca: 342,
      horarioLevantarMedio: '07:15',
      diasAtipicos: 1,
      lembretesCumpridosPct: 100,
    },
    modelo: 'Gemini 1.5 Flash + Guardrails Zelo',
    geradoEm: '2026-11-16T06:00:00Z',
  },
];

const FALLBACK_DIAS_ATIPICOS: DiaAtipico[] = [
  {
    data: '2026-11-14',
    score: 0.88,
    atipico: true,
    atributos: {
      levantarMinutos: 480, // 08:00
      eventosMadrugada: 4,
      tempoSemMovimentoMax: 195,
    },
  },
  {
    data: '2026-11-15',
    score: 0.22,
    atipico: false,
    atributos: {
      levantarMinutos: 430, // 07:10
      eventosMadrugada: 0,
      tempoSemMovimentoMax: 110,
    },
  },
];

export const insightsService = {
  /**
   * Obtém resumos semanais de bem-estar (FastAPI 8000 com fallback Java 8080)
   */
  async getResumos(casaId: string = FIXED_CASA_ID, token?: string): Promise<ResumoSemanal[]> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta FastAPI (8000)
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.insightsApiUrl}/casas/${casaId}/resumos`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [data];
        }
      } catch (_err) {
        // 2. Tenta Java (8080)
        try {
          const resJava = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/casas/${casaId}/resumos`, {
            headers,
          });

          if (resJava.ok) {
            const data = await resJava.json();
            return Array.isArray(data) ? data : [data];
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    return FALLBACK_RESUMOS;
  },

  /**
   * Obtém dias atípicos detectados pelo modelo de aprendizado de máquina
   */
  async getDiasAtipicos(casaId: string = FIXED_CASA_ID, token?: string): Promise<DiaAtipico[]> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta FastAPI (8000)
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.insightsApiUrl}/casas/${casaId}/dias-atipicos`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [data];
        }
      } catch (_err) {
        // 2. Tenta Java (8080)
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/casas/${casaId}/dias-atipicos`,
            { headers }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            return Array.isArray(data) ? data : [data];
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    return FALLBACK_DIAS_ATIPICOS;
  },
};
