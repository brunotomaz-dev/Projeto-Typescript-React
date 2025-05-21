import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { BSColors } from '../../../helpers/constants';
import { iActionPlan } from '../../../interfaces/ActionPlan.interface';

interface ActionPlanOpeningLevelChartProps {
  actionPlanData: iActionPlan[];
}

const ActionPlanOpeningLevelChart: React.FC<ActionPlanOpeningLevelChartProps> = ({ actionPlanData }) => {
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');

  // Definição dos níveis hierárquicos
  const levelLabels = {
    1: 'Liderança',
    2: 'Supervisão',
    3: 'Coordenação',
    4: 'Gerência',
    5: 'Diretoria',
  };

  // Cores para cada nível
  const levelColors = {
    1: BSColors.SUCCESS_COLOR, // Verde
    2: BSColors.INFO_COLOR, // Azul
    3: BSColors.WARNING_COLOR, // Amarelo
    4: BSColors.ORANGE_COLOR, // Laranja
    5: BSColors.DANGER_COLOR, // Vermelho
  };

  // Processamento dos dados para o gráfico
  const openingData = useMemo(() => {
    // Inicializar contagem por nível
    const contagemPorNivel: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Contar planos por nível original
    actionPlanData.forEach((plan) => {
      // Garantir que o nível está dentro do range esperado (1-5)
      const nivel = Math.min(5, Math.max(1, plan.lvl));
      contagemPorNivel[nivel] = (contagemPorNivel[nivel] || 0) + 1;
    });

    // Calcular total
    const total = Object.values(contagemPorNivel).reduce((sum, val) => sum + val, 0);

    // Calcular porcentagens
    const porcentagens: Record<number, number> = {};
    Object.entries(contagemPorNivel).forEach(([nivel, qtd]) => {
      porcentagens[Number(nivel)] = total > 0 ? Math.round((qtd / total) * 100) : 0;
    });

    return {
      contagemPorNivel,
      porcentagens,
      total,
    };
  }, [actionPlanData]);

  // Opção para gráfico de barras
  const barOption = {
    title: {
      text: 'Abertura de Planos por Nível Original',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const nivel = Number(params[0].name.split(' ')[0]);
        const qtd = params[0].value;
        const porcentagem = openingData.porcentagens[nivel];
        return (
          `<strong>${params[0].name}</strong><br/>` +
          `Quantidade: ${qtd} planos<br/>` +
          `Percentual: ${porcentagem}% do total`
        );
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Object.entries(levelLabels).map(([nivel, label]) => `${nivel} - ${label}`),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        fontFamily: 'Poppins',
        interval: 0,
        rotate: 30,
        margin: 15,
      },
      show: true,
    },
    yAxis: {
      type: 'value',
      name: 'Quantidade',
      nameLocation: 'middle',
      nameGap: 40,
      minInterval: 1,
      axisLabel: {
        fontFamily: 'Poppins',
      },
      show: true,
    },
    series: [
      {
        name: 'Quantidade',
        type: 'bar',
        barWidth: '60%',
        data: Object.entries(openingData.contagemPorNivel).map(([nivel, qtd]) => ({
          value: qtd,
          itemStyle: {
            color: levelColors[Number(nivel) as keyof typeof levelColors],
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return `${params.value} (${openingData.porcentagens[Number(params.name.split(' ')[0])]}%)`;
          },
          fontFamily: 'Poppins',
        },
      },
    ],
  };

  // Opção para gráfico de pizza
  const pieOption = {
    title: {
      text: 'Abertura de Planos por Nível Original',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const nivel = Number(params.name.split(' ')[0]);
        return `${params.name}<br/>Quantidade: ${params.value} (${params.percent}%)<br/>Planos abertos por ${levelLabels[nivel as keyof typeof levelLabels]}`;
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.entries(levelLabels).map(([nivel, label]) => `${nivel} - ${label}`),
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [
      {
        name: 'Nível Original',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
          fontFamily: 'Poppins',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
        },
        data: Object.entries(openingData.contagemPorNivel).map(([nivel, qtd]) => ({
          value: qtd,
          name: `${nivel} - ${levelLabels[Number(nivel) as keyof typeof levelLabels]}`,
          itemStyle: {
            color: levelColors[Number(nivel) as keyof typeof levelColors],
          },
        })),
      },
    ],
  };

  return (
    <Card className='shadow border-0 p-3 h-100'>
      <Card.Body>
        <Row className='mb-3'>
          <Col>
            <Form.Group>
              <Form.Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'pie')}
                size='sm'
                className='w-auto'
              >
                <option value='bar'>Gráfico de Barras</option>
                <option value='pie'>Gráfico de Pizza</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <ReactECharts
          option={chartType === 'bar' ? barOption : pieOption}
          style={{ height: '350px' }}
          notMerge={true}
        />

        <Row className='mt-3'>
          <Col>
            <div className='d-flex justify-content-between'>
              <div>
                <strong>Total de Planos:</strong> {openingData.total}
              </div>
              <div className='d-flex gap-3'>
                {Object.entries(openingData.contagemPorNivel).map(([nivel, quantidade]) => (
                  <div key={nivel}>
                    <span
                      className={`badge me-1 ${Number(nivel) === 3 ? 'text-dark' : ''}`}
                      style={{ backgroundColor: levelColors[Number(nivel) as keyof typeof levelColors] }}
                    >
                      {quantidade}
                    </span>
                    {`Nível ${nivel}`}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        <Row className='mt-3'>
          <Col>
            <div className='alert alert-info mt-2 small'>
              <strong>Níveis de abertura:</strong> Este gráfico mostra quais níveis hierárquicos iniciaram os
              planos de ação.
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ActionPlanOpeningLevelChart;
