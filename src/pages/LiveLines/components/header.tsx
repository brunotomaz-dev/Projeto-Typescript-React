import { parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React from 'react';
import { Button, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { usePermissions } from '../../../hooks/usePermissions';

interface HeaderProps {
  selectedDate: string;
  nowDate: string;
  selectedMachine: string;
  onDateChange: (date: Date | null) => void;
  isOpenedUpdateStops: boolean;
  setIsOpenedUpdateStops: (isOpened: boolean) => void;
}

const LiveLinesHeader: React.FC<HeaderProps> = ({
  selectedDate,
  nowDate,
  selectedMachine,
  onDateChange,
  isOpenedUpdateStops,
  setIsOpenedUpdateStops,
}) => {
  const { hasResourcePermission } = usePermissions();
  const canView = hasResourcePermission('ihm_appointments', 'view');

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
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
      </Stack>
    </Row>
  );
};

export default LiveLinesHeader;
