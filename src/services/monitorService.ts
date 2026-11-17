import { API_CONFIG, fetchWithTimeout, MockStore } from './apiConfig';
import {
  Alerta,
  CasaStatus,
  CheckinResponse,
  DesfechoAlerta,
  FIXED_CASA_ID,
  USER_ANA_ID,
} from '@/types/zelo';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(val?: string): boolean {
  return !!val && UUID_REGEX.test(val);
}

/**
 * Extrai com segurança uma string ISO válida a partir de múltiplos candidatos
 * (strings, objetos com campo ocorridoEm/disparadoEm/abertoEm/criadoEm).
 */
export function extractValidIsoDate(...candidates: any[]): string {
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string') {
      const parsed = new Date(c).getTime();
      if (!isNaN(parsed)) return c;
    } else if (typeof c === 'object') {
      const sub = c.ocorridoEm || c.disparadoEm || c.abertoEm || c.criadoEm || c.timestamp;
      if (typeof sub === 'string') {
        const parsed = new Date(sub).getTime();
        if (!isNaN(parsed)) return sub;
      }
    }
  }
  return new Date().toISOString();
}

/**
 * Normaliza os payloads retornados pela API Java (Spring Boot) ou .NET
 * para a interface de domínio Alerta utilizada na UI do aplicativo.
 */
export function normalizeAlerta(raw: any): Alerta {
  const casaId =
    raw.casaId ||
    (raw.casa && (raw.casa.id || raw.casa.casaId)) ||
    FIXED_CASA_ID;

  const regraId =
    raw.regraId ||
    (raw.regra && (typeof raw.regra === 'string' ? raw.regra : raw.regra.id)) ||
    raw.regraTipo ||
    undefined;

  const grau = (raw.grau || raw.gravidade || 'ALTO') as any;

  // Normalização de estados da máquina de estados do Java
  let estado = raw.estado;
  if (estado === 'EM_VERIFICACAO') {
    estado = 'CONFIRMADO';
  } else if (estado === 'RESOLVIDO_PELO_IDOSO') {
    estado = 'ENCERRADO';
  } else if (estado === 'AGUARDANDO_RESPOSTA') {
    estado = 'AGUARDANDO_IDOSO';
  }

  const mensagem =
    raw.mensagem ||
    raw.contexto ||
    raw.descricao ||
    'Alerta registrado na residência monitorada.';

  const disparadoEm = extractValidIsoDate(raw.disparadoEm, raw.abertoEm, raw.criadoEm);

  // Procura confirmação em campos diretos ou dentro das etapas de escalada do Java
  let etapaConfirmada: any = null;
  if (Array.isArray(raw.etapas)) {
    etapaConfirmada = raw.etapas.find(
      (e: any) => e.resposta === 'VOU_VERIFICAR' || !!e.respondidoEm
    );
  }

  const confirmadoPor =
    raw.confirmadoPor ||
    (raw.confirmacao && (raw.confirmacao.nomeContato || raw.confirmacao.contatoId)) ||
    (etapaConfirmada && (etapaConfirmada.nomeContato || etapaConfirmada.contatoId)) ||
    null;

  const confirmadoEm =
    raw.confirmadoEm ||
    (raw.confirmacao && raw.confirmacao.confirmadoEm) ||
    (etapaConfirmada && etapaConfirmada.respondidoEm) ||
    null;

  return {
    id: String(raw.id || raw.alertaId || `alt-${Date.now()}`),
    casaId,
    regraId,
    origem: raw.origem || 'SENSOR_PRESENCA',
    grau,
    estado: estado || 'DISPARADO',
    mensagem,
    disparadoEm,
    confirmadoPor,
    confirmadoEm,
    desfecho: raw.desfecho || null,
    observacao: raw.observacao || null,
    escaladoPara: raw.escaladoPara || null,
  };
}

/**
 * Normaliza StatusCasaDto da API Java ou payload padrão
 */
export function normalizeCasaStatus(raw: any): CasaStatus {
  const alertaAtivo = raw.alertaAberto || raw.alertaAtivo;
  const alertaAtivoId =
    raw.alertaAtivoId !== undefined
      ? raw.alertaAtivoId
      : alertaAtivo
      ? alertaAtivo.id
      : null;

  let mensagem = raw.mensagemStatus;
  if (!mensagem) {
    if (alertaAtivo) {
      mensagem = alertaAtivo.contexto || alertaAtivo.mensagem || 'Alerta ativo na residência.';
    } else {
      mensagem = 'Tudo calmo e dentro da rotina esperada.';
    }
  }

  // Mapeamento preciso do estado da casa para 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'EMERGENCIA'
  let estadoCalculado: 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'EMERGENCIA' = 'NORMAL';
  if (['NORMAL', 'ATENCAO', 'ALERTA', 'EMERGENCIA'].includes(raw.estado)) {
    estadoCalculado = raw.estado;
  } else if (
    alertaAtivo &&
    alertaAtivo.estado !== 'ENCERRADO' &&
    alertaAtivo.estado !== 'RESOLVIDO_PELO_IDOSO'
  ) {
    if (alertaAtivo.origem === 'BOTAO_EMERGENCIA') {
      estadoCalculado = 'EMERGENCIA';
    } else if (
      alertaAtivo.gravidade === 'CRITICO' ||
      alertaAtivo.grau === 'CRITICO'
    ) {
      estadoCalculado = 'ALERTA';
    } else if (
      alertaAtivo.gravidade === 'ATENCAO' ||
      alertaAtivo.grau === 'MEDIO' ||
      alertaAtivo.grau === 'BAIXO'
    ) {
      estadoCalculado = 'ATENCAO';
    } else {
      estadoCalculado = 'ALERTA';
    }
  } else {
    // Sem alertas abertos (ex: Java retorna estadoCasa = 'EM_CASA' ou 'FORA_DE_CASA')
    estadoCalculado = 'NORMAL';
  }

  const ultimoEventoEm = extractValidIsoDate(
    raw.ultimoEventoEm,
    raw.ultimoEvento,
    alertaAtivo?.abertoEm,
    alertaAtivo?.disparadoEm
  );

  return {
    id: raw.id || raw.casaId || FIXED_CASA_ID,
    nomeIdoso: raw.nomeIdoso || 'Dona Maria',
    estado: estadoCalculado,
    ultimoEventoEm,
    alertaAtivoId,
    mensagemStatus: mensagem,
    totalAlertasHoje:
      raw.totalAlertasHoje !== undefined
        ? raw.totalAlertasHoje
        : alertaAtivo
        ? 1
        : 0,
  };
}

/**
 * Normaliza resposta do check-in da API Java com Spring AI
 */
export function normalizeCheckinResponse(raw: any, alertaId: string): CheckinResponse {
  let classificacao = raw.classificacao;
  if (classificacao === 'ESTOU_BEM') {
    classificacao = 'BEM';
  } else if (classificacao === 'PRECISO_AJUDA') {
    classificacao = 'AJUDA';
  } else if (classificacao === 'INCERTO') {
    classificacao = 'INCONCLUSIVO';
  }

  return {
    alertaId: raw.alertaId || alertaId,
    mensagem:
      raw.mensagem ||
      raw.respostaParaIdoso ||
      (classificacao === 'BEM'
        ? 'Que bom saber que você está bem! Sua família foi comunicada.'
        : 'Aviso recebido com urgência! A rede de apoio foi acionada.'),
    classificacao: (classificacao || 'BEM') as any,
    origem: (raw.origem || raw.origemClassificacao || 'IA') as any,
    processadoEm: raw.processadoEm || new Date().toISOString(),
  };
}

export const monitorService = {
  /**
   * Obtém status atualizado da casa monitorada
   */
  async getCasaStatus(casaId: string = FIXED_CASA_ID, token?: string): Promise<CasaStatus> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/casas/${casaId}/status`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          return normalizeCasaStatus(data);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const mock = await MockStore.getCasaStatus();
    return normalizeCasaStatus(mock);
  },

  /**
   * Lista todos os alertas da casa monitorada
   */
  async getAlertas(token?: string): Promise<Alerta[]> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/alertas`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.content || [];
          return list.map(normalizeAlerta);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const mock = await MockStore.getAlertas();
    return mock.map(normalizeAlerta);
  },

  /**
   * Detalhes de um alerta específico
   */
  async getAlertaDetalhe(alertaId: string, token?: string): Promise<Alerta> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/alertas/${alertaId}`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          return normalizeAlerta(data);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const alertas = await MockStore.getAlertas();
    const found = alertas.find((a) => a.id === alertaId);
    if (found) return normalizeAlerta(found);

    throw new Error('Alerta não encontrado.');
  },

  /**
   * Cuidador confirma que "vai verificar" o alerta
   */
  async confirmarAlerta(
    alertaId: string,
    cuidadorId: string,
    nomeCuidador: string = 'Ana (Filha)',
    token?: string
  ): Promise<Alerta> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const validContatoId = isUuid(cuidadorId) ? cuidadorId : USER_ANA_ID;
        const res = await fetchWithTimeout(
          `${API_CONFIG.monitorApiUrl}/alertas/${alertaId}/confirmacao`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              contatoId: validContatoId,
              nomeContato: nomeCuidador,
              cuidadorId: validContatoId,
              nomeCuidador,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeAlerta(data);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const alertas = await MockStore.getAlertas();
    const index = alertas.findIndex((a) => a.id === alertaId);
    if (index >= 0) {
      alertas[index] = {
        ...alertas[index],
        estado: 'CONFIRMADO',
        confirmadoPor: nomeCuidador,
        confirmadoEm: new Date().toISOString(),
      };
      await MockStore.saveAlertas(alertas);

      // Atualiza status da casa
      const status = await MockStore.getCasaStatus();
      status.mensagemStatus = `Alerta confirmado por ${nomeCuidador}. Averiguação em andamento.`;
      await MockStore.saveCasaStatus(status);

      return normalizeAlerta(alertas[index]);
    }

    throw new Error('Alerta não encontrado para confirmação.');
  },

  /**
   * Cuidador registra o desfecho final do alerta
   */
  async registrarDesfecho(
    alertaId: string,
    desfecho: DesfechoAlerta,
    observacao?: string,
    token?: string
  ): Promise<Alerta> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Mapeamento para os enums de desfecho do Java
        const javaDesfecho =
          desfecho === 'FALSO_ALARME' || desfecho === 'RESOLVIDO_CONTATO'
            ? 'ESTAVA_BEM'
            : desfecho === 'SOCORRO_ACIONADO'
            ? 'ENCAMINHADO_EMERGENCIA'
            : 'PRECISOU_AJUDA';

        const res = await fetchWithTimeout(
          `${API_CONFIG.monitorApiUrl}/alertas/${alertaId}/desfecho`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              desfecho: javaDesfecho,
              desfechoApp: desfecho,
              observacao,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeAlerta(data);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const alertas = await MockStore.getAlertas();
    const index = alertas.findIndex((a) => a.id === alertaId);
    if (index >= 0) {
      alertas[index] = {
        ...alertas[index],
        estado: 'ENCERRADO',
        desfecho,
        observacao,
      };
      await MockStore.saveAlertas(alertas);

      // Restaura status da casa para normal se não houver outros alertas ativos
      const status = await MockStore.getCasaStatus();
      status.estado = 'NORMAL';
      status.alertaAtivoId = null;
      status.mensagemStatus = 'Tudo calmo e dentro da rotina esperada.';
      await MockStore.saveCasaStatus(status);

      return normalizeAlerta(alertas[index]);
    }

    throw new Error('Alerta não encontrado para registrar desfecho.');
  },

  /**
   * Idoso responde ao check-in conversacional (analisado por Spring AI / palavras-chave)
   */
  async enviarCheckin(
    alertaId: string,
    respostaTexto: string,
    token?: string
  ): Promise<CheckinResponse> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetchWithTimeout(
          `${API_CONFIG.monitorApiUrl}/alertas/${alertaId}/checkin`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              texto: respostaTexto,
              respostaTexto,
              alertaId,
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeCheckinResponse(data, alertaId);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    // Regra de classificação inteligente (espelho das regras do Spring AI da especificação Zelo)
    const lower = respostaTexto.toLowerCase();
    const isBem =
      lower.includes('estou bem') ||
      lower.includes('tudo bem') ||
      lower.includes('tranquilo') ||
      lower.includes('dormi até mais tarde') ||
      lower.includes('acabei de acordar') ||
      lower.includes('tomei café') ||
      lower.includes('otimo');

    const isAjuda =
      lower.includes('ajuda') ||
      lower.includes('socorro') ||
      lower.includes('caí') ||
      lower.includes('machuquei') ||
      lower.includes('dor') ||
      lower.includes('tontura') ||
      lower.includes('ruim') ||
      lower.includes('mal');

    const classificacao = isAjuda ? 'AJUDA' : isBem ? 'BEM' : 'INCONCLUSIVO';

    // Atualiza estado do alerta no mock
    const alertas = await MockStore.getAlertas();
    const idx = alertas.findIndex((a) => a.id === alertaId);
    if (idx >= 0) {
      if (classificacao === 'BEM') {
        alertas[idx].estado = 'ENCERRADO';
        alertas[idx].desfecho = 'FALSO_ALARME';
        alertas[idx].observacao = `Check-in respondido pelo idoso: "${respostaTexto}"`;

        const status = await MockStore.getCasaStatus();
        status.estado = 'NORMAL';
        status.alertaAtivoId = null;
        status.mensagemStatus = 'Dona Maria respondeu ao check-in e está bem!';
        await MockStore.saveCasaStatus(status);
      } else {
        alertas[idx].estado = 'ESCALADO';
        alertas[idx].grau = 'CRITICO';
        alertas[idx].mensagem = `Dona Maria solicitou ajuda no check-in: "${respostaTexto}"`;

        const status = await MockStore.getCasaStatus();
        status.estado = 'EMERGENCIA';
        status.mensagemStatus = 'Emergência! Idoso solicitou ajuda no check-in.';
        await MockStore.saveCasaStatus(status);
      }
      await MockStore.saveAlertas(alertas);
    }

    return {
      alertaId,
      mensagem:
        classificacao === 'BEM'
          ? 'Que bom saber que você está bem! Sua família foi comunicada.'
          : 'Aviso recebido com urgência! Sua família e a rede de apoio foram acionadas.',
      classificacao,
      origem: 'IA',
      processadoEm: new Date().toISOString(),
    };
  },

  /**
   * Idoso aciona o Botão de Emergência SOS
   */
  async dispararEmergencia(casaId: string = FIXED_CASA_ID, token?: string): Promise<Alerta> {
    if (!API_CONFIG.useMock) {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetchWithTimeout(
          `${API_CONFIG.monitorApiUrl}/casas/${casaId}/emergencia`,
          {
            method: 'POST',
            headers,
          }
        );

        if (res.ok) {
          const data = await res.json();
          return normalizeAlerta(data);
        }
      } catch (err) {
        if (!API_CONFIG.fallbackDemo) throw err;
      }
    }

    const novoAlerta: Alerta = {
      id: `sos-${Date.now()}`,
      casaId,
      origem: 'BOTAO_EMERGENCIA',
      grau: 'CRITICO',
      estado: 'ESCALADO',
      mensagem: 'BOTÃO DE EMERGÊNCIA ACIONADO PELO IDOSO NO APLICATIVO!',
      disparadoEm: new Date().toISOString(),
      confirmadoPor: null,
      confirmadoEm: null,
      desfecho: null,
      observacao: null,
      escaladoPara: 'Ana Oliveira (Filha) e Seu José (Vizinho)',
    };

    const alertas = await MockStore.getAlertas();
    alertas.unshift(novoAlerta);
    await MockStore.saveAlertas(alertas);

    const status = await MockStore.getCasaStatus();
    status.estado = 'EMERGENCIA';
    status.alertaAtivoId = novoAlerta.id;
    status.mensagemStatus =
      'BOTÃO DE EMERGÊNCIA PRESSIONADO! Acionando rede de apoio imediatamente.';
    status.totalAlertasHoje += 1;
    await MockStore.saveCasaStatus(status);

    return novoAlerta;
  },
};
