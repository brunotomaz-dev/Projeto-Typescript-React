import { format, parseISO } from 'date-fns';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useFilters } from '../../hooks/useFilters';
import IndicatorsForOperators from './components/IndicatorsForOperators';
import SelectorsOperation from './components/seletores';
import TimelineOperation from './components/timeline';

const OperatorsFilling: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { date } = useFilters('operators');

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Row>
        <Col xs={12}>
          <Card className='shadow border-0 bg-light p-3 mb-3'>
            <h2 className='text-center mb-3'>Fechamento de Turno - Operadores</h2>
            <p className='text-center text-muted mb-0'>
              Data: <strong>{format(parseISO(date), 'dd/MM/yyyy')}</strong>
            </p>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <SelectorsOperation scope='operators' />
        </Col>
      </Row>
      <Row>
        <Col xs={12} xl={5}>
          <TimelineOperation />
        </Col>
        <Col xs={12} xl={7}>
          <IndicatorsForOperators />
        </Col>
      </Row>
    </>
  );
};

export default OperatorsFilling;
