import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useFullInfoIHMQuery } from '../../../../../hooks/queries/useFullInfoIhmQuery';

interface SetupGrouped {
  [key: string]: {
    linha: number;
    turno: string;
    data: string;
    tempoTotal: number;
    problemas: string[];
    count: number;
  };
}

const ComparacaoTempoMedioChart: React.FC = () => {
  const { data, isRefreshing } = useFullInfoIHMQuery('management');

  // Manter apenas os dados com motivo 'Setup'
  const setupData = data?.filter((item) => item.motivo === 'Setup') || [];

  // Função para ordenar turnos na ordem NOT, MAT, VES
  const ordenarTurnos = (turnos: string[]): string[] => {
    const ordemTurnos = ['NOT', 'MAT', 'VES'];
    return turnos.sort((a, b) => {
      const indexA = ordemTurnos.indexOf(a);
      const indexB = ordemTurnos.indexOf(b);

      // Se ambos estão na lista de ordem, ordena por posição
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // Se apenas um está na lista, o que está tem prioridade
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // Se nenhum está na lista, ordena alfabeticamente
      return a.localeCompare(b);
    });
  };

  // Agrupar setups por turno/linha/data
  const groupedSetups = useMemo((): SetupGrouped => {
    const grouped: SetupGrouped = {};

    setupData.forEach((item) => {
      const key = `${item.linha}-${item.turno}-${item.data_registro}`;

      if (!grouped[key]) {
        grouped[key] = {
          linha: item.linha,
          turno: item.turno,
          data: item.data_registro,
          tempoTotal: 0,
          problemas: [],
          count: 0,
        };
      }

      grouped[key].tempoTotal += item.tempo;
      if (!grouped[key].problemas.includes(item.problema)) {
        grouped[key].problemas.push(item.problema);
      }
      grouped[key].count++;
    });

    return grouped;
  }, [setupData]);

  // Dados para gráfico de comparação de tempo médio por linha e turno
  const chartData = useMemo(() => {
    if (setupData.length === 0) return null;

    // Calcular tempo médio por linha e turno combinados
    const tempoMedioPorLinhaETurno: { [key: string]: { total: number; count: number } } = {};
    Object.values(groupedSetups).forEach((setup) => {
      const key = `${setup.linha}-${setup.turno}`;
      if (!tempoMedioPorLinhaETurno[key]) {
        tempoMedioPorLinhaETurno[key] = { total: 0, count: 0 };
      }
      tempoMedioPorLinhaETurno[key].total += setup.tempoTotal;
      tempoMedioPorLinhaETurno[key].count++;
    });

    // Organizar dados por linha
    const linhas = [...new Set(Object.values(groupedSetups).map((s) => s.linha))].sort((a, b) => a - b);
    const turnos = ordenarTurnos([...new Set(Object.values(groupedSetups).map((s) => s.turno))]);

    if (linhas.length === 0) return null;

    // Criar categorias (apenas linhas)
    const categories = linhas.map((linha) => `Linha ${linha}`);

    // Criar séries para cada turno
    const series = turnos.map((turno, index) => {
      const coresMonocromaticas = ['#2c3e50', '#5d6d7e', '#aeb6bf', '#34495e', '#85929e', '#d5dbdb'];

      return {
        name: `Turno ${turno}`,
        type: 'bar',
        data: linhas.map((linha) => {
          const key = `${linha}-${turno}`;
          if (tempoMedioPorLinhaETurno[key]) {
            return Number(
              (tempoMedioPorLinhaETurno[key].total / tempoMedioPorLinhaETurno[key].count).toFixed(1)
            );
          }
          return null;
        }),
        itemStyle: {
          color: coresMonocromaticas[index % coresMonocromaticas.length],
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => (params.value ? `${params.value}min` : ''),
          textStyle: {
            fontSize: 10,
            fontFamily: 'Poppins',
          },
        },
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((param: any) => {
            if (param.value !== null) {
              tooltip += `${param.seriesName}: ${param.value} min<br/>`;
            }
          });
          return tooltip;
        },
        textStyle: {
          fontFamily: 'Poppins',
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: '1%',
        left: 'center',
        textStyle: {
          fontFamily: 'Poppins',
          fontSize: 12,
        },
        itemGap: 20,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            fontSize: 11,
            fontFamily: 'Poppins',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Tempo Médio (min)',
        nameTextStyle: {
          fontFamily: 'Poppins',
        },
        axisLabel: {
          textStyle: {
            fontFamily: 'Poppins',
          },
        },
      },
      series: series,
      title: {
        text: 'Tempo Médio de Setup por Linha e Turno',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
      },
      grid: {
        left: '5%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true,
      },
    };
  }, [groupedSetups, setupData]);

  return (
    <Card className='shadow-sm border-0 h-100 position-relative bg-light'>
      {isRefreshing && (
        <div className='position-absolute top-0 end-0 m-3' style={{ zIndex: 10 }}>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}
      <Card.Body>
        {chartData ? (
          <ReactECharts option={chartData} style={{ height: '300px' }} />
        ) : (
          <div className='d-flex align-items-center justify-content-center' style={{ height: '300px' }}>
            <div className='text-center text-muted'>
              <i className='bi bi-bar-chart-steps' style={{ fontSize: '2rem' }}></i>
              <p className='mt-2'>Dados insuficientes para o gráfico</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComparacaoTempoMedioChart;
