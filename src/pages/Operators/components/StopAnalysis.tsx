import EChartsReact from 'echarts-for-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { getMotivoColor, getMotivoIcon } from '../../../helpers/constants';
import { useLiveIndicatorsQuery } from '../../../hooks/queries/useLiveIndicatorsQuery';
import { useMachineInfoQuery } from '../../../hooks/queries/useLiveMachineInfoQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useStopSummary } from '../../../hooks/useStopSummary';
import { useTimelineMetrics } from '../../../hooks/useTimelineMetrics';
import { iStopsData, setClickStopsData } from '../../../redux/store/features/clickDataSlice';
import { setModalActionPlanCall } from '../../../redux/store/features/uiStateSlice';
import { useAppDispatch } from '../../../redux/store/hooks';

interface StopAnalysisProps {
  scope: string;
  enableActionPlanCreation?: boolean;
}

// Função para criar uma chave única dos dados para comparação
const createDataFingerprint = (data: any[]): string => {
  if (!data || data.length === 0) return 'empty';

  return data
    .map((item) => `${item.motivo}-${item.causa}-${item.problema}-${item.tempo}-${item.impacto}`)
    .join('|');
};

const StopAnalysis: React.FC<StopAnalysisProps> = ({ scope, enableActionPlanCreation = false }) => {
  const dispatch = useAppDispatch();

  // Ref para armazenar a "impressão digital" dos dados anteriores
  const prevDataFingerprintRef = useRef<string>('');
  const prevChartDataRef = useRef<any[]>([]);

  // Usar hook de filtros para integração com o sistema
  const { selectedLines } = useFilters(scope);

  const selectedLine = selectedLines.length > 0 ? selectedLines[0] : 0;
  const { machineId } = useLiveIndicatorsQuery({ scope, selectedLine });
  const { data: stopsData } = useTimelineMetrics(scope);
  const { machineInfo } = useMachineInfoQuery({ scope, machineId });

  const { stopSummary } = useStopSummary(stopsData, machineInfo);

  // Memoização inteligente - só recalcula se os dados realmente mudaram
  const chartData = useMemo(() => {
    const currentFingerprint = createDataFingerprint(stopSummary);

    // Se a "impressão digital" dos dados é a mesma, retorna a mesma referência
    if (currentFingerprint === prevDataFingerprintRef.current && prevChartDataRef.current.length > 0) {
      return prevChartDataRef.current;
    }

    // Dados mudaram, recalcula e armazena nova impressão digital
    prevDataFingerprintRef.current = currentFingerprint;
    const newChartData = stopSummary.map((item) => ({
      ...item,
      color: getMotivoColor(item.motivo, item.causa),
    }));

    prevChartDataRef.current = newChartData;
    return newChartData;
  }, [stopSummary]);

  // Top 3 impactos - memoizado baseado no chartData estável
  const top3Impacts = useMemo(() => {
    return chartData.length > 3 ? chartData.slice(0, 3) : [];
  }, [chartData]);

  // Função memoizada para criar Action Plan
  const handleCreateActionPlan = useCallback(
    (data: iStopsData) => {
      dispatch(setClickStopsData(data));

      if (!enableActionPlanCreation) return;

      dispatch(setModalActionPlanCall({ scope, isVisible: true }));
    },
    [dispatch, enableActionPlanCreation, scope]
  );

  // Event handler memoizado para clique no gráfico
  const onChartClick = useCallback(
    (params: any) => {
      if (enableActionPlanCreation && params.dataIndex !== undefined) {
        const stopData = chartData[params.dataIndex];
        handleCreateActionPlan(stopData);
      }
    },
    [enableActionPlanCreation, chartData, handleCreateActionPlan]
  );

  // Configuração do gráfico com animações mantidas
  const option = useMemo(() => {
    return {
      // ✅ Mantém animações suaves
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',

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
          // ✅ Animação suave para as barras
          animationDelay: (idx: number) => idx * 100,
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
                <Col xs={12} md={4} key={`${item.motivo}-${item.causa}-${item.tempo}`} className='mb-2'>
                  <Card
                    className={`border-0 shadow-sm bg-light h-100 ${enableActionPlanCreation ? 'stop-analysis-clickable' : ''}`}
                    style={enableActionPlanCreation ? { cursor: 'pointer' } : {}}
                    onClick={() => enableActionPlanCreation && handleCreateActionPlan(item)}
                  >
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
                        <small className='text-muted'>{item.causa}</small>
                        <h5 className='mb-1 text-danger'>{item.impacto.toFixed(1)}%</h5>
                        <small className='text-muted'>{item.tempo} minutos</small>
                        {enableActionPlanCreation && (
                          <div className='mt-2'>
                            <Badge bg='primary' className='fs-7'>
                              <i className='bi bi-plus-circle me-1'></i>
                              Clique para criar Plano
                            </Badge>
                          </div>
                        )}
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
          <div
            style={{
              height: Math.max(300, chartData.length * 40 + 100),
              cursor: enableActionPlanCreation ? 'pointer' : 'default',
            }}
          >
            <EChartsReact
              option={option}
              style={{ height: '100%', width: '100%' }}
              opts={{
                renderer: 'canvas',
              }}
              onEvents={enableActionPlanCreation ? { click: onChartClick } : {}}
              // ✅ Configurações inteligentes de merge
              lazyUpdate={true}
              notMerge={false} // Permite merge para evitar recriação completa
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
          {chartData.slice(0, 5).map((item, index) => (
            <div key={`mobile-${item.motivo}-${item.causa}-${index}`} className='mb-2 p-2 border rounded'>
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
          {chartData.length > 5 && (
            <div className='text-center text-muted mt-2'>
              <small>+ {chartData.length - 5} outras paradas</small>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StopAnalysis;
