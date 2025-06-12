export interface iQualidadeIHMCreate {
  linha: number;
  maquina_id: string;
  bdj_vazias: number;
  bdj_retrabalho: number;
  descarte_pasta: number;
  descarte_paes: number;
  descarte_paes_pasta: number;
  reprocesso_pasta: number;
  reprocesso_paes: number;
  reprocesso_paes_pasta: number;
  reprocesso_bdj: number;
  data_registro: string;
  hora_registro: string;
}

export interface iQualidadeIHM extends iQualidadeIHMCreate {
  recno: number;
}
