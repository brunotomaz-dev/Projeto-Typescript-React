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

const SetupsPorLinhaChart: React.FC = () => {
  const { data, isRefreshing } = useFullInfoIHMQuery('management');

  // Manter apenas os dados com motivo 'Setup'
  const setupData = data?.filter((item) => item.motivo === 'Setup') || [];

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

  // Dados para gráfico de setups por linha
  const chartData = useMemo(() => {
    if (setupData.length === 0) return null;

    const linhas: { [key: number]: number } = {};
    Object.values(groupedSetups).forEach((setup) => {
      linhas[setup.linha] = (linhas[setup.linha] || 0) + 1;
    });

    const linhasArray = Object.keys(linhas);
    if (linhasArray.length === 0) return null;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          return `<strong>${data.name}</strong><br/>Setups: ${data.value}`;
        },
        textStyle: {
          fontFamily: 'Poppins',
        },
      },
      xAxis: {
        type: 'category',
        data: linhasArray.map((l) => `Linha ${l}`),
        axisLabel: {
          interval: 0, // Mostra todos os labels
          rotate: 45, // Rotaciona 45 graus
          textStyle: {
            fontSize: 12,
            fontFamily: 'Poppins',
          },
        },
        axisTick: {
          show: false, // Remove os tracinhos do tick
        },
      },
      yAxis: {
        type: 'value',
        name: 'Quantidade',
        nameTextStyle: {
          padding: [0, 0, 10, 0],
          fontFamily: 'Poppins',
        },
        axisLabel: {
          textStyle: {
            fontFamily: 'Poppins',
          },
        },
      },
      series: [
        {
          data: Object.values(linhas),
          type: 'bar',
          itemStyle: {
            color: '#3498db',
            borderRadius: [4, 4, 0, 0], // Bordas arredondadas no topo
          },
          emphasis: {
            itemStyle: {
              color: '#2980b9', // Cor mais escura no hover
            },
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            textStyle: {
              fontSize: 12,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
            },
          },
        },
      ],
      title: {
        text: 'Setups por Linha',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '1%',
        top: '15%',
        containLabel: true,
      },
    };
  }, [groupedSetups, setupData]);

  return (
    <Card className='shadow-sm border-0 h-100 position-relative'>
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
              <i className='bi bi-bar-chart' style={{ fontSize: '2rem' }}></i>
              <p className='mt-2'>Dados insuficientes para o gráfico</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SetupsPorLinhaChart;
