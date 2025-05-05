import { parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React, { useState } from 'react';
import { Button, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAppSelector } from '../../../redux/store/hooks';
import ModalServiceHistory from './liveLines.ModalHistoricService';

interface HeaderProps {
  nowDate: string;
  onDateChange: (date: Date | null) => void;
  isOpenedUpdateStops: boolean;
  setIsOpenedUpdateStops: (isOpened: boolean) => void;
}

const LiveLinesHeader: React.FC<HeaderProps> = ({
  nowDate,
  onDateChange,
  isOpenedUpdateStops,
  setIsOpenedUpdateStops,
}) => {
  /* ------------------------------------------- HOOK ------------------------------------------- */
  const { hasResourcePermission, hasElementAccess } = usePermissions();
  const canView = hasResourcePermission('ihm_appointments', 'view');
  const hasBtnHistAccess = hasElementAccess('btn_OS_preventive_history');

  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const selectedDate = useAppSelector((state) => state.liveLines.selectedDate);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);

  /* --------------------------------------------- Local State -------------------------------------------- */
  const [isOpened, setIsOpened] = useState(false);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Row className='m-2'>
        <h1 className='text-center p-2'>
          {selectedDate === nowDate ? 'Linhas em Tempo Real' : 'Linhas Histórico'}
        </h1>
        <h5 className='text-center'>{`(${selectedMachine || '-'})`}</h5>
        <Stack direction='horizontal' gap={2}>
          <DatePicker
            selected={parseISO(selectedDate)}
            className='form-control text-center'
            locale={ptBR}
            dateFormat='dd/MM/yyyy'
            icon='bi bi-calendar-day'
            popperClassName='custom-popper'
            calendarClassName='custom-calendar'
            showIcon={true}
            onChange={onDateChange}
            minDate={parseISO('2024-11-01')}
            maxDate={startOfDay(new Date())}
          />
          {canView && (
            <Button
              variant='outline-secondary'
              onClick={() => setIsOpenedUpdateStops(!isOpenedUpdateStops)}
            >
              {isOpenedUpdateStops ? 'Fechar Apontamentos' : 'Ver Apontamentos'}
            </Button>
          )}
          {/* {hasBtnHistAccess && (
            <Button variant='outline-secondary' onClick={() => setIsOpened(true)}>
              Ver Histórico
            </Button>
          )} */}
        </Stack>
      </Row>
      <ModalServiceHistory isOpened={isOpened} onHide={() => setIsOpened(false)} />
    </>
  );
};

export default LiveLinesHeader;
