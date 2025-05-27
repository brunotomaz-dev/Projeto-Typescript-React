import { format, subMonths } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { getPresenceData, getProduction } from '../../../api/apiRequests';
import { ColorsSTM } from '../../../helpers/constants';
import { iPresence } from '../../../interfaces/Absence.interface';
import { iProduction } from '../../ProductionLive/interfaces/production.interface';
import Gauge from './sfm.gaugeBoxes';

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
  /* ------------------------------------------------- States ------------------------------------------------- */
  const [presenceTotal, setPresenceTotal] = useState<iPresenceTotal[]>([]);
  const [productionTotal, setProductionTotal] = useState<iProductionTotal[]>([]);
  const [currentMonthAverage, setCurrentMonthAverage] = useState<number>(0);
  const [lastMonthAverage, setLastMonthAverage] = useState<number>(0);

  /* ------------------------------------------------- Datas Do Mês ------------------------------------------------- */
  // Hoje
  const now = new Date();
  // Primeiro dia do mês atual
  const firstDateOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Último dia do mês atual
  const lastDateOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Primeiro dia do mês anterior
  const firstDateOfLastMonth = new Date(subMonths(firstDateOfCurrentMonth, 1));
  // Último dia do mês anterior
  const lastDateOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  // Ajustar para o formato yyyy-mm-dd
  const currentMonthBeginningDateString = format(firstDateOfCurrentMonth, 'yyyy-MM-dd');
  const currentMonthFinalDateString = format(lastDateOfCurrentMonth, 'yyyy-MM-dd');
  const lastMonthBeginningDateString = format(firstDateOfLastMonth, 'yyyy-MM-dd');
  const lastMonthFinalDateString = format(lastDateOfLastMonth, 'yyyy-MM-dd');

  /* ---------------------------------------------- Funções Auxiliares ---------------------------------------------- */
  // Mapa dos turnos para ordenação
  // Se as datas são iguais ordena pelo turno
  const shiftOrder: Record<string, number> = {
    NOT: 1,
    MAT: 2,
    VES: 3,
  };

  // Função para calcular a média de caixas por pessoa
  const calculateAverage = (production: iProductionTotal[], presence: iPresenceTotal[]): number => {
    if (!production.length || !presence.length) return 0;

    // Mapeia os dados de produção em um objeto para acesso rápido
    const productionMap: Record<string, number> = {};
    production.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      productionMap[key] = item.total_produzido;
    });

    // Mapeia os dados de presença em um objeto para acesso rápido
    const presenceMap: Record<string, number> = {};
    presence.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      presenceMap[key] = item.quantidade;
    });

    // Calcula a média de caixas por pessoa
    let totalBoxes = 0;
    let totalPersons = 0;

    // Para cada presença, verifica se há produção correspondente
    presence.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      const productionValue = productionMap[key] || 0;
      const presenceValue = item.quantidade;

      // Só considera se houver produção e presença
      if (productionValue > 0 && presenceValue > 0) {
        totalBoxes += productionValue / 10; // Converte para caixas
        totalPersons += presenceValue;
      }
    });

    // Retorna a média ou 0 se não houver dados
    return totalPersons > 0 ? Math.round(totalBoxes / totalPersons) : 0;
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
    const productionMap: Record<string, number> = {};
    productionTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      productionMap[key] = item.total_produzido;
    });

    // Mapeia os dados de presença
    const presenceMap: Record<string, number> = {};
    presenceTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      presenceMap[key] = item.quantidade;
    });

    // Array para os valores
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
  }, [presenceTotal, productionTotal, lastDateOfCurrentMonth]);

  /* ---------------------------------------------------- Effect ---------------------------------------------------- */
  // Requisita os dados de presença e produção do mês atual
  useEffect(() => {
    Promise.all([
      // Requisição de presença
      getPresenceData([currentMonthBeginningDateString, currentMonthFinalDateString]),
      // Requisição de produção
      getProduction([currentMonthBeginningDateString, currentMonthFinalDateString]),
    ])
      .then(([presenceData, productionData]) => {
        const processedPresence = sumPresence(orderPresence(presenceData));
        const processedProduction = sumProduction(productionData);

        setPresenceTotal(processedPresence);
        setProductionTotal(processedProduction);

        // Calcular a média do mês atual
        const average = calculateAverage(processedProduction, processedPresence);
        setCurrentMonthAverage(average);
      })
      .catch((error) => {
        console.error('Error fetching current month data:', error);
      });
  }, [currentMonthBeginningDateString, currentMonthFinalDateString]);

  // Requisita os dados de presença e produção do mês anterior
  useEffect(() => {
    Promise.all([
      // Requisição de presença
      getPresenceData([lastMonthBeginningDateString, lastMonthFinalDateString]),
      // Requisição de produção
      getProduction([lastMonthBeginningDateString, lastMonthFinalDateString]),
    ])
      .then(([presenceData, productionData]) => {
        const processedPresence = sumPresence(orderPresence(presenceData));
        const processedProduction = sumProduction(productionData);

        // Calcular a média do mês anterior
        const average = calculateAverage(processedProduction, processedPresence);
        setLastMonthAverage(average);
      })
      .catch((error) => {
        console.error('Error fetching last month data:', error);
      });
  }, [lastMonthBeginningDateString, lastMonthFinalDateString]);

  // Opção para o Heatmap
  const heatmapOption = {
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `Dia: ${params.data[0]}<br>Turno: ${params.data[1]}<br>Caixas por pessoa: ${params.data[2]}`;
      },
    },
    grid: {
      y: '5%',
      left: '5%',
      right: '5%',
      height: '70%',
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
    <>
      {/* Layout que combina o heatmap com os gauges */}
      <Row>
        {/* Coluna para o gauge do mês anterior */}
        <Col md={2} className='text-center'>
          <p className='text-center mb-2'>Mês Anterior</p>
          <Gauge data={lastMonthAverage} />
        </Col>

        {/* Coluna para o heatmap central */}
        <Col md={8} className='mb-2'>
          <Card className='border-0 bg-transparent'>
            <EChartsReact option={heatmapOption} style={{ height: '350px', width: '100%' }} />
          </Card>
        </Col>

        {/* Coluna para o gauge do mês atual */}
        <Col md={2} className='text-center'>
          <p className='text-center mb-2'>Mês Atual</p>
          <Gauge data={currentMonthAverage} />
        </Col>
      </Row>
    </>
  );
};

export default HeatmapBxPeople;
