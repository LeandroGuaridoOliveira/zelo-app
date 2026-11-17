import { API_CONFIG, fetchWithTimeout, MockStore } from './apiConfig';
import {
  Lembrete,
  CreateLembreteInput,
  UpdateLembreteInput,
  LembreteHoje,
  FIXED_IDOSO_ID,
  FIXED_LEMBRETE_ID,
} from '@/types/zelo';

function normalizeLembrete(raw: any): Lembrete {
  return {
    id: String(raw.id || raw.lembreteId || FIXED_LEMBRETE_ID),
    idosoId: raw.idosoId || FIXED_IDOSO_ID,
    descricao: raw.descricao || raw.texto || raw.titulo || 'Medicamento',
    horario: raw.horario || raw.horarioPrevisto || '08:00',
    diasSemana: raw.diasSemana || 'SEG,TER,QUA,QUI,SEX,SAB,DOM',
    ativo: raw.ativo !== undefined ? Boolean(raw.ativo) : true,
    criadoEm: raw.criadoEm || new Date().toISOString(),
  };
}

function normalizeLembreteHoje(raw: any): LembreteHoje {
  const tomado =
    raw.tomado !== undefined
      ? Boolean(raw.tomado)
      : raw.status === 'CONFIRMADO';

  return {
    id: String(raw.id || raw.registroId || `hoje-${Date.now()}`),
    lembreteId: String(raw.lembreteId || FIXED_LEMBRETE_ID),
    descricao: raw.descricao || raw.texto || raw.titulo || 'Medicamento da pressão',
    horario: raw.horario || raw.horarioPrevisto || '08:00',
    tomado,
    tomadoEm: raw.tomadoEm || null,
  };
}

export const lembretesService = {
  /**
   * Lista todos os lembretes cadastrados para o idoso (.NET com fallback Java 8080)
   */
  async getLembretes(idosoId: string = FIXED_IDOSO_ID, token?: string): Promise<Lembrete[]> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta .NET (5080)
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/idosos/${idosoId}/lembretes`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.content || [];
          return list.map(normalizeLembrete);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror (8080)
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/idosos/${idosoId}/lembretes`,
            { headers }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            const list = Array.isArray(data) ? data : data.content || [];
            return list.map(normalizeLembrete);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const items = await MockStore.getLembretes();
    return items.filter((l) => l.idosoId === idosoId).map(normalizeLembrete);
  },

  /**
   * Lista os lembretes programados para o dia de hoje
   */
  async getLembretesHoje(idosoId: string = FIXED_IDOSO_ID, token?: string): Promise<LembreteHoje[]> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta .NET (5080)
      try {
        const res = await fetchWithTimeout(
          `${API_CONFIG.cuidadoApiUrl}/idosos/${idosoId}/lembretes/hoje`,
          { headers }
        );

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.content || [];
          return list.map(normalizeLembreteHoje);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror (8080)
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/idosos/${idosoId}/lembretes/hoje`,
            { headers }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            const list = Array.isArray(data) ? data : data.content || [];
            return list.map(normalizeLembreteHoje);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const items = await MockStore.getLembretesHoje();
    return items.map(normalizeLembreteHoje);
  },

  /**
   * Cria um novo lembrete de remédio na API .NET ou Java
   */
  async createLembrete(dados: CreateLembreteInput, token?: string): Promise<Lembrete> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        ...dados,
        titulo: dados.descricao,
        texto: dados.descricao,
        horarioPrevisto: dados.horario,
      };

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(
          `${API_CONFIG.cuidadoApiUrl}/idosos/${dados.idosoId}/lembretes`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeLembrete(data);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror (8080)
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/idosos/${dados.idosoId}/lembretes`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            return normalizeLembrete(data);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const novoLembrete: Lembrete = {
      id: `lembrete-${Date.now()}`,
      idosoId: dados.idosoId,
      descricao: dados.descricao,
      horario: dados.horario,
      diasSemana: dados.diasSemana,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };

    const lembretes = await MockStore.getLembretes();
    lembretes.push(novoLembrete);
    await MockStore.saveLembretes(lembretes);

    // Adiciona também na lista de hoje para teste imediato
    const hojeItems = await MockStore.getLembretesHoje();
    hojeItems.push({
      id: `hoje-${Date.now()}`,
      lembreteId: novoLembrete.id,
      descricao: novoLembrete.descricao,
      horario: novoLembrete.horario,
      tomado: false,
      tomadoEm: null,
    });
    await MockStore.saveLembretesHoje(hojeItems);

    return novoLembrete;
  },

  /**
   * Atualiza dados de um lembrete existente na API .NET ou Java
   */
  async updateLembrete(id: string, dados: UpdateLembreteInput, token?: string): Promise<Lembrete> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        ...dados,
        titulo: dados.descricao,
        texto: dados.descricao,
        horarioPrevisto: dados.horario,
      };

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/lembretes/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          return normalizeLembrete(data);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror
        try {
          const resJava = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/lembretes/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
          });

          if (resJava.ok) {
            const data = await resJava.json();
            return normalizeLembrete(data);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const lembretes = await MockStore.getLembretes();
    const index = lembretes.findIndex((l) => l.id === id);
    if (index >= 0) {
      lembretes[index] = {
        ...lembretes[index],
        ...dados,
      };
      await MockStore.saveLembretes(lembretes);
      return normalizeLembrete(lembretes[index]);
    }

    throw new Error('Lembrete não encontrado para atualização.');
  },

  /**
   * Exclui um lembrete na API .NET ou Java
   */
  async deleteLembrete(id: string, token?: string): Promise<{ success: boolean }> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/lembretes/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (res.ok) return { success: true };
      } catch (_err) {
        // 2. Tenta Java Mirror
        try {
          const resJava = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/lembretes/${id}`, {
            method: 'DELETE',
            headers,
          });

          if (resJava.ok) return { success: true };
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const lembretes = await MockStore.getLembretes();
    const filtered = lembretes.filter((l) => l.id !== id);
    await MockStore.saveLembretes(filtered);

    const hoje = await MockStore.getLembretesHoje();
    const filteredHoje = hoje.filter((h) => h.lembreteId !== id);
    await MockStore.saveLembretesHoje(filteredHoje);

    return { success: true };
  },

  /**
   * Idoso confirma que tomou o remédio programado para hoje
   */
  async confirmarLembreteHoje(registroHojeId: string, token?: string): Promise<LembreteHoje> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(
          `${API_CONFIG.cuidadoApiUrl}/lembretes/registros/${registroHojeId}/confirmacao`,
          {
            method: 'POST',
            headers,
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeLembreteHoje(data);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/lembretes/registros/${registroHojeId}/confirmacao`,
            {
              method: 'POST',
              headers,
            }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            return normalizeLembreteHoje(data);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const hoje = await MockStore.getLembretesHoje();
    const index = hoje.findIndex((h) => h.id === registroHojeId);
    if (index >= 0) {
      hoje[index] = {
        ...hoje[index],
        tomado: true,
        tomadoEm: new Date().toISOString(),
      };
      await MockStore.saveLembretesHoje(hoje);
      return normalizeLembreteHoje(hoje[index]);
    }

    throw new Error('Registro de lembrete não encontrado.');
  },
};
