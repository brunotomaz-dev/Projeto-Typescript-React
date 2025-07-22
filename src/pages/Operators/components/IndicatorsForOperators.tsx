import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useLiveIndicatorsQuery } from '../../../hooks/queries/useLiveIndicatorsQuery';
import { useMachineInfoQuery } from '../../../hooks/queries/useLiveMachineInfoQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useTimelineMetrics } from '../../../hooks/useTimelineMetrics';
import ActionPlanCardOperators from './ActionPlanCard';
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

  const {
    product: produto,
    machineInfo,
    isLoading: productionLoading,
  } = useMachineInfoQuery({
    machineId,
    scope: SCOPE,
  });

  const { metrics, data: stopsData, isLoading: stopsLoading } = useTimelineMetrics(SCOPE);

  // Combinar estados de loading
  const isRefreshing = indicatorsLoading || productionLoading || stopsLoading;

  // Média de Ciclos
  const averageCycle = useMemo(() => {
    // Calcula a media de ciclos usando o ciclo_1_min que for maior que 0
    const totalCycles =
      machineInfo?.reduce((acc, item) => {
        return acc + (item.ciclo_1_min > 0 ? item.ciclo_1_min : 0);
      }, 0) || 0;

    // Conta o númerno de ocorrências com ciclo_1_min maior que 0
    const countCycles = machineInfo?.filter((item) => item.ciclo_1_min > 0).length || 0;

    return totalCycles > 0 ? Number((totalCycles / countCycles).toFixed(2)) : 0;
  }, [machineInfo]);

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
    <>
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
            <h3 className='text-center mb-4'>Indicadores - Linha {selectedLine}</h3>
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
              <Col md={4} xl={3}>
                <div className='p-2'>
                  <h4 className='mb-1 text-success'>{shiftSummary.runningPercentage}%</h4>
                  <small className='text-muted'>Tempo Produzindo</small>
                </div>
              </Col>
              <Col md={4} xl={2}>
                <div className='p-2'>
                  <h4 className='mb-1 text-secondary'>{averageCycle}</h4>
                  <small className='text-muted'>Média de ciclos</small>
                </div>
              </Col>
              <Col md={3} xl={2}>
                <div className='p-2'>
                  <h4 className='mb-1 text-danger'>{100 - shiftSummary.runningPercentage}%</h4>
                  <small className='text-muted'>Tempo Parado</small>
                </div>
              </Col>
              <Col md={6} xl={2}>
                <div className='p-2'>
                  <h4 className='mb-1 text-info'>{shiftSummary.stopsCount}</h4>
                  <small className='text-muted'>Total de Paradas</small>
                </div>
              </Col>
              <Col md={6} xl={3}>
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
            <h5 className='mb-3'>
              Análise de Paradas
              <small className='text-muted ms-2'>(Clique para criar Plano de Ação)</small>
            </h5>
            <StopAnalysis scope={SCOPE} enableActionPlanCreation={true} />
          </Card>
        </Col>
      </Row>

      {/* Plano de Ação */}
      <Row className='mb-4'>
        <Col xs={12}>
          <ActionPlanCardOperators />
        </Col>
      </Row>
    </>
  );
};

export default IndicatorsForOperators;
