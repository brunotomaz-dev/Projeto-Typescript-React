import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTimelineData } from '../../../hooks/useTimelineData';

const TimelineSummary: React.FC = () => {
  const { metrics, isLoading, hasData } = useTimelineData();

  if (isLoading || !hasData) {
    return null;
  }

  const {
    percentageRunning,
    longestContinuousRun,
    stopEvents,
    stopEventsImpactingEfficiency,
    mainCauseText,
    mainCauseTime,
    showAsProblem,
  } = metrics;

  return (
    <Row className='text-center small d-flex justify-content-between px-3 pb-2'>
      {/* Indicador de produção */}
      <Col xs={6} md={2}>
        <div className='d-flex align-items-center justify-content-center mb-1'>
          <div
            className='rounded-circle me-1'
            style={{ width: '8px', height: '8px', backgroundColor: '#28a745' }}
          ></div>
          <small className='text-secondary fw-bold'>Produzindo</small>
        </div>
        <span className='fs-6 fw-bold'>{Math.round(percentageRunning)}%</span>
      </Col>

      {/* Indicador de paradas */}
      <Col xs={6} md={2}>
        <div className='d-flex align-items-center justify-content-center mb-1'>
          <div
            className='rounded-circle me-1'
            style={{ width: '8px', height: '8px', backgroundColor: '#dc3545' }}
          ></div>
          <small className='text-secondary fw-bold'>Parado</small>
        </div>
        <span className='fs-6 fw-bold'>{Math.round(100 - percentageRunning)}%</span>
      </Col>

      {/* Paradas - mostra total e paradas que impactam apenas quando houver impacto */}
      <Col xs={6} md={2}>
        <small className='text-secondary fw-bold'>Paradas</small>
        <p className='fs-6 fw-bold mb-0'>
          {stopEvents}
          {stopEventsImpactingEfficiency > 0 && (
            <span className='ms-1 small text-danger'>({stopEventsImpactingEfficiency} impacta)</span>
          )}
        </p>
      </Col>

      {/* Maior período contínuo */}
      <Col xs={6} md={2}>
        <small className='text-secondary fw-bold'>Maior Tempo Contínuo</small>
        <p className='fs-6 fw-bold mb-0'>{Math.round(longestContinuousRun)} min</p>
      </Col>

      {/* Principal causa de parada que afeta a eficiência */}
      <Col xs={12} md={4}>
        <small className='text-secondary fw-bold'>
          {showAsProblem ? 'Principal Problema' : 'Principal Causa Impactante'}
        </small>
        {mainCauseText !== 'N/A' ? (
          <div className='d-flex align-items-center justify-content-center'>
            <p className='fs-6 fw-bold mb-0 text-truncate me-2' title={mainCauseText}>
              {mainCauseText}
            </p>
            <span className='badge bg-danger'>{mainCauseTime} min</span>
          </div>
        ) : (
          <p className='fs-6 fw-bold mb-0 text-muted'>-</p>
        )}
      </Col>
    </Row>
  );
};

export default TimelineSummary;
