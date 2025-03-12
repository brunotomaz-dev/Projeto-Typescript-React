// cspell:words superv

import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Container, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import PageLayout from '../../components/pageLayout';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { superTurns, TurnoID } from '../../helpers/constants';
import { getShift } from '../../helpers/turn';
import { useAppSelector } from '../../redux/store/hooks';
import { RootState } from '../../redux/store/store';
import SupervAbsence from './components/superv.Absence';

const SupervisionPage: React.FC = () => {
  const now = new Date();
  const formatNow = format(startOfDay(now), 'yyyy-MM-dd');
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // User
  const userName = useAppSelector((state: RootState) => state.user.fullName);

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [superTurn, setSuperTurn] = useState<TurnoID>(getShift());
  const [selectedDate, setSelectedDate] = useState<string>(formatNow);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  const handleTurnChange = (turn: TurnoID) => {
    setSuperTurn(turn);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
    }
  };

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  useEffect(() => {
    if (userName in superTurns) {
      setSuperTurn(superTurns[userName]);
    }
  }, [userName]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h4 className='text-center fs-4'>Supervisão - {userName}</h4>
      <Container fluid>
        <Stack direction='horizontal' className='p-2 gap-5'>
          <DatePicker
            selected={parseISO(selectedDate)}
            onChange={(date: Date | null) => handleDateChange(date)}
            dateFormat='dd/MM/yyyy'
            className='form-control text-center '
            calendarIconClassName='mr-2'
            icon={'bi bi-calendar'}
            showIcon={true}
            // withPortal={true}
            popperClassName='custom-popper'
            calendarClassName='custom-calendar'
            locale={ptBR}
            minDate={parseISO('2024-08-01')}
            maxDate={now}
          />
          <SegmentedTurnBtn turn={superTurn} onTurnChange={handleTurnChange} />
        </Stack>
        <SupervAbsence selectedDate={selectedDate} selectedTurno={superTurn} />
      </Container>
    </PageLayout>
  );
};

export default SupervisionPage;
