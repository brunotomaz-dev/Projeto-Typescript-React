import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useFullInfoIHMQuery } from '../../../../../hooks/queries/useFullInfoIhmQuery';

interface SetupMetricsByType {
  totalSetups: number;
  tempoMedio: number;
  tempoTotal: number;
  setupMaisRapido: number;
  setupMaisDemorado: number;
  turnoComMaiorTempoMedio: {
    turno: string;
    tempoMedio: number;
  };
}

interface SetupGrouped {
  [key: string]: {
    linha: number;
    turno: string;
    data: string;
    tempoTotal: number;
    problemas: string[];
    count: number;
  };
}

const SetupMetrics: React.FC = () => {
  const { data, isRefreshing } = useFullInfoIHMQuery('management');

  // Manter apenas os dados com motivo 'Setup'
  const setupData = data?.filter((item) => item.motivo === 'Setup') || [];

  // Calcular métricas por tipo
  const metrics = useMemo(() => {
    // Separar dados originais por tipo ANTES do agrupamento
    const setupDataTrocaSabor = setupData.filter((item) => item.problema === 'Troca de Sabor');
    const setupDataTrocaProduto = setupData.filter((item) => item.problema === 'Troca de Produto');

    // Função para agrupar setups por tipo específico
    const agruparSetupsPorTipo = (dados: typeof setupData) => {
      const grouped: SetupGrouped = {};

      dados.forEach((item) => {
        const key = `${item.linha}-${item.turno}-${item.data_registro}`;

        if (!grouped[key]) {
          grouped[key] = {
            linha: item.linha,
            turno: item.turno,
            data: item.data_registro,
            tempoTotal: 0,
            problemas: [],
            count: 0,
          };
        }

        grouped[key].tempoTotal += item.tempo;
        if (!grouped[key].problemas.includes(item.problema)) {
          grouped[key].problemas.push(item.problema);
        }
        grouped[key].count++;
      });

      return Object.values(grouped);
    };

    // Função para calcular métricas para um tipo específico
    const calcularMetricasTipo = (
      setupsAgrupados: ReturnType<typeof agruparSetupsPorTipo>
    ): SetupMetricsByType => {
      const tempos = setupsAgrupados.map((s) => s.tempoTotal);

      // Calcular tempo médio por turno para este tipo
      const tempoMedioPorTurno: { [key: string]: { total: number; count: number } } = {};
      setupsAgrupados.forEach((setup) => {
        if (!tempoMedioPorTurno[setup.turno]) {
          tempoMedioPorTurno[setup.turno] = { total: 0, count: 0 };
        }
        tempoMedioPorTurno[setup.turno].total += setup.tempoTotal;
        tempoMedioPorTurno[setup.turno].count++;
      });

      // Encontrar turno com maior tempo médio
      let turnoComMaiorTempoMedio = { turno: '', tempoMedio: 0 };
      Object.keys(tempoMedioPorTurno).forEach((turno) => {
        const tempoMedio = tempoMedioPorTurno[turno].total / tempoMedioPorTurno[turno].count;
        if (tempoMedio > turnoComMaiorTempoMedio.tempoMedio) {
          turnoComMaiorTempoMedio = { turno, tempoMedio };
        }
      });

      return {
        totalSetups: setupsAgrupados.length,
        tempoMedio: tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0,
        tempoTotal: tempos.reduce((a, b) => a + b, 0),
        setupMaisRapido: tempos.length > 0 ? Math.min(...tempos) : 0,
        setupMaisDemorado: tempos.length > 0 ? Math.max(...tempos) : 0,
        turnoComMaiorTempoMedio,
      };
    };

    // Agrupar cada tipo separadamente
    const setupsAgrupadosTrocaSabor = agruparSetupsPorTipo(setupDataTrocaSabor);
    const setupsAgrupadosTrocaProduto = agruparSetupsPorTipo(setupDataTrocaProduto);

    return {
      trocaSabor: calcularMetricasTipo(setupsAgrupadosTrocaSabor),
      trocaProduto: calcularMetricasTipo(setupsAgrupadosTrocaProduto),
    };
  }, [setupData]);

  const formatarTempo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  const renderMetricCards = (metricas: SetupMetricsByType, tipo: 'Troca de Sabor' | 'Troca de Produto') => {
    const corTitulo = tipo === 'Troca de Sabor' ? 'text-primary' : 'text-success';

    return (
      <>
        <h5 className={`text-center mb-3 ${corTitulo}`}>{tipo}</h5>
        <Row className='mb-4'>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-primary'>{metricas.totalSetups}</h2>
                <p className='mb-0'>Total de Setups</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-info'>{formatarTempo(metricas.tempoMedio)}</h2>
                <p className='mb-0'>Tempo Médio</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-warning'>{formatarTempo(metricas.tempoTotal)}</h2>
                <p className='mb-0'>Tempo Total</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-success'>{formatarTempo(metricas.setupMaisRapido)}</h2>
                <p className='mb-0'>Mais Rápido</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-danger'>{formatarTempo(metricas.setupMaisDemorado)}</h2>
                <p className='mb-0'>Mais Demorado</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} className='mb-3'>
            <Card className='text-center h-100 shadow-sm border-0 position-relative bg-light'>
              {isRefreshing && (
                <div className='position-absolute top-0 end-0 m-2'>
                  <div className='spinner-border spinner-border-sm text-primary' role='status'>
                    <span className='visually-hidden'>Atualizando...</span>
                  </div>
                </div>
              )}
              <Card.Body>
                <h2 className='text-secondary'>
                  {metricas.turnoComMaiorTempoMedio.turno ? metricas.turnoComMaiorTempoMedio.turno : 'N/A'}
                </h2>
                <p className='mb-0'>Maior Tempo Médio</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      {renderMetricCards(metrics.trocaSabor, 'Troca de Sabor')}
      {renderMetricCards(metrics.trocaProduto, 'Troca de Produto')}
    </>
  );
};

export default SetupMetrics;
