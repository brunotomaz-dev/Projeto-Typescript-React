import React, { useState } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useFullInfoIHMQuery } from '../../../hooks/queries/useFullInfoIhmQuery';
import { useFilters } from '../../../hooks/useFilters';
import { DashBar, DashYamazumi } from './stops';

const StopsDash: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { type } = useFilters('management');
  const { data, isFetching, isLoading, isRefreshing } = useFullInfoIHMQuery('management');

  /* ------------------------------------------------ Use State ------------------------------------------------ */
  const [notAffBar, setNotAffBar] = useState<boolean>(false);

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  // Loading inicial - apenas quando não há dados e está carregando pela primeira vez
  if (data.length === 0 && isLoading && !isFetching) {
    return (
      <Row className='mb-4'>
        <Col className='text-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <p className='mt-3 text-muted'>Carregando dados de paradas...</p>
        </Col>
      </Row>
    );
  }

  // No data state - apenas quando não há dados e não está carregando
  if (data.length === 0 && !isRefreshing) {
    return (
      <Row className='mb-4'>
        <Col>
          <Card className='text-center py-5 shadow-sm border-0'>
            <Card.Body>
              <i className='bi bi-info-circle text-muted' style={{ fontSize: '3rem' }}></i>
              <h4 className='mt-3 text-muted'>Nenhum dado de apontamento de parada encontrado</h4>
              <p className='text-muted'>
                Não há registros de apontamento de parada para os filtros selecionados.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Card className={`shadow border-0 bg-transparent p-2 ${type === 'single' ? 'mb-3' : ''}`}>
      <h3 className='text-center'>Paradas</h3>
      <Row>
        <Col xs={12} className='mb-3'>
          <DashYamazumi />
        </Col>
      </Row>
      <Row className='mb-3'>
        <Form.Switch className='mb-3 d-flex justify-content-center'>
          <Form.Check.Input
            id='custom-switch'
            onChange={() => setNotAffBar(!notAffBar)}
            checked={notAffBar}
          />
          <Form.Check.Label className='ms-2 text-muted fs-6'>
            Exibir Paradas que não Afetam Eficiência
          </Form.Check.Label>
        </Form.Switch>
        <Col xs={12} xl={6} className='mb-3'>
          <DashBar dataType={'ALL'} notAffBar={notAffBar} />
        </Col>
        <Col xs={12} xl={6}>
          <DashBar dataType={'Primeiro'} notAffBar={notAffBar} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} xl={6}>
          <DashBar dataType={'Segundo'} notAffBar={notAffBar} />
        </Col>
        <Col xs={12} xl={6}>
          <DashBar dataType={'Terceiro'} notAffBar={notAffBar} />
        </Col>
      </Row>
    </Card>
  );
};

export default StopsDash;
