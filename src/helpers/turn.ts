import { TurnoID } from "./constants";

// Retorna o turno atual baseado na hora do sistema
export const getShift = (): TurnoID => {
  const now = new Date();
  const hour = now.getHours();
  const shift = hour >= 8 && hour < 16 ? "MAT"
    : hour >= 16 && hour < 24 ? "VES"
    : "NOT";
  return shift;
};

// Retorna o turno atual baseado na hora informada - 'hh:mm:ss'
export const getShiftByTime = (time: string): TurnoID => {
  const [hour] = time.split(":").map(Number);
  const shift = hour >= 8 && hour < 16 ? "MAT"
    : hour >= 16 && hour < 24 ? "VES"
    : "NOT";
  return shift;
}