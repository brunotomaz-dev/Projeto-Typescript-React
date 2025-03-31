//cSpell: words linepicker
import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Container, Stack } from 'react-bootstrap';
import { getInfoIHM } from '../../../api/apiRequests';
import SegmentedTurnBtn from '../../../components/SegmentedTurnBtn';
import { TurnoID } from '../../../helpers/constants';
import { iInfoIHM } from '../../../interfaces/InfoIHM.interface';
import DashYamazumi from './Dash.Yamazumi';
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
  const [infoIhmData, setInfoIhmData] = useState<iInfoIHM[]>([]);

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    const dateChoice =
      dateMode === 'single' ? selectedDate : [dateRange.startDate, dateRange.endDate];

    void getInfoIHM(dateChoice).then((res: iInfoIHM[]) => {
      // Filtrar dados pela linha, se não for [] ou length = 14
      if (selectedLines.length > 0 && selectedLines.length !== 14) {
        res = res.filter((item) => selectedLines.includes(item.linha));
      }
      // Se o turno for diferente de ALL, filtrar os dados
      if (turn !== 'ALL') {
        res = res.filter((item) => item.turno === turn);
      }

      setInfoIhmData(res);
    });
  }, [dateMode, selectedDate, dateRange, selectedLines, turn]);

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
      <Stack direction='horizontal' gap={3} className='mb-5 justify-content-around'>
        <DashboardDatePicker
          selectedDate={dateMode === 'single' ? selectedDate : undefined}
          selectedRange={dateMode === 'range' ? dateRange : undefined}
          onChange={handleDateChange}
          initialMode={dateMode}
        />
        <SegmentedTurnBtn onTurnChange={(turno) => setTurn(turno)} turn={turn} all />
        <ManagementLinePicker onChange={setSelectedLines} />
      </Stack>
      <DashYamazumi data={infoIhmData} />
    </Container>
  );
};

export default ManagementDashboards;
