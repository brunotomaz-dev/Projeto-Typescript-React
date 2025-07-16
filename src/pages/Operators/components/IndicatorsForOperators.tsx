import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useLiveIndicatorsQuery } from '../../../hooks/queries/useLiveIndicatorsQuery';
import { useMachineInfoQuery } from '../../../hooks/queries/useLiveMachineInfoQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useTimelineMetrics } from '../../../hooks/useTimelineMetrics';
import StopAnalysis from './StopAnalysis';

const IndicatorsForOperators: React.FC = () => {
  const SCOPE = 'operators';

  // Usar hook de filtros para integração com o sistema
  const { selectedLines } = useFilters(SCOPE);

  const selectedLine = selectedLines.length > 0 ? selectedLines[0] : 0;

  // Hooks de dados (usando linha selecionada)
  const {
    machineId,
    indicators,
    isLoading: indicatorsLoading,
  } = useLiveIndicatorsQuery({ scope: SCOPE, selectedLine });
  const { product: produto, isLoading: productionLoading } = useMachineInfoQuery({
    machineId,
    scope: SCOPE,
  });
  const { metrics, data: stopsData, isLoading: stopsLoading } = useTimelineMetrics(SCOPE);

  // Combinar estados de loading
  const isRefreshing = indicatorsLoading || productionLoading || stopsLoading;

  // Dados de resumo do turno
  const shiftSummary = useMemo(() => {
    return {
      efficiency: Math.round(indicators?.efficiency),
      performance: Math.round(indicators?.performance),
      repair: Math.round(indicators?.repair),
      production: indicators?.productionTotal,
      product: produto || 'N/A',
      stopsCount: stopsData?.filter((item) => item.status === 'parada').length || 0,
      runningPercentage: Math.round(metrics?.percentageRunning || 0),
    };
  }, [indicators, produto, stopsData, metrics]);

  if (selectedLines.length === 0) {
    return (
      <Card className='shadow border-0 bg-light p-3 mb-3'>
        <h3 className='text-center mb-3'>Indicadores</h3>
        <div className='text-center text-muted'>
          <i className='bi bi-info-circle' style={{ fontSize: '2rem' }}></i>
          <p className='mt-2'>Nenhuma linha selecionada</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='shadow border-0 bg-light p-3 mb-3'>
      <h3 className='text-center'>Indicadores</h3>

      {/* Spinner de atualização */}
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-3' style={{ zIndex: 1050 }}>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Atualizando dados...</span>
          </div>
        </Row>
      )}

      {/* Indicadores Principais */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-white p-3'>
            <h4 className='text-center mb-4'>Linha {selectedLines}</h4>
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
                <Card className='bg-transparent border-0 text-center h-100'>
                  <Card.Body className='d-flex flex-column align-items-center justify-content-center h-100'>
                    <h6 className='text-muted'>Produção Total</h6>
                    <h2 className='mb-1 text-primary fw-bold'>{shiftSummary.production.toLocaleString()}</h2>
                    <small className='text-muted'>caixas</small>
                    <h5 className='text-dark-emphasis mt-1'>{shiftSummary.product}</h5>
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
          <Card className='shadow border-0 bg-white p-3'>
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
                  <h4 className='mb-1 text-primary'>{Math.round(metrics?.longestContinuousRun || 0)}</h4>
                  <small className='text-muted'>Maior Tempo Contínuo (min)</small>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Análise de Paradas */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-white p-3'>
            <h5 className='mb-3'>Análise de Paradas</h5>
            <StopAnalysis scope={SCOPE} />
          </Card>
        </Col>
      </Row>

      {/* Observações do Turno */}
      <Row className='mb-4'>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3'>
            <h5 className='mb-3'>Plano de Ação</h5>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default IndicatorsForOperators;
