// cSpell: words usuario
export interface iAbsenceForm {
  data_occ: string;
  turno: string;
  tipo: string;
  nome: string;
  motivo: string;
  setor: string;
  data_retorno?: string; // Campo opcional para data de retorno
  usuario?: string; // Campo preenchido automaticamente na submissão
}
