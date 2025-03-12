import { TurnoID } from "./constants";

export const getShift = (): TurnoID => {
  const now = new Date();
  const hour = now.getHours();
  const shift = hour >= 8 && hour < 16 ? "MAT"
    : hour >= 16 && hour < 24 ? "VES"
    : "NOT";
  return shift;
};
