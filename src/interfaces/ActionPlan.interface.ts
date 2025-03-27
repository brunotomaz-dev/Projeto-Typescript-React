import { TurnoID } from "../helpers/constants";

// cSpell:words descricao contencao solucao responsavel conclusao

export interface iActionPlan {
  recno: number;
  indicador: string;
  prioridade: number;
  impacto: number;
  data_registro: string;
  turno: TurnoID;
  descricao: string;
  causa_raiz: string;
  contencao: string;
  solucao: string;
  feedback: string;
  responsavel: string;
  data_conclusao: string | null;
  conclusao: number;
  lvl: number;
}

export interface iActionPlanFormData extends Omit<iActionPlan, 'data_registro' | 'data_conclusao'> {
  data_registro: Date;
  data_conclusao: Date | null;
}

export interface iActionPlanCards extends iActionPlan {
  dias_aberto: number;
}