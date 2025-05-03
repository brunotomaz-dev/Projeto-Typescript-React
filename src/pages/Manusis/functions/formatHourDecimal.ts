// Função para converter decimal de horas em formato legível (horas ou minutos)
export const formatHourDecimal = (decimalHours: number | string): string => {
  if (!decimalHours && decimalHours !== 0) return '-';

  // Converter para número caso venha como string
  const hours = typeof decimalHours === 'string' ? parseFloat(decimalHours) : decimalHours;

  // Converter para minutos
  const totalMinutes = hours * 60;

  // Se for menos de uma hora, mostrar em minutos
  if (hours < 1) {
    return `${Math.round(totalMinutes)} minutos`;
  }

  // Se for hora exata, mostrar apenas horas
  if (hours % 1 === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  // Caso contrário, mostrar horas e minutos
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  return `${wholeHours} ${wholeHours === 1 ? 'hora' : 'horas'} e ${minutes} minutos`;
};
