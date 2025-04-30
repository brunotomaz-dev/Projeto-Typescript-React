//cSpell: disable

export enum OS_Status {
  OPENED = 1,
  COMPLETED_NOTES = 2,
  CLOSED = 3,
  CANCELED = 4,
  ON_HOLD = 5,
  ON_APPROVAL = 6,
  SCHEDULED = 7,
  DISAPPROVED = 8,
}

export enum Service_Type {
  PREVENTIVA = 1,
  CORRETIVA = 4,
  PREVENTIVA_PONTUAL = 6,
  CORRETIVA_PROGRAMADA = 7,
}

export interface iMaintenanceOrders {
  assunto_principal: string;
  assunto_secundario: string;
  ativo: string;
  codigo_ativo: string;
  codigo_localizacao_nivel1: string;
  codigo_localizacao_nivel2: string;
  codigo_localizacao_nivel3: string;
  criado_por: string;
  data_conclusao: string;
  data_criacao: string;
  descricao: string;
  descricao_localizacao_nivel1: string;
  descricao_localizacao_nivel2: string;
  descricao_localizacao_nivel3: string;
  fim_atendimento: string;
  hora_fim_atendimento: string;
  historico_servico_executado: string;
  hora_conclusao: string;
  hora_criacao: string;
  id: number;
  hora_inicio_atendimento: string;
  inicio_atendimento: string;
  natureza_manutencao: string;
  numero_os: string;
  numero_ss: number;
  prioridade: number;
  prioridade_calculada: number;
  responsavel_manutencao: string;
  solicitante_ss: string;
  status: string;
  status_id: number;
  tempo_estimado_trabalho: number;
  tempo_trabalho_realizado: number;
  tipo_manutencao: string;
}
