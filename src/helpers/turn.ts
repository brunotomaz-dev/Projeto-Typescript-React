import { format, startOfDay } from 'date-fns';
import { TurnoID } from './constants';

// Retorna o turno atual baseado na hora do sistema
export const getShift = (): TurnoID => {
  const now = new Date();
  const hour = now.getHours();
  const shift = hour >= 8 && hour < 16 ? 'MAT' : hour >= 16 && hour < 24 ? 'VES' : 'NOT';
  return shift;
};

// Retorna o turno atual baseado na hora informada - 'hh:mm:ss'
export const getShiftByTime = (time: string): TurnoID => {
  const [hour] = time.split(':').map(Number);
  const shift = hour >= 8 && hour < 16 ? 'MAT' : hour >= 16 && hour < 24 ? 'VES' : 'NOT';
  return shift;
};

// Verifica o turno e retorna se algum deve ser desabilitado
export const getDisabledTurns = (date: string) => {
  // Data atual
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  // Se a data selecionada for diferente da hoje mão desabilita turno
  if (date !== today) {
    return {};
  }

  // Retorno
  const result: Record<string, boolean> = {};

  // Obter o turno atual
  const currentShift = getShift();

  switch (currentShift) {
    case 'NOT':
      result.MAT = true;
      result.VES = true;
      break;
    case 'MAT':
      result.VES = true;
      break;
  }

  return result;
};
