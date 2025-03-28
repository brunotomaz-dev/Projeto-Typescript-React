import { format, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import { Card, Container, Stack } from 'react-bootstrap';
import DashboardDatePicker from './management.d.datepicker';
import ManagementLinePicker from './management.d.linepicker';

const ManagementDashboards: React.FC = () => {
  /* ----------------------------------------- Local State ---------------------------------------- */
  const [selectedDate, setSelectedDate] = useState<string>(
    format(startOfDay(new Date()), 'yyyy-MM-dd')
  );
  const [selectedLines, setSelectedLines] = useState<number[]>([]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Container fluid className='p-1'>
      <Stack direction='horizontal' gap={3} className='mb-3'>
        <DashboardDatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
        <ManagementLinePicker onChange={setSelectedLines} />
        <Card className='p-2'>Shift Selector - Em Construção</Card>
      </Stack>
      <p>{selectedLines}</p>
    </Container>
  );
};

export default ManagementDashboards;
