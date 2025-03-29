//cSpell: words linepicker
import { format, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import { Container, Stack } from 'react-bootstrap';
import SegmentedTurnBtn from '../../../components/SegmentedTurnBtn';
import { TurnoID } from '../../../helpers/constants';
import DashboardDatePicker from './management.d.datepicker';
import ManagementLinePicker from './management.d.linepicker';

// Interface para o range de datas
interface DateRange {
  startDate: string;
  endDate: string;
}

const ManagementDashboards: React.FC = () => {
  /* ----------------------------------------- Local State ---------------------------------------- */
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(startOfDay(new Date()), 'yyyy-MM-dd')
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    endDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [turn, setTurn] = useState<TurnoID>('ALL');

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Manipular mudanças de data (única ou range)
  const handleDateChange = (value: string | DateRange) => {
    if (typeof value === 'string') {
      setSelectedDate(value);
      setDateMode('single');
    } else {
      setDateRange(value);
      setDateMode('range');
    }
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Container fluid className='p-1'>
      <Stack direction='horizontal' gap={3} className='mb-3 justify-content-around'>
        <DashboardDatePicker
          selectedDate={dateMode === 'single' ? selectedDate : undefined}
          selectedRange={dateMode === 'range' ? dateRange : undefined}
          onChange={handleDateChange}
          initialMode={dateMode}
        />
        <SegmentedTurnBtn onTurnChange={(turno) => setTurn(turno)} turn={turn} all />
        <ManagementLinePicker onChange={setSelectedLines} />
      </Stack>

      {/* Exibir valores atuais das datas para debug/demonstração */}
      <div className='small text-muted mb-3'>
        {dateMode === 'single' ? (
          <span>Data selecionada: {selectedDate}</span>
        ) : (
          <span>
            Período: {dateRange.startDate} a {dateRange.endDate}
          </span>
        )}
      </div>

      {/* Resto do componente... */}
    </Container>
  );
};

export default ManagementDashboards;
