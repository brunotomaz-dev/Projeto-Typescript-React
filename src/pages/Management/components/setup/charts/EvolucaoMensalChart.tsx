import { format, getDaysInMonth, getMonth, getYear, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactECharts from 'echarts-for-react';
import React from 'react';
import { Card } from 'react-bootstrap';
import { useFullInfoIHMMonthQuery } from '../../../../../hooks/queries/useFullInfoIhmMonthQuery';

interface DailyData {
  dia: string;
  trocaSabor: number;
  trocaProduto: number;
}

const EvolucaoMensalChart: React.FC = () => {
  const { data: fullInfoData = [], isLoading } = useFullInfoIHMMonthQuery();

  // Filtrar apenas dados com motivo 'Setup'
  const setupData = fullInfoData.filter((item) => item.motivo === 'Setup');

  const processData = (): DailyData[] => {
    const currentDate = new Date();

    // Usar date-fns para obter ano, mês e dias no mês
    const year = getYear(currentDate);
    const month = getMonth(currentDate) + 1; // getMonth() retorna 0-11, precisamos 1-12
    const daysInMonth = getDaysInMonth(currentDate);

    // Criar um array com todos os dias do mês
    const allDays: DailyData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      allDays.push({
        dia: day.toString().padStart(2, '0'),
        trocaSabor: 0,
        trocaProduto: 0,
      });
    }

    // Processar dados de setup por dia
    const setupsByDay: { [key: string]: { trocaSabor: number[]; trocaProduto: number[] } } = {};

    setupData.forEach((item) => {
      try {
        // Usar date-fns para parsing seguro da data
        const itemDate = parseISO(item.data_registro); // Converte "2025-07-04" para Date
        const itemYear = getYear(itemDate);
        const itemMonth = getMonth(itemDate) + 1; // getMonth() retorna 0-11
        const itemDay = itemDate.getDate();

        // Só processar se for do mês/ano atual
        if (itemYear === year && itemMonth === month) {
          const day = itemDay.toString().padStart(2, '0');

          if (!setupsByDay[day]) {
            setupsByDay[day] = { trocaSabor: [], trocaProduto: [] };
          }

          if (item.problema === 'Troca de Sabor') {
            setupsByDay[day].trocaSabor.push(item.tempo);
          } else if (item.problema === 'Troca de Produto') {
            setupsByDay[day].trocaProduto.push(item.tempo);
          }
        }
      } catch (error) {
        console.warn('Erro ao processar data:', item.data_registro, error);
      }
    });

    // Calcular médias por dia
    allDays.forEach((day) => {
      const dayData = setupsByDay[day.dia];
      if (dayData) {
        if (dayData.trocaSabor.length > 0) {
          day.trocaSabor = Math.round(
            dayData.trocaSabor.reduce((sum, time) => sum + time, 0) / dayData.trocaSabor.length
          );
        }
        if (dayData.trocaProduto.length > 0) {
          day.trocaProduto = Math.round(
            dayData.trocaProduto.reduce((sum, time) => sum + time, 0) / dayData.trocaProduto.length
          );
        }
      }
    });

    return allDays;
  };

  const chartData = processData();

  const getChartOptions = () => {
    const currentDate = new Date();

    // Usar date-fns para formatação
    const monthName = format(currentDate, 'MMMM', { locale: ptBR });
    const year = getYear(currentDate);

    return {
      title: {
        text: `Evolução Mensal - Tempo Médio de Setup (${monthName} ${year})`,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: function (params: any) {
          const day = params[0].axisValue;
          const currentDate = new Date();
          const month = (getMonth(currentDate) + 1).toString().padStart(2, '0');
          const year = getYear(currentDate);

          let tooltip = `<b>${day}/${month}/${year}</b><br/>`;

          params.forEach((param: any) => {
            const value = param.value === 0 ? 'Sem dados' : `${param.value} min`;
            tooltip += `${param.marker} ${param.seriesName}: ${value}<br/>`;
          });

          return tooltip;
        },
      },
      legend: {
        data: ['Troca de Sabor', 'Troca de Produto'],
        top: '10%',
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.map((item) => item.dia),
        axisLabel: {
          color: '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Tempo (min)',
        nameTextStyle: {
          color: '#6b7280',
        },
        axisLabel: {
          color: '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: '#d1d5db',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Troca de Sabor',
          type: 'line',
          smooth: true,
          data: chartData.map((item) => item.trocaSabor),
          lineStyle: {
            color: '#3b82f6',
            width: 2,
          },
          itemStyle: {
            color: '#3b82f6',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.1)',
                },
              ],
              global: false,
            },
          },
        },
        {
          name: 'Troca de Produto',
          type: 'line',
          smooth: true,
          data: chartData.map((item) => item.trocaProduto),
          lineStyle: {
            color: '#ef4444',
            width: 2,
          },
          itemStyle: {
            color: '#ef4444',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(239, 68, 68, 0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(239, 68, 68, 0.1)',
                },
              ],
              global: false,
            },
          },
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <Card className='dashboard-card'>
        <Card.Body>
          <div className='d-flex justify-content-center align-items-center' style={{ height: '300px' }}>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Carregando...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className='dashboard-card'>
      <Card.Body>
        <ReactECharts option={getChartOptions()} style={{ height: '400px' }} opts={{ renderer: 'canvas' }} />
      </Card.Body>
    </Card>
  );
};

export default EvolucaoMensalChart;
