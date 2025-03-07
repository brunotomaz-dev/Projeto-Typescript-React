export interface iInfoIHM {
  recno: number;  // cSpell: words recno
  fabrica: number;
  linha: number;
  maquina_id: string;
  turno: string;
  status: string;
  data_registro: string;
  hora_registro: string;
  motivo: string;
  equipamento: string;
  problema: string;
  causa: string;
  os_numero: string;
  operador_id: string;
  data_registro_ihm: string;
  hora_registro_ihm: string;
  s_backup: string;
  data_hora: string;
  data_hora_final: string;
  tempo: number;
}
