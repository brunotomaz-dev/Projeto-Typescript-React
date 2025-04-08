export interface iMaquinaIHM {
  recno: number;
  data_registro: string;
  hora_registro: string;
  fabrica?: number;
  linha: number;
  maquina_id: string;
  equipamento: string;
  motivo: string;
  problema: string;
  causa: string;
  afeta_eff: number;
  operador_id: string;
  os_numero: string;
  s_backup?: number | null;
}