export interface iIndicator {
  linha: number;
  turno: string;
  data_registro: string;
}

export interface iEff extends iIndicator {
  maquina_id: string;
  total_produzido: number;
  eficiencia: number;
}

export interface iRep extends iIndicator {
  reparo: number;
}

export interface iPerf extends iIndicator {
  performance: number;
}
