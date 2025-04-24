//cSpell: words secundario solicitacao codigo localizacao nivel descricao classificacao criacao seguranca
export interface iServiceRequirement {
  id: number;
  solicitante: string;
  assunto_principal: string;
  assunto_secundario: string;
  solicitacao: string;
  status_id: number;
  status: string;
  codigo_localizacao_nivel1: string;
  codigo_localizacao_nivel2: string;
  codigo_localizacao_nivel3: string;
  descricao_localizacao_nivel1: string;
  descricao_localizacao_nivel2: string;
  descricao_localizacao_nivel3: string;
  codigo_ativo: string;
  ativo: string;
  classificacao: number;
  data_criacao: string;
  hora_criacao: string;
  numero_ss: string;
  maquina_parada: boolean;
  item_de_seguranca: boolean;
}

export enum SR_Status {
  DRAFT = 1,
  NEW = 2,
  UNDER_ANALYSIS = 3,
  IN_EXECUTION = 4,
  IN_APPROVAL = 5,
  DONE = 6,
  CANCELLED = 7,
  ON_HOLD = 8,
  DISAPPROVED = 9,
  CLOSED = 10,
}