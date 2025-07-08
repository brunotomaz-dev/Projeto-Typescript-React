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

const DistribuicaoPorTipoChart: React.FC = () => {
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

  // Dados para gráfico de pizza - distribuição por tipo de problema
  const chartData = useMemo(() => {
    if (setupData.length === 0) return null;

    const setupsPorTipo = Object.values(groupedSetups).reduce(
      (acc, setup) => {
        // Para cada setup agrupado (data/linha/turno), verificar os tipos de problema
        const temTrocaSabor = setup.problemas.includes('Troca de Sabor');
        const temTrocaProduto = setup.problemas.includes('Troca de Produto');

        if (temTrocaSabor) acc['Troca de Sabor']++;
        if (temTrocaProduto) acc['Troca de Produto']++;

        return acc;
      },
      { 'Troca de Sabor': 0, 'Troca de Produto': 0 }
    );

    const totalSabor = setupsPorTipo['Troca de Sabor'];
    const totalProduto = setupsPorTipo['Troca de Produto'];

    if (totalSabor === 0 && totalProduto === 0) return null;

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `<strong>${params.name}</strong><br/>Quantidade: ${params.value}<br/>Percentual: ${params.percent}%`;
        },
        textStyle: {
          fontFamily: 'Poppins',
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          fontFamily: 'Poppins',
        },
      },
      series: [
        {
          name: 'Tipo de Setup',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: [
            { value: totalSabor, name: 'Troca de Sabor', itemStyle: { color: '#3498db' } },
            { value: totalProduto, name: 'Troca de Produto', itemStyle: { color: '#e74c3c' } },
          ].filter((item) => item.value > 0),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {c}\n({d}%)',
            textStyle: {
              fontSize: 12,
              fontFamily: 'Poppins',
            },
          },
          labelLine: {
            show: true,
          },
        },
      ],
      title: {
        text: 'Distribuição por Tipo',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Poppins',
        },
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
              <i className='bi bi-pie-chart' style={{ fontSize: '2rem' }}></i>
              <p className='mt-2'>Dados insuficientes para o gráfico</p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DistribuicaoPorTipoChart;
