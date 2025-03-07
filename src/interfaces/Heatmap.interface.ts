export interface iHeatmapData {
  x: string[];
  y: string[] | number[];
  z: (string | number | null)[][];
}

export interface iInd {
  data_registro: string;
  linha?: number;
  turno?: string;
  [key: string]: string | number | undefined;
}