// cSpell: words recno usuario presencas saida panificacao lideranca

export interface iAbsence extends iAbsenceForm {
  data_registro: string;
  hora_registro: string;
}

export interface iAbsenceForm {
  recno?: number;
  data_occ: string;
  turno: string;
  tipo: string;
  nome: string;
  setor: string;
  motivo: string;
  usuario?: string;
  data_retorno?: string;
}

export const AbsenceKinds = {
  FALTA: 'Falta',
  ATRASO: 'Atraso',
  AFASTAMENTO: 'Afastamento',
  SAIDA_ANTECIPADA: 'Saída Antecipada',
  REMANEJAMENTO: 'Remanejamento',
  FERIAS: 'Férias',
} as const;

// Lista de tipos de ausência
export type AbsenceType = (typeof AbsenceKinds)[keyof typeof AbsenceKinds];

// Array de tipos de ausência
export const AbsenceTypesArray: AbsenceType[] = Object.values(AbsenceKinds);

// Criando um tipo para os contadores de ausência
export interface AbsenceCounters {
  faltas: number;
  atrasos: number;
  afastamentos: number;
  saidaAntecipada: number;
  remanejados: number;
  ferias: number;
  presencas: number;
}

export interface iPresence extends iPresenceSectors {
  recno?: number;

  data_registro: string;
  hora_registro: string;
  turno: string;
  usuario: string;
}

export interface iPresenceSectors {
  panificacao: number;
  forno: number;
  pasta: number;
  recheio: number;
  embalagem: number;
  lideranca: number;
}
