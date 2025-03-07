export interface iMaquinaInfo {
  recno : number;
  maquina_id: string;
  status: string;
  produto: string;
  ciclo_1_min: number;
  ciclo_15_min: number;
  contagem_total_ciclos: number;
  contagem_total_produzido: number;
  turno: string;
  data_registro: string;
  hora_registro: string;
  tempo_parada: number;
  tempo_rodando: number;

}
