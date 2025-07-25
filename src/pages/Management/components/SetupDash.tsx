import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useFullInfoIHMQuery } from '../../../hooks/queries/useFullInfoIhmQuery';
import {
  ComparacaoTempoMedioChart,
  DistribuicaoPorTipoChart,
  EvolucaoMensalChart,
  SetupMetrics,
  SetupsPorLinhaChart,
  TempoMedioPorTurnoChart,
} from './setup';

const SetupDash: React.FC = () => {
  const { data, isLoading, isFetching, isRefreshing } = useFullInfoIHMQuery('management');

  // Manter apenas os dados com motivo 'Setup'
  const setupData = data?.filter((item) => item.motivo === 'Setup') || [];

  // Loading inicial - apenas quando não há dados e está carregando pela primeira vez
  if (setupData.length === 0 && isLoading && !isFetching) {
    return (
      <Row className='mb-4'>
        <Col className='text-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <p className='mt-3 text-muted'>Carregando dados de setup...</p>
        </Col>
      </Row>
    );
  }

  // No data state - apenas quando não há dados e não está carregando
  if (setupData.length === 0 && !isRefreshing) {
    return (
      <Row className='mt-3'>
        <Col>
          <Card className='text-center py-5 shadow-sm border-0'>
            <Card.Body>
              <i className='bi bi-info-circle text-muted' style={{ fontSize: '3rem' }}></i>
              <h4 className='mt-3 text-muted'>Nenhum dado de setup encontrado</h4>
              <p className='text-muted'>Não há registros de setup para os filtros selecionados.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Card className='shadow border-0 mt-3 bg-transparent p-2'>
      <h3 className='text-center'>Setup</h3>

      {/* Métricas */}
      <SetupMetrics />

      {/* Dashboards */}
      <Row>
        <Col lg={6} className='mb-4'>
          <SetupsPorLinhaChart />
        </Col>
        <Col lg={6} className='mb-4'>
          <TempoMedioPorTurnoChart />
        </Col>
      </Row>

      <Row>
        <Col lg={6} className='mb-4'>
          <DistribuicaoPorTipoChart />
        </Col>
        <Col lg={6} className='mb-4'>
          <ComparacaoTempoMedioChart />
        </Col>
      </Row>

      {/* Gráfico de Evolução Mensal - Linha inteira */}
      <Row>
        <Col lg={12}>
          <EvolucaoMensalChart />
        </Col>
      </Row>
    </Card>
  );
};

export default SetupDash;
