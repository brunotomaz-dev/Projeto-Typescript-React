export type TurnoType = 'MAT' | 'VES' | 'NOT';

export interface iCartCount {
  Data_apontamento: string;
  Turno: TurnoType;
  Contagem_Carrinhos: number;
}