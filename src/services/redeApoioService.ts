import { API_CONFIG, fetchWithTimeout, MockStore } from './apiConfig';
import { ContatoApoio, CreateContatoInput, FIXED_IDOSO_ID } from '@/types/zelo';

function normalizeContato(raw: any): ContatoApoio {
  return {
    id: String(raw.id || raw.contatoId || `contato-${Date.now()}`),
    idosoId: raw.idosoId || FIXED_IDOSO_ID,
    nome: raw.nome || 'Contato de Apoio',
    parentesco: raw.parentesco || raw.papel || 'Familiar',
    telefone: raw.telefone || '',
    ordemPrioridade: raw.ordemPrioridade !== undefined ? raw.ordemPrioridade : (raw.ordem || 1),
    notificarPor: raw.notificarPor || raw.canal || 'WHATSAPP',
  };
}

export const redeApoioService = {
  /**
   * Obtém a lista de contatos da rede de apoio do idoso (.NET com fallback Java 8080)
   */
  async getContatos(idosoId: string = FIXED_IDOSO_ID, token?: string): Promise<ContatoApoio[]> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/idosos/${idosoId}/contatos`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.content || [];
          return list.map(normalizeContato).sort((a: ContatoApoio, b: ContatoApoio) => a.ordemPrioridade - b.ordemPrioridade);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/idosos/${idosoId}/contatos`,
            { headers }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            const list = Array.isArray(data) ? data : data.content || [];
            return list.map(normalizeContato).sort((a: ContatoApoio, b: ContatoApoio) => a.ordemPrioridade - b.ordemPrioridade);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const items = await MockStore.getContatos();
    return items
      .filter((c) => c.idosoId === idosoId)
      .map(normalizeContato)
      .sort((a, b) => a.ordemPrioridade - b.ordemPrioridade);
  },

  /**
   * Adiciona um novo membro à rede de apoio (.NET ou Java)
   */
  async createContato(dados: CreateContatoInput, token?: string): Promise<ContatoApoio> {
    if (!API_CONFIG.useMock) {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        ...dados,
        papel: dados.parentesco,
        canal: dados.notificarPor,
        ordem: dados.ordemPrioridade,
      };

      // 1. Tenta .NET
      try {
        const res = await fetchWithTimeout(
          `${API_CONFIG.cuidadoApiUrl}/idosos/${dados.idosoId}/contatos`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeContato(data);
        }
      } catch (_err) {
        // 2. Tenta Java Mirror
        try {
          const resJava = await fetchWithTimeout(
            `${API_CONFIG.monitorApiUrl}/idosos/${dados.idosoId}/contatos`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            }
          );

          if (resJava.ok) {
            const data = await resJava.json();
            return normalizeContato(data);
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) throw _javaErr;
        }
      }
    }

    const novoContato: ContatoApoio = {
      id: `contato-${Date.now()}`,
      idosoId: dados.idosoId,
      nome: dados.nome,
      parentesco: dados.parentesco,
      telefone: dados.telefone,
      ordemPrioridade: dados.ordemPrioridade,
      notificarPor: dados.notificarPor,
    };

    const contatos = await MockStore.getContatos();
    contatos.push(novoContato);
    await MockStore.saveContatos(contatos);

    return novoContato;
  },
};
