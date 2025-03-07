import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

// Criar componente para card de produção
const ProductionCard: React.FC<{
  title: string;
  total: number;
  night: number;
  morning: number;
  afternoon: number;
}> = ({ title, total, night, morning, afternoon }) => {
  // Função utilitária para formatação
  const formatProductionValue = (value: number): string => {
    return Math.round(value / 10).toLocaleString('pt-BR');
  };

  /* ------------------------------------------------ LAYOUT ------------------------------------------------ */
  return (
    <>
      <Card.Header className='fw-bold fst-italic'>{title}</Card.Header>
      <Card.Body>
        <Row>
          <Col className='border-end border-secondary'>
            <h6>Produção Total</h6>
            <h3>{formatProductionValue(total)} cxs</h3>
          </Col>
          <Col className='border-end'>
            <h6>Produção Noturno</h6>
            <h3>{formatProductionValue(night)} cxs</h3>
          </Col>
          <Col className='border-end'>
            <h6>Produção Matutino</h6>
            <h3>{formatProductionValue(morning)} cxs</h3>
          </Col>
          <Col>
            <h6>Produção Vespertino</h6>
            <h3>{formatProductionValue(afternoon)} cxs</h3>
          </Col>
        </Row>
      </Card.Body>
    </>
  );
};

export default ProductionCard;
