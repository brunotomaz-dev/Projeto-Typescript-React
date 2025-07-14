import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import GaugeChart from '../../components/gauge';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { IndicatorType } from '../../helpers/constants';
import { useBarStopsData } from '../../hooks/useBarStopsData';
import { useFilters } from '../../hooks/useFilters';
import { useLineIndicators } from '../../hooks/useLiveLineIndicators';
import { useProductionData } from '../../hooks/useLiveProductionData';
import { useTimelineData } from '../../hooks/useTimelineData';
import { setLiveSelectedLine, setLiveSelectedShift } from '../../redux/store/features/liveLinesSlice';
import { useAppDispatch } from '../../redux/store/hooks';
import BarStops from '../LiveLines/components/barStops';
import Timeline from '../LiveLines/components/timeline';
import TimelineSummary from '../LiveLines/components/timelineSummary';

const OperatorsFilling: React.FC = () => {
  const dispatch = useAppDispatch();

  // Usar hook de filtros para integração com o sistema
  const { turn, updateTurn } = useFilters('operators');

  // Estado local para linha selecionada (1-14)
  const [selectedLine, setSelectedLineState] = useState<number>(1);

  // Hooks de dados (usando linha selecionada)
  const { efficiency, performance, repair, isLoading: indicatorsLoading } = useLineIndicators();
  const { productionTotal, produto, isLoading: productionLoading } = useProductionData();
  const { metrics, hasData: hasTimelineData } = useTimelineData();
  const { data: stopsData, isLoading: stopsLoading } = useBarStopsData();

  // Combinar estados de loading
  const isRefreshing = indicatorsLoading || productionLoading || stopsLoading;

  // Dados de resumo do turno
  const shiftSummary = useMemo(() => {
    return {
      efficiency: Math.round(efficiency),
      performance: Math.round(performance),
      repair: Math.round(repair),
      production: productionTotal,
      product: produto || 'N/A',
      stopsCount: stopsData?.filter((item) => item.status === 'parada').length || 0,
      runningPercentage: Math.round(metrics?.percentageRunning || 0),
    };
  }, [efficiency, performance, repair, productionTotal, produto, stopsData, metrics]);

  // Handler para mudança de linha
  const handleLineChange = (line: number) => {
    setSelectedLineState(line);
    dispatch(setLiveSelectedLine(line));
  };

  // Handler para mudança de turno
  const handleShiftChange = (shift: string) => {
    updateTurn(shift as any);
    dispatch(setLiveSelectedShift(shift));
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3 mb-4'>
            <h2 className='text-center mb-4'>Fechamento de Turno - Operadores</h2>
            <p className='text-center text-muted mb-0'>
              Data: <strong>{format(new Date(), 'dd/MM/yyyy')}</strong>
            </p>
          </Card>
        </Col>
      </Row>

      {/* Seletores de Linha e Turno */}
      <Row className='mb-4'>
        <Col xs={12} md={6}>
          <Card className='shadow-sm border-0 bg-light p-3 h-100'>
            <h5 className='mb-3'>Seleção de Linha</h5>
            <div className='d-flex flex-wrap gap-2'>
              {Array.from({ length: 14 }, (_, i) => i + 1).map((line) => (
                <button
                  key={line}
                  className={`btn ${selectedLine === line ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => handleLineChange(line)}
                  style={{ minWidth: '40px' }}
                >
                  {line}
                </button>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className='shadow-sm border-0 bg-light p-3'>
            <h5 className='mb-3'>Seleção de Turno</h5>
            <SegmentedTurnBtn turn={turn} onTurnChange={handleShiftChange} width={100} />
          </Card>
        </Col>
      </Row>

      {isRefreshing && (
        <Row className='position-fixed top-0 end-0 m-3' style={{ zIndex: 1050 }}>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Atualizando dados...</span>
          </div>
        </Row>
      )}

      {/* Indicadores Principais */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3'>
            <h4 className='text-center mb-4'>Indicadores da Linha {selectedLine}</h4>
            <Row>
              <Col xs={12} md={3}>
                <Card className='bg-transparent border-0 text-center'>
                  <Card.Body>
                    <GaugeChart
                      indicator={IndicatorType.EFFICIENCY}
                      data={shiftSummary.efficiency}
                      large={false}
                      trio={true}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className='bg-transparent border-0 text-center'>
                  <Card.Body>
                    <GaugeChart
                      indicator={IndicatorType.PERFORMANCE}
                      data={shiftSummary.performance}
                      large={false}
                      trio={true}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className='bg-transparent border-0 text-center'>
                  <Card.Body>
                    <GaugeChart
                      indicator={IndicatorType.REPAIR}
                      data={shiftSummary.repair}
                      large={false}
                      trio={true}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className='bg-transparent border-0 text-center'>
                  <Card.Body>
                    <h6 className='text-muted'>Produção Total</h6>
                    <div className='d-flex flex-column align-items-center justify-content-center h-100'>
                      <h2 className='mb-1 text-primary fw-bold'>
                        {shiftSummary.production.toLocaleString()}
                      </h2>
                      <small className='text-muted'>caixas</small>
                      <small className='text-muted mt-1'>{shiftSummary.product}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Resumo do Turno */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3'>
            <h5 className='mb-3'>Resumo do Turno</h5>
            <Row className='text-center'>
              <Col xs={6} md={3}>
                <div className='p-2'>
                  <h4 className='mb-1 text-success'>{shiftSummary.runningPercentage}%</h4>
                  <small className='text-muted'>Tempo Produzindo</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className='p-2'>
                  <h4 className='mb-1 text-danger'>{100 - shiftSummary.runningPercentage}%</h4>
                  <small className='text-muted'>Tempo Parado</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className='p-2'>
                  <h4 className='mb-1 text-info'>{shiftSummary.stopsCount}</h4>
                  <small className='text-muted'>Total de Paradas</small>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className='p-2'>
                  <h4 className='mb-1 text-warning'>{Math.round(metrics?.longestContinuousRun || 0)}</h4>
                  <small className='text-muted'>Maior Tempo Contínuo (min)</small>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Timeline de Paradas */}
      {hasTimelineData && (
        <Row className='mb-4'>
          <Col xs={12}>
            <Card className='shadow border-0 bg-light p-3'>
              <h5 className='mb-3'>Timeline de Paradas</h5>
              <div style={{ height: '300px' }}>
                <Timeline />
              </div>
              <TimelineSummary />
            </Card>
          </Col>
        </Row>
      )}

      {/* Análise de Paradas */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3'>
            <h5 className='mb-3'>Análise de Paradas</h5>
            <div style={{ height: '400px' }}>
              <BarStops />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Observações do Turno */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3'>
            <h5 className='mb-3'>Observações do Turno</h5>
            <div className='p-3 bg-white rounded'>
              <textarea
                className='form-control border-0 resize-none'
                rows={4}
                placeholder='Adicione observações sobre o turno: problemas encontrados, ações tomadas, recomendações para o próximo turno...'
                style={{ resize: 'none' }}
              />
            </div>
            <div className='mt-3 text-end'>
              <button className='btn btn-primary'>
                <i className='bi bi-save me-2'></i>
                Salvar Observações
              </button>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OperatorsFilling;
