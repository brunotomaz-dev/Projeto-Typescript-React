export interface iProduction {
  recno: number;
  linha: number;
  maquina_id: string;
  data_registro: string;
  turno: string;
  produto: string;
  bdj_retrabalho: number;
  bdj_vazias: number;
  descarte_paes: number;
  descarte_pasta: number;
  descarte_paes_pasta: number;
  total_ciclos: number;
  total_produzido_sensor: number;
  total_produzido: number;
}