import { format } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { getPresenceData, getProduction } from '../../../api/apiRequests';
import { ColorsSTM } from '../../../helpers/constants';
import { iPresence } from '../../../interfaces/Absence.interface';
import { iProduction } from '../../ProductionLive/interfaces/production.interface';

interface iPresenceTotal {
  data_registro: string;
  turno: string;
  quantidade: number;
}

interface iProductionTotal {
  data_registro: string;
  turno: string;
  total_produzido: number;
}

interface iHeatmapBxPeople {
  x: string[]; // dias
  y: string[]; // turnos
  z: (number | string)[]; // valores
}

const HeatmapBxPeople: React.FC = () => {
  /* ------------------------------------------------- Datas Do Mês ------------------------------------------------- */
  // Hoje
  const now = new Date();
  // Primeiro dia do mês atual
  const firstDateOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Último dia do mês atual
  const lastDateOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Ajustar para o formato yyyy-mm-dd
  const currentMonthBeginningDateString = format(firstDateOfCurrentMonth, 'yyyy-MM-dd');
  const currentMonthFinalDateString = format(lastDateOfCurrentMonth, 'yyyy-MM-dd');

  /* -------------------------------------------------- Local State ------------------------------------------------- */
  const [presenceTotal, setPresenceTotal] = useState<iPresenceTotal[]>([]);
  const [productionTotal, setProductionTotal] = useState<iProductionTotal[]>([]);

  /* ---------------------------------------------- Funções Auxiliares ---------------------------------------------- */
  // Mapa dos turnos para ordenação
  // Se as datas são iguais ordena pelo turno
  const shiftOrder: Record<string, number> = {
    NOT: 1,
    MAT: 2,
    VES: 3,
  };

  // Ordena os dados de presença
  const orderPresence = (data: iPresence[]): iPresence[] => {
    // Confirma se há dados
    if (!data?.length) return [];

    // Ordena os dados por data
    data.sort((a, b) => {
      const dateA = new Date(a.data_registro).getTime();
      const dateB = new Date(b.data_registro).getTime();
      // Se a data for diferente ordena e retorna
      if (dateA !== dateB) return dateA - dateB;

      // Ordena pelo turno, se o turno não existir retorna 999
      return (shiftOrder[a.turno] || 999) - (shiftOrder[b.turno] || 999);
    });

    return data;
  };

  // Soma os presentes
  const sumPresence = (data: iPresence[]): iPresenceTotal[] => {
    // Confirma se há dados
    if (!data?.length) return [];

    // Mapear dados de todos setores, somando
    const mappedData = data.map((item) => {
      // Extrai o dia da data_registro (de 2025-04-25 para 25)
      const day = item.data_registro.split('-')[2];

      // Soma os valores dos setores
      const quantidade =
        (Number(item.embalagem) || 0) +
        (Number(item.forno) || 0) +
        (Number(item.lideranca) || 0) +
        (Number(item.panificacao) || 0) +
        (Number(item.pasta) || 0) +
        (Number(item.recheio) || 0);

      // Retorna o novo objeto
      return {
        data_registro: day,
        turno: item.turno,
        quantidade,
      };
    });

    return mappedData;
  };

  // Soma da produção
  const sumProduction = (data: iProduction[]): iProductionTotal[] => {
    // Confirma se há dados
    if (!data || data.length === 0) return [];

    // Agrupar por data_registro e turno
    const groupedData = data.reduce((acc: Record<string, iProductionTotal>, item: iProduction) => {
      // Extrai apenas o dia da data_registro (de 2025-04-25 para 25)
      const day = item.data_registro.split('-')[2];

      // Cria uma chave única
      const key = `${day}-${item.turno}`;

      // Se não existir, cria o objeto
      if (!acc[key]) {
        acc[key] = {
          data_registro: day,
          turno: item.turno,
          total_produzido: 0,
        };
      }

      // Soma o total produzido
      acc[key].total_produzido += Number(item.total_produzido) || 0;

      return acc;
    }, {});

    // Converte o objeto em um array
    const result = Object.values(groupedData);

    // Ordena os dados por data
    result.sort((a, b) => {
      // Se as datas são diferentes ordena e retorna
      if (a.data_registro !== b.data_registro) {
        return Number(a.data_registro) - Number(b.data_registro);
      }

      return (shiftOrder[a.turno] || 999) - (shiftOrder[b.turno] || 999);
    });

    return result;
  };

  /* ---------------------------------------------------- HOOK's ---------------------------------------------------- */
  // UseMemo para evitar re-renderizações desnecessárias
  const bxPeople = useMemo((): iHeatmapBxPeople => {
    // Se não houver dados, retorna vazio
    if (!presenceTotal?.length || !productionTotal?.length) return { x: [], y: [], z: [] };

    // Cria um array com todos os dias do mês atual
    const days = Array.from({ length: lastDateOfCurrentMonth.getDate() }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );

    // Mapeia os dados de produção
    // ({data_registro: '25', turno: 'MAT', total_produzido: 100} para {'25-MAT': 100})
    const productionMap: Record<string, number> = {};
    productionTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      productionMap[key] = item.total_produzido;
    });

    // Mapeia os dados de presença
    // ({data_registro: '25', turno: 'MAT', quantidade: 100} para {'25-MAT': 100})
    const presenceMap: Record<string, number> = {};
    presenceTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      presenceMap[key] = item.quantidade;
    });

    // Arrey para os valores
    const values: (number | '-')[] = [];

    // Combinação de data e turno
    const shifts = ['NOT', 'MAT', 'VES'];
    for (const day of days) {
      for (const shift of shifts) {
        // Cria a chave
        const key = `${day}-${shift}`;

        // Verifica se existe produção e presença
        const productionValue = productionMap[key] || 0;
        const presenceValue = presenceMap[key] || 0;

        // Se não houver produção, retorna '-'
        if (productionValue === 0 || presenceValue === 0) {
          values.push('-');
          continue;
        }

        // Calcula o valor
        const boxes = productionValue / 10;
        const value = Math.round(Number(boxes / presenceValue));

        values.push(value);
      }
    }

    // Retorna o objeto
    return {
      x: days,
      y: shifts,
      z: values,
    };
  }, [presenceTotal, productionTotal, now]);

  /* ----------------------------------------------------- Fetch ---------------------------------------------------- */
  const fetchData = async () => {
    Promise.all([
      // Requisção de presença
      getPresenceData([currentMonthBeginningDateString, currentMonthFinalDateString]),
      // Requisção de produção
      getProduction([currentMonthBeginningDateString, currentMonthFinalDateString]),
    ])
      .then(([presenceData, productionData]) => {
        setPresenceTotal(sumPresence(orderPresence(presenceData)));
        setProductionTotal(sumProduction(productionData));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  /* ---------------------------------------------------- Effect ---------------------------------------------------- */
  // Requisita os dados de presença e produção
  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------------------------------------------------------------------------------------------------------- */
  /*                                                   CHART-OPTION                                                   */
  /* ---------------------------------------------------------------------------------------------------------------- */
  const option = {
    textStyle: {
      fontFamily: 'Poppins',
    },
    title: {
      text: 'Produção de Caixas por Pessoa - 50 cxs',
      left: 'center',
      top: '0%',
      textStyle: {
        fontSize: 24,
        // fontWeight: 'bold',
      },
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `Dia: ${params.data[0]}<br>Turno: ${params.data[1]}<br>Caixas por pessoa: ${params.data[2]}`;
      },
    },
    grid: {
      height: '60%',
      top: '15%',
      left: '5%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: bxPeople.x,
      splitArea: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: bxPeople.y,
      splitArea: {
        show: false,
      },
    },
    visualMap: {
      min: 0,
      max: 60,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      text: ['Alta Produtividade', 'Baixa Produtividade'],
      // Escala de cores de vermelho para verde
      inRange: {
        color: [
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.YELLOW,
          ColorsSTM.YELLOW,
          ColorsSTM.GREEN,
        ],
      },
    },
    series: [
      {
        name: 'Caixas por Pessoa',
        type: 'heatmap',
        data: bxPeople.x.flatMap((dia, i) =>
          bxPeople.y.map((turno, j) => {
            const index = i * bxPeople.y.length + j;
            return [dia, turno, bxPeople.z[index]];
          })
        ),
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: { title: 'Salvar' },
      },
    },
  };

  /* ---------------------------------------------------------------------------------------------------------------- */
  /*                                                      LAYOUT                                                      */
  /* ---------------------------------------------------------------------------------------------------------------- */
  return (
    <Card className='shadow border-0 mb-3 bg-transparent align-items-center py-3'>
      <EChartsReact option={option} style={{ height: '350px', width: '98%' }} />
    </Card>
  );
};

export default HeatmapBxPeople;
