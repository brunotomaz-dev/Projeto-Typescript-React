import { differenceInDays, parseISO } from 'date-fns';
import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { ActionPlanStatus, BSColors } from '../../../helpers/constants';
import { iActionPlan } from '../../../interfaces/ActionPlan.interface';

interface ActionPlanCompletionTimeChartProps {
  actionPlanData: iActionPlan[];
}

const ActionPlanCompletionTimeChart: React.FC<ActionPlanCompletionTimeChartProps> = ({ actionPlanData }) => {
  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar');

  // Processamento dos dados para o gráfico
  const completionData = useMemo(() => {
    // Filtrar apenas planos concluídos (status 1)
    const planosCompletos = actionPlanData.filter(
      (plan) => plan.conclusao === ActionPlanStatus.Concluído && plan.data_conclusao
    );

    if (planosCompletos.length === 0) {
      return {
        mediaDias: 0,
        distribuicaoDias: {},
        diasParaConclusao: [],
      };
    }

    // Calcular dias até a conclusão para cada plano
    const diasParaConclusao = planosCompletos.map((plan) => {
      const dataAbertura = parseISO(plan.data_registro);
      const dataConclusao = parseISO(plan.data_conclusao as string);
      return {
        recno: plan.recno,
        dias: differenceInDays(dataConclusao, dataAbertura),
        responsavel: plan.responsavel,
        descricao: plan.descricao.length > 50 ? plan.descricao.substring(0, 50) + '...' : plan.descricao,
      };
    });

    // Ordenar por dias para conclusão (crescente)
    diasParaConclusao.sort((a, b) => a.dias - b.dias);

    // Calcular média de dias
    const totalDias = diasParaConclusao.reduce((sum, item) => sum + item.dias, 0);
    const mediaDias = Math.round((totalDias / diasParaConclusao.length) * 10) / 10;

    // Criar distribuição por faixas de dias
    const distribuicaoDias: Record<string, number> = {
      '1-3 dias': 0,
      '4-7 dias': 0,
      '8-14 dias': 0,
      '15-30 dias': 0,
      '> 30 dias': 0,
    };

    diasParaConclusao.forEach((item) => {
      if (item.dias <= 3) distribuicaoDias['1-3 dias']++;
      else if (item.dias <= 7) distribuicaoDias['4-7 dias']++;
      else if (item.dias <= 14) distribuicaoDias['8-14 dias']++;
      else if (item.dias <= 30) distribuicaoDias['15-30 dias']++;
      else distribuicaoDias['> 30 dias']++;
    });

    return {
      mediaDias,
      distribuicaoDias,
      diasParaConclusao,
    };
  }, [actionPlanData]);

  // Opção para gráfico de barras (distribuição por faixas de tempo)
  const barOption = {
    title: {
      text: 'Distribuição do Tempo até Conclusão',
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
        return `${params[0].name}: ${params[0].value} plano(s)<br/>(${params[0].value > 0 ? Math.round((params[0].value * 100) / completionData.diasParaConclusao.length) : 0}% do total)`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Object.keys(completionData.distribuicaoDias),
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
      minInterval: 1,
      name: 'Planos',
      nameLocation: 'middle',
      nameGap: 30,
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
        data: Object.entries(completionData.distribuicaoDias).map(([faixa, quantidade]) => ({
          value: quantidade,
          itemStyle: {
            color: faixaParaCor(faixa),
          },
        })),
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Poppins',
        },
      },
    ],
  };

  // Calcular o intervalo ideal para exibição dos rótulos no eixo X
  const calcularIntervalo = (tamanho: number): number => {
    if (tamanho <= 10) return 0; // Mostra todos os rótulos
    if (tamanho <= 20) return 1; // Mostra um a cada dois
    if (tamanho <= 50) return 4; // Mostra um a cada cinco
    return Math.ceil(tamanho / 10); // Mostra aproximadamente 10 rótulos no total
  };

  // Opção para gráfico de linha (tempo individual por plano)
  const lineOption = {
    title: {
      text: 'Dias até a Conclusão por Plano',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const dataIndex = params[0].dataIndex;
        const plano = completionData.diasParaConclusao[dataIndex];
        return (
          `<strong>Plano #${plano.recno}</strong><br/>` +
          `Dias para conclusão: ${plano.dias}<br/>` +
          `Responsável: ${plano.responsavel}<br/>` +
          `Descrição: ${plano.descricao}`
        );
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: BSColors.PRIMARY_COLOR,
        },
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: completionData.diasParaConclusao.map((item) => `#${item.recno}`),
      axisLabel: {
        rotate: 45,
        // Importante: ajusta o intervalo baseado na quantidade de dados
        interval: calcularIntervalo(completionData.diasParaConclusao.length),
        fontFamily: 'Poppins',
        margin: 8,
        hideOverlap: true,
      },
      axisTick: {
        // Mostra ticks apenas nos labels visíveis
        alignWithLabel: true,
        interval: calcularIntervalo(completionData.diasParaConclusao.length),
      },
      show: true,
    },
    yAxis: {
      type: 'value',
      name: 'Dias',
      minInterval: 1,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontFamily: 'Poppins',
      },
      show: true,
    },
    series: [
      {
        name: 'Dias para Conclusão',
        type: 'line',
        data: completionData.diasParaConclusao.map((item) => ({
          value: item.dias,
          itemStyle: {
            color: BSColors.PRIMARY_COLOR,
          },
        })),
        markLine: {
          data: [
            {
              name: 'Média',
              type: 'average',
              label: {
                formatter: 'Média: {c} dias',
                position: 'end',
              },
              lineStyle: {
                color: BSColors.DANGER_COLOR,
                width: 2,
                type: 'dashed',
              },
            },
          ],
        },
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
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
                color: 'rgba(13, 110, 253, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(13, 110, 253, 0.1)',
              },
            ],
          },
        },
      },
    ],
  };

  // Função para determinar a cor baseada na faixa de dias
  function faixaParaCor(faixa: string): string {
    switch (faixa) {
      case '1-3 dias':
        return BSColors.SUCCESS_COLOR;
      case '4-7 dias':
        return BSColors.INFO_COLOR;
      case '8-14 dias':
        return BSColors.WARNING_COLOR;
      case '15-30 dias':
        return BSColors.ORANGE_COLOR;
      case '> 30 dias':
        return BSColors.DANGER_COLOR;
      default:
        return BSColors.GREY_600_COLOR;
    }
  }

  return (
    <Card className='shadow border-0 p-3 h-100'>
      <Card.Body>
        <Row className='mb-3 align-items-center'>
          <Col xs={8}>
            <Form.Group>
              <Form.Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
                size='sm'
                className='w-auto'
              >
                <option value='bar'>Distribuição por Faixa de Tempo</option>
                <option value='line'>Tempo por Plano Individual</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={4} className='text-end'>
            <span className='badge bg-primary fs-6'>Média: {completionData.mediaDias} dias</span>
          </Col>
        </Row>

        <ReactECharts
          option={chartType === 'bar' ? barOption : lineOption}
          style={{ height: '350px' }}
          notMerge={true}
        />

        <Row className='mt-3'>
          <Col>
            <div className='alert alert-info mb-0 small'>
              <i className='bi bi-info-circle me-2'></i>
              Este gráfico analisa apenas os {completionData.diasParaConclusao.length} planos já concluídos.
              {chartType === 'line' &&
                completionData.diasParaConclusao.length > 0 &&
                ` O plano mais rápido foi concluído em ${completionData.diasParaConclusao[0].dias} dias, 
                e o mais demorado levou ${completionData.diasParaConclusao[completionData.diasParaConclusao.length - 1].dias} dias.`}
              {chartType === 'bar' &&
                ' As barras mostram a distribuição dos planos por faixas de tempo até a conclusão.'}
              <br />
              <strong>Dica:</strong>{' '}
              {chartType === 'line' ? 'Apenas alguns planos são rotulados para melhor visualização. ' : ''}
              Passe o mouse sobre os elementos do gráfico para ver mais detalhes.
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ActionPlanCompletionTimeChart;
