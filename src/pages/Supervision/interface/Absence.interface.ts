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
