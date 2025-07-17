import EChartsReact from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { getMotivoColor, getMotivoIcon } from '../../../helpers/constants';
import { useLiveIndicatorsQuery } from '../../../hooks/queries/useLiveIndicatorsQuery';
import { useMachineInfoQuery } from '../../../hooks/queries/useLiveMachineInfoQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useStopSummary } from '../../../hooks/useStopSummary';
import { useTimelineMetrics } from '../../../hooks/useTimelineMetrics';

interface StopAnalysisProps {
  scope: string;
}

const StopAnalysis: React.FC<StopAnalysisProps> = ({ scope }) => {
  // Usar hook de filtros para integração com o sistema
  const { selectedLines } = useFilters(scope);

  const selectedLine = selectedLines.length > 0 ? selectedLines[0] : 0;
  const { machineId } = useLiveIndicatorsQuery({ scope, selectedLine });
  const { data: stopsData } = useTimelineMetrics(scope);
  const { machineInfo } = useMachineInfoQuery({ scope, machineId });

  const { stopSummary } = useStopSummary(stopsData, machineInfo);

  // Dados ordenados por impacto (já vem ordenado do hook)
  const chartData = useMemo(() => {
    return stopSummary.map((item) => ({
      ...item,
      color: getMotivoColor(item.motivo, item.causa),
    }));
  }, [stopSummary]);

  // Top 3 impactos (apenas se houver mais de 3 ocorrências)
  const top3Impacts = useMemo(() => {
    return stopSummary.length > 3 ? stopSummary.slice(0, 3) : [];
  }, [stopSummary]);

  // Configuração do gráfico ECharts
  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const item = chartData[params[0].dataIndex];
          return `
            <div style="padding: 8px;">
              <strong style="color: ${item.color};">
                <i class="${getMotivoIcon(item.motivo, item.causa)}"></i> ${item.motivo}
              </strong><br/>
              <span style="color: #666;">Problema:</span> ${item.problema}<br/>
              <span style="color: #666;">Causa:</span> ${item.causa}<br/>
              <span style="color: #666;">Tempo:</span> <strong>${item.tempo} min</strong><br/>
              <span style="color: #666;">Impacto:</span> <strong style="color: #e74c3c;">${item.impacto}%</strong>
            </div>
          `;
        },
      },
      grid: {
        left: '5%',
        right: '15%',
        bottom: '10%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        name: 'Impacto (%)',
        nameLocation: 'center',
        nameGap: 25,
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f0f0f0',
          },
        },
        axisLabel: {
          formatter: '{value}%',
        },
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item, index) => `${index + 1}. ${item.causa}`),
        axisLabel: {
          show: true,
          interval: 0,
          formatter: (value: string) => {
            // Truncar texto longo para mobile
            const maxLength = window.innerWidth < 768 ? 15 : 25;
            return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
          },
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          name: 'Impacto',
          type: 'bar',
          data: chartData.map((item) => ({
            value: item.impacto,
            itemStyle: {
              color: item.color,
            },
          })),
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => `${params.value.toFixed(1)}%`,
            color: '#666',
            fontSize: 12,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
      ],
    };
  }, [chartData]);

  if (!stopSummary || stopSummary.length === 0) {
    return (
      <div className='text-center text-muted py-4'>
        <i className='bi bi-info-circle' style={{ fontSize: '2rem' }}></i>
        <p className='mt-2'>Nenhuma parada registrada no período</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top 3 Impactos */}
      {top3Impacts.length > 0 && (
        <Row className='mb-3'>
          <Col xs={12}>
            <h6 className='mb-3'>
              <i className='bi bi-trophy me-2 text-warning'></i>
              Top 3 Maiores Impactos
            </h6>
            <Row>
              {top3Impacts.map((item, index) => (
                <Col xs={12} md={4} key={`${item.motivo}-${item.causa}`} className='mb-2'>
                  <Card className='border-0 shadow-sm bg-light h-100'>
                    <Card.Body className='p-3'>
                      <div className='d-flex align-items-center mb-2'>
                        <Badge
                          bg='light'
                          text='dark'
                          className='me-2'
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.6rem',
                          }}
                        >
                          #{index + 1}
                        </Badge>
                        <div
                          className='rounded-circle me-2'
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: getMotivoColor(item.motivo),
                          }}
                        ></div>
                        <small className='text-muted fw-bold'>{item.motivo}</small>
                      </div>
                      <div className='text-center'>
                        <h5 className='mb-1 text-danger'>{item.impacto.toFixed(1)}%</h5>
                        <small className='text-muted'>{item.tempo} minutos</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Gráfico de Análise */}
      <Row>
        <Col xs={12}>
          <div style={{ height: Math.max(300, stopSummary.length * 40 + 100) }}>
            <EChartsReact
              option={option}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </Col>
      </Row>

      {/* Legenda para Mobile */}
      <Row className='d-md-none mt-3'>
        <Col xs={12}>
          <h6 className='mb-2'>
            <i className='bi bi-list-ul me-2'></i>
            Detalhes das Paradas
          </h6>
          {stopSummary.slice(0, 5).map((item, index) => (
            <div key={`mobile-${item.motivo}-${item.causa}`} className='mb-2 p-2 border rounded'>
              <div className='d-flex align-items-center justify-content-between'>
                <div className='d-flex align-items-center'>
                  <span className='badge bg-secondary me-2'>{index + 1}</span>
                  <div
                    className='rounded-circle me-2'
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: getMotivoColor(item.motivo),
                    }}
                  ></div>
                  <small className='fw-bold'>{item.motivo}</small>
                </div>
                <div className='text-end'>
                  <div className='text-danger fw-bold'>{item.impacto.toFixed(1)}%</div>
                  <small className='text-muted'>{item.tempo}min</small>
                </div>
              </div>
              <div className='mt-1'>
                <small className='text-muted'>
                  <strong>Problema:</strong> {item.problema}
                </small>
                <br />
                <small className='text-muted'>
                  <strong>Causa:</strong> {item.causa}
                </small>
              </div>
            </div>
          ))}
          {stopSummary.length > 5 && (
            <div className='text-center text-muted mt-2'>
              <small>+ {stopSummary.length - 5} outras paradas</small>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StopAnalysis;
