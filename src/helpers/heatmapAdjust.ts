import { iHeatmapData, iInd } from "../interfaces/Heatmap.interface";


export function heatmapAdjust(data: iInd[], indicator: string): iHeatmapData {
  
  // Filtrar as datas distintas
  const realDates = [...new Set(data.map((item) => item.data_registro))];

  // Criar um array com todas as datas do mês atual formato string 'DD' (01, 02)
  const allDates = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const x = Array.from(
    { length: allDates }, 
    (_, i) => String(i + 1).padStart(2, '0')
  );

  // Filtrar os turnos ou linhas distintas
  const mask = data.some(item => 'turno' in item && item.turno !== undefined);
  
  const y = mask
    ? ['NOT', 'MAT', 'VES']
    : Array.from(new Set(data.map(item => item.linha)))
        .filter((linha): linha is number => linha !== undefined)
        .sort((a, b) => a - b);

  // Remover onde o valor de indicador é 0
  data = indicator === 'eficiencia' ? data.filter((item) => Number(item[indicator]) !== 0) : data;

  // Se a exibição por turno estiver ativa é necessário agrupar por data e turno
  if (mask) {
    const grouped = data.reduce<{ [key: string]: iInd[] }>((acc, curr) => {
      const key = `${curr.data_registro}-${curr.turno}`;
      return { ...acc, [key]: [...(acc[key] || []), curr] };
    }, {});

    data = Object.values(grouped).map((group) => {
      const eficiencia = group.reduce((acc, curr) => acc + Number(curr[indicator]), 0) / group.length;
      return { data_registro: group[0].data_registro, turno: group[0].turno, [indicator]: eficiencia, linha: 0 };
    });
  }

  // Criar um array com todas as combinações de data e turno ou linha
  const all = realDates.flatMap((date) => y.map((turno) => ({ date, turno })));

  // Mapear os valores de eficiencia para o formato correto
  const z = all.map(({ date, turno }) => {
    const item = data.find((item) => item.data_registro === date && item[mask ? 'turno' : 'linha'] === turno);

    // Formatar as datas para 'DD'
    const day = date.split('-')[2];

    const yAdjust = mask ? turno : Number(turno) - 1;

    return item ? [day, yAdjust, Math.round(Number(item[indicator]))] : [day, yAdjust, null];
  });

  return { x, y, z };
}

