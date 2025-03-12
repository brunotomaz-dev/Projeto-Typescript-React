// cSpell: words recno usuario presencas saida panificacao lideranca

export interface iAbsence {
  data_registro: string;
  hora_registro: string;
  turno: string;
  motivo: string;
  setor: string;
  nome: string;
  recno?: number;
  tipo: string;
  usuario: string;
  data_occ: string;
}

export interface iPresence {
  recno: number;
  panificacao: number;
  forno: number;
  pasta: number;
  recheio: number;
  embalagem: number;
  lideranca: number;
  data_registro: string;
  hora_registro: string;
  turno: string;
  usuario: string;
}