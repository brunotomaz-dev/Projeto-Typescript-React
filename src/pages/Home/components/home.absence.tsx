// cSpell: words recno usuario presencas saida panificacao lideranca
import React from 'react';
import { Card, Row, Spinner } from 'react-bootstrap';
import { useAbsenceQuery } from '../../../hooks/queries/useAbsenceQuery';
import { useToast } from '../../../hooks/useToast';
import HomeCardsAbsence from './home.cardsAbsence';

interface iHomeAbsenceProps {
  className?: string;
}

const HomeAbsence: React.FC<iHomeAbsenceProps> = ({ className }) => {
  // Hook do Toast
  const { ToastDisplay } = useToast();

  // Usando o hook refatorado
  const { counters, totalPresentes, isLoading } = useAbsenceQuery();

  return (
    <>
      <Card className={`shadow bg-light border-0 ${className}`}>
        <Card.Body>
          <Card.Title className='text-center fs-4'>
            Ausência / Presença
            {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
          </Card.Title>
          <Row className='mt-3'>
            <HomeCardsAbsence title='Faltas' value={counters.faltas} />
            <HomeCardsAbsence title='Afastamentos' value={counters.afastamentos} />
            <HomeCardsAbsence title='Férias' value={counters.ferias} />
          </Row>
          <Row className='mt-2'>
            <HomeCardsAbsence title='Presenças' value={totalPresentes} />
            <HomeCardsAbsence title='Remanejados' value={counters.remanejados} />
            <HomeCardsAbsence title='Atrasos' value={counters.atrasos} />
            <HomeCardsAbsence title='Saída Antecipada' value={counters.saidaAntecipada} />
          </Row>
        </Card.Body>
      </Card>
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default HomeAbsence;
