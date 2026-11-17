import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIXED_CASA_ID,
  FIXED_IDOSO_ID,
  FIXED_LEMBRETE_ID,
  Lembrete,
  ContatoApoio,
  Alerta,
  CasaStatus,
  LembreteHoje,
} from '@/types/zelo';

declare const process: {
  env: Record<string, string | undefined>;
};

export const API_CONFIG = {
  cuidadoApiUrl: process.env.EXPO_PUBLIC_CUIDADO_API_URL || 'http://localhost:5080/api/v1',
  monitorApiUrl: process.env.EXPO_PUBLIC_MONITOR_API_URL || 'http://localhost:8080/api/v1',
  insightsApiUrl: process.env.EXPO_PUBLIC_INSIGHTS_API_URL || 'http://localhost:8000/api/v1',
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  fallbackDemo: process.env.EXPO_PUBLIC_FALLBACK_DEMO !== 'false',
  timeoutMs: 3500,
};

/**
 * Utilitário de requisição HTTP com fetch nativo e timeout configurável
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_CONFIG.timeoutMs
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timer);
    return response;
  } catch (error: any) {
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw new Error(`Tempo limite de requisição excedido (${timeoutMs}ms)`);
    }
    throw error;
  }
}

// -------------------------------------------------------------
// DADOS FIXOS INICIAIS
// -------------------------------------------------------------
const INITIAL_LEMBRETES: Lembrete[] = [
  {
    id: FIXED_LEMBRETE_ID,
    idosoId: FIXED_IDOSO_ID,
    descricao: 'Remédio da pressão (Losartana 50mg)',
    horario: '08:00',
    diasSemana: 'SEG,TER,QUA,QUI,SEX,SAB,DOM',
    ativo: true,
    criadoEm: '2026-11-15T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000002002',
    idosoId: FIXED_IDOSO_ID,
    descricao: 'Vitamina D (gotas pós-almoço)',
    horario: '12:30',
    diasSemana: 'SEG,QUA,SEX',
    ativo: true,
    criadoEm: '2026-11-15T12:30:00Z',
  },
];

const INITIAL_LEMBRETES_HOJE: LembreteHoje[] = [
  {
    id: '00000000-0000-0000-0000-000000003001',
    lembreteId: FIXED_LEMBRETE_ID,
    descricao: 'Remédio da pressão (Losartana 50mg)',
    horario: '08:00',
    tomado: false,
    tomadoEm: null,
  },
];

const INITIAL_CONTATOS: ContatoApoio[] = [
  {
    id: '00000000-0000-0000-0000-000000004001',
    idosoId: FIXED_IDOSO_ID,
    nome: 'Ana Oliveira (Filha)',
    parentesco: 'Filha',
    telefone: '(11) 98765-4321',
    ordemPrioridade: 1,
    notificarPor: 'WHATSAPP',
  },
  {
    id: '00000000-0000-0000-0000-000000004002',
    idosoId: FIXED_IDOSO_ID,
    nome: 'Seu José (Vizinho)',
    parentesco: 'Vizinho',
    telefone: '(11) 97654-3210',
    ordemPrioridade: 2,
    notificarPor: 'LIGACAO',
  },
];

const INITIAL_ALERTAS: Alerta[] = [
  {
    id: '00000000-0000-0000-0000-000000005001',
    casaId: FIXED_CASA_ID,
    regraId: 'R1_LEVANTAR_ATRASADO',
    origem: 'SENSOR_PRESENCA',
    grau: 'ALTO',
    estado: 'AGUARDANDO_IDOSO',
    mensagem: 'Dona Maria não levantou no horário habitual (mais de 40 min de atraso).',
    disparadoEm: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    confirmadoPor: null,
    confirmadoEm: null,
    desfecho: null,
    observacao: null,
    escaladoPara: 'Ana Oliveira (Filha)',
  },
];

const INITIAL_CASA_STATUS: CasaStatus = {
  id: FIXED_CASA_ID,
  nomeIdoso: 'Dona Maria',
  estado: 'ALERTA',
  ultimoEventoEm: new Date().toISOString(),
  alertaAtivoId: '00000000-0000-0000-0000-000000005001',
  mensagemStatus: 'Alerta ativo: Dona Maria ainda não respondeu ao check-in matinal.',
  totalAlertasHoje: 1,
};

// -------------------------------------------------------------
// ARMAZENAMENTO LOCAL RESILIENTE PARA DEMONSTRAÇÃO E MOCK
// -------------------------------------------------------------
const STORAGE_KEYS = {
  lembretes: '@zelo:mock_lembretes',
  lembretesHoje: '@zelo:mock_lembretes_hoje',
  contatos: '@zelo:mock_contatos',
  alertas: '@zelo:mock_alertas',
  casaStatus: '@zelo:mock_casa_status',
};

export const MockStore = {
  async getLembretes(): Promise<Lembrete[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.lembretes);
      if (data) return JSON.parse(data);
    } catch (_e) {}
    await AsyncStorage.setItem(STORAGE_KEYS.lembretes, JSON.stringify(INITIAL_LEMBRETES));
    return INITIAL_LEMBRETES;
  },

  async saveLembretes(items: Lembrete[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.lembretes, JSON.stringify(items));
  },

  async getLembretesHoje(): Promise<LembreteHoje[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.lembretesHoje);
      if (data) return JSON.parse(data);
    } catch (_e) {}
    await AsyncStorage.setItem(STORAGE_KEYS.lembretesHoje, JSON.stringify(INITIAL_LEMBRETES_HOJE));
    return INITIAL_LEMBRETES_HOJE;
  },

  async saveLembretesHoje(items: LembreteHoje[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.lembretesHoje, JSON.stringify(items));
  },

  async getContatos(): Promise<ContatoApoio[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.contatos);
      if (data) return JSON.parse(data);
    } catch (_e) {}
    await AsyncStorage.setItem(STORAGE_KEYS.contatos, JSON.stringify(INITIAL_CONTATOS));
    return INITIAL_CONTATOS;
  },

  async saveContatos(items: ContatoApoio[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.contatos, JSON.stringify(items));
  },

  async getAlertas(): Promise<Alerta[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.alertas);
      if (data) return JSON.parse(data);
    } catch (_e) {}
    await AsyncStorage.setItem(STORAGE_KEYS.alertas, JSON.stringify(INITIAL_ALERTAS));
    return INITIAL_ALERTAS;
  },

  async saveAlertas(items: Alerta[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.alertas, JSON.stringify(items));
  },

  async getCasaStatus(): Promise<CasaStatus> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.casaStatus);
      if (data) return JSON.parse(data);
    } catch (_e) {}
    await AsyncStorage.setItem(STORAGE_KEYS.casaStatus, JSON.stringify(INITIAL_CASA_STATUS));
    return INITIAL_CASA_STATUS;
  },

  async saveCasaStatus(status: CasaStatus): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.casaStatus, JSON.stringify(status));
  },
};
