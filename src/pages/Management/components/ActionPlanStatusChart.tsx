import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { ActionPlanStatus, BSColors } from '../../../helpers/constants';
import { iActionPlan } from '../../../interfaces/ActionPlan.interface';

interface ActionPlanStatusChartProps {
  actionPlanData: iActionPlan[];
}

const ActionPlanStatusChart: React.FC<ActionPlanStatusChartProps> = ({ actionPlanData }) => {
  const [chartType, setChartType] = React.useState<'pie' | 'bar'>('pie');

  // Calcula a contagem de planos por status
  const statusCounts = useMemo(() => {
    const counts = {
      [ActionPlanStatus.Aberto]: 0,
      [ActionPlanStatus.PDCA]: 0,
      [ActionPlanStatus.Concluído]: 0,
      [ActionPlanStatus.Cancelado]: 0,
    };

    actionPlanData.forEach((plan) => {
      counts[plan.conclusao as keyof typeof counts]++;
    });

    return counts;
  }, [actionPlanData]);

  // Configura os dados para o gráfico de pizza
  const pieOption = {
    title: {
      text: 'Planos de Ação por Status',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['Aberto', 'PDCA', 'Concluído', 'Cancelado'],
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [
      {
        name: 'Status',
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
        data: [
          {
            value: statusCounts[ActionPlanStatus.Aberto],
            name: 'Aberto',
            itemStyle: { color: BSColors.INFO_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.PDCA],
            name: 'PDCA',
            itemStyle: { color: BSColors.WARNING_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.Concluído],
            name: 'Concluído',
            itemStyle: { color: BSColors.SUCCESS_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.Cancelado],
            name: 'Cancelado',
            itemStyle: { color: BSColors.DANGER_COLOR },
          },
        ],
      },
    ],
  };

  // Configura os dados para o gráfico de barras
  const barOption = {
    title: {
      text: 'Planos de Ação por Status',
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
      formatter: function (params: any) {
        return `${params[0].name}: ${params[0].value}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['Aberto', 'Concluído', 'Cancelado', 'PDCA'],
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        fontFamily: 'Poppins',
      },
      show: true,
    },
    yAxis: {
      type: 'value',
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
        data: [
          {
            value: statusCounts[ActionPlanStatus.Aberto],
            itemStyle: { color: BSColors.INFO_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.Concluído],
            itemStyle: { color: BSColors.SUCCESS_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.Cancelado],
            itemStyle: { color: BSColors.DANGER_COLOR },
          },
          {
            value: statusCounts[ActionPlanStatus.PDCA],
            itemStyle: { color: BSColors.WARNING_COLOR },
          },
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Poppins',
        },
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
                onChange={(e) => setChartType(e.target.value as 'pie' | 'bar')}
                size='sm'
                className='w-auto'
              >
                <option value='pie'>Gráfico de Pizza</option>
                <option value='bar'>Gráfico de Barras</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <ReactECharts option={chartType === 'pie' ? pieOption : barOption} style={{ height: '350px' }} />

        <Row className='mt-3'>
          <Col>
            <div className='d-flex justify-content-between'>
              <div>
                <strong>Total de Planos:</strong> {actionPlanData.length}
              </div>
              <div className='d-flex gap-3'>
                <div>
                  <span className='badge bg-info me-1'>{statusCounts[ActionPlanStatus.Aberto]}</span> Abertos
                </div>
                <div>
                  <span className='badge bg-warning text-dark me-1'>
                    {statusCounts[ActionPlanStatus.PDCA]}
                  </span>{' '}
                  PDCA
                </div>
                <div>
                  <span className='badge bg-success me-1'>{statusCounts[ActionPlanStatus.Concluído]}</span>{' '}
                  Concluídos
                </div>
                <div>
                  <span className='badge bg-danger me-1'>{statusCounts[ActionPlanStatus.Cancelado]}</span>{' '}
                  Cancelados
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Adicionando a nota informativa */}
        <Row className='mt-3'>
          <Col>
            <div className='alert alert-info mt-2 small'>
              <strong>Status dos planos:</strong> Este gráfico mostra a distribuição atual dos planos de ação
              por status.
              <br />
              <span className='fw-bold text-info'>Aberto:</span> Planos ainda em andamento que requerem ação |
              <span className='fw-bold text-warning'> PDCA:</span> Planos que estão em fase de execução |
              <span className='fw-bold text-success'> Concluído:</span> Planos finalizados com sucesso |
              <span className='fw-bold text-danger'> Cancelado:</span> Planos que foram encerrados sem
              implementação
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ActionPlanStatusChart;
