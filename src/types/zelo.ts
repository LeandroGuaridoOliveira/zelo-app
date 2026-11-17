/**
 * Modelos de Domínio e Interfaces do Ecossistema Zelo
 */

export const FIXED_CASA_ID = '00000000-0000-0000-0000-000000000100';
export const FIXED_IDOSO_ID = '00000000-0000-0000-0000-000000000010';
export const USER_MARIA_ID = '00000000-0000-0000-0000-000000000001';
export const USER_ANA_ID = '00000000-0000-0000-0000-000000000002';
export const USER_JOSE_ID = '00000000-0000-0000-0000-000000000003';
export const FIXED_LEMBRETE_ID = '00000000-0000-0000-0000-000000002001';

export type PapelUsuario = 'IDOSO' | 'FAMILIAR' | 'GUARDIAO' | 'ADMIN' | 'SERVICO';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  casaId?: string;
  idosoId?: string;
  telefone?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  usuario: Usuario;
}

export type EstadoCasa = 'NORMAL' | 'ATENCAO' | 'ALERTA' | 'EMERGENCIA';

export interface CasaStatus {
  id: string;
  nomeIdoso: string;
  estado: EstadoCasa;
  ultimoEventoEm: string;
  alertaAtivoId?: string | null;
  mensagemStatus: string;
  totalAlertasHoje: number;
}

export type GravidadeAlerta = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type EstadoAlerta =
  | 'DISPARADO'
  | 'AGUARDANDO_IDOSO'
  | 'ESCALADO'
  | 'CONFIRMADO'
  | 'ENCERRADO';

export type DesfechoAlerta =
  | 'FALSO_ALARME'
  | 'RESOLVIDO_CONTATO'
  | 'VISITA_FEITA'
  | 'SOCORRO_ACIONADO';

export type OrigemAlerta =
  | 'SENSOR_PRESENCA'
  | 'SENSOR_PORTA'
  | 'BOTAO_EMERGENCIA'
  | 'RELOGIO';

export interface Alerta {
  id: string;
  casaId: string;
  regraId?: string;
  origem: OrigemAlerta;
  grau: GravidadeAlerta;
  estado: EstadoAlerta;
  mensagem: string;
  disparadoEm: string;
  confirmadoPor?: string | null;
  confirmadoEm?: string | null;
  desfecho?: DesfechoAlerta | null;
  observacao?: string | null;
  escaladoPara?: string | null;
}

export interface ConfirmarAlertaRequest {
  cuidadorId: string;
  nomeCuidador?: string;
}

export interface DesfechoAlertaRequest {
  desfecho: DesfechoAlerta;
  observacao?: string;
}

export type ClassificacaoCheckin = 'BEM' | 'AJUDA' | 'INCONCLUSIVO';
export type OrigemClassificacao = 'IA' | 'PALAVRAS_CHAVE' | 'MANUAL';

export interface CheckinRequest {
  alertaId: string;
  respostaTexto: string;
}

export interface CheckinResponse {
  alertaId: string;
  mensagem: string;
  classificacao: ClassificacaoCheckin;
  origem: OrigemClassificacao;
  processadoEm: string;
}

export interface Lembrete {
  id: string;
  idosoId: string;
  descricao: string;
  horario: string; // formato "HH:mm"
  diasSemana: string; // "SEG,TER,QUA,QUI,SEX,SAB,DOM"
  ativo: boolean;
  criadoEm?: string;
}

export interface CreateLembreteInput {
  idosoId: string;
  descricao: string;
  horario: string;
  diasSemana: string;
}

export interface UpdateLembreteInput {
  descricao?: string;
  horario?: string;
  diasSemana?: string;
  ativo?: boolean;
}

export interface LembreteHoje {
  id: string; // id do registro do dia
  lembreteId: string;
  descricao: string;
  horario: string;
  tomado: boolean;
  tomadoEm?: string | null;
}

export type CanalNotificacao = 'SMS' | 'WHATSAPP' | 'LIGACAO';

export interface ContatoApoio {
  id: string;
  idosoId: string;
  nome: string;
  parentesco: string;
  telefone: string;
  ordemPrioridade: number;
  notificarPor: CanalNotificacao;
}

export interface CreateContatoInput {
  idosoId: string;
  nome: string;
  parentesco: string;
  telefone: string;
  ordemPrioridade: number;
  notificarPor: CanalNotificacao;
}

export interface ResumoSemanal {
  casaId: string;
  semanaInicio: string;
  texto: string;
  metricas: {
    totalEventosPresenca?: number;
    horarioLevantarMedio?: string;
    diasAtipicos?: number;
    lembretesCumpridosPct?: number;
  };
  modelo: string;
  geradoEm: string;
}

export interface DiaAtipico {
  data: string;
  score: number;
  atipico: boolean;
  atributos: {
    levantarMinutos?: number;
    eventosMadrugada?: number;
    tempoSemMovimentoMax?: number;
  };
}
