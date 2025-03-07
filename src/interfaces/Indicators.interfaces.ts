// cSpell: words eficiencia producao
export interface iEficiencia extends iIndicator {
  
  tempo_esperado: number;
  total_produzido: number;
  producao_esperada: number;
  eficiencia: number;
}

interface iIndicator {
  fabrica: number;
  linha: number;
  maquina_id: string;
  turno: string;
  data_registro: string;
  tempo: number;
  desconto: number; 
  excedente: number;
}

export interface iPerformance extends iIndicator {
  performance: number;
}

export interface iRepair extends iIndicator {
  reparo: number;
}