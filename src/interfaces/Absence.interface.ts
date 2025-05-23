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
  data_retorno: string;
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
