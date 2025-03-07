import React from 'react';
import { Card, Row } from 'react-bootstrap';
import HomeCardsAbsence from './home.cardsAbsence';

const HomeAbsence: React.FC = () => {
  return (
    <Card className='shadow bg-transparent border-0  h-100'>
      <Card.Body>
        <Card.Title className='text-center'>Ausência / Presença</Card.Title>
        <Row className='mt-3'>
          <HomeCardsAbsence title='Faltas' value={0} />
          <HomeCardsAbsence title='Atrasos' value={0} />
          <HomeCardsAbsence title='Presenças' value={0} />
        </Row>
        <Row className='mt-3'>
          <HomeCardsAbsence title='Afastamentos' value={0} />
          <HomeCardsAbsence title='Saída Antecipada' value={0} />
          <HomeCardsAbsence title='Remanejados' value={0} />
        </Row>
      </Card.Body>
    </Card>
  );
};

export default HomeAbsence;
