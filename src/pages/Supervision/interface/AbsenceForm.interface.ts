// cSpell: words usuario
export interface iAbsenceForm {
  data_occ: string;
  data_registro?: string;
  hora_registro?: string;
  turno: string;
  tipo: string;
  nome: string;
  motivo: string;
  setor: string;
  usuario?: string;
}