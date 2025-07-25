export interface iDetectorData {
  recno?: number;
  data_registro: string;
  hora_registro: string;
  turno: string;
  detector_id: number;
  peso_alto_bandejas: number;
  peso_ok_bandejas: number;
  peso_baixo_bandejas: number;
  peso_alto_media: number;
  peso_ok_media: number;
  peso_baixo_media: number;
  peso_alto_porcentagem: number;
  peso_ok_porcentagem: number;
  peso_baixo_porcentagem: number;
  metal_detectado: number;
  produto: string;
  usuario: string;
}
