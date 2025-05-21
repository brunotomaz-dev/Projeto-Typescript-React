//cSpell: words linepicker
import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Form, Row, Stack } from 'react-bootstrap';
import { getInfoIHM } from '../../api/apiRequests';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { TurnoID } from '../../helpers/constants';
import { iInfoIHM } from '../../interfaces/InfoIHM.interface';
import DashBar from './components/Dash.Bar';
import DashTimeline from './components/Dash.Timeline';
import DashYamazumi from './components/Dash.Yamazumi';
import DashboardDatePicker from './components/management.d.datepicker';
import ManagementLinePicker from './components/management.d.linepicker';

// Interface para o range de datas
interface DateRange {
  startDate: string;
  endDate: string;
}

const ManagementDashboards: React.FC = () => {
  /* ----------------------------------------- Local State ---------------------------------------- */
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<string>(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    endDate: format(startOfDay(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [turn, setTurn] = useState<TurnoID>('ALL');
  const [infoIhmData, setInfoIhmData] = useState<iInfoIHM[]>([]);
  const [notAffBar, setNotAffBar] = useState<boolean>(false);

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    const dateChoice = dateMode === 'single' ? selectedDate : [dateRange.startDate, dateRange.endDate];

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
        <SegmentedTurnBtn
          onTurnChange={(turno) => setTurn(turno)}
          turn={turn}
          all
          key={'dashboards-turn'}
          small
        />
        <ManagementLinePicker onChange={setSelectedLines} />
      </Stack>
      <Row className='mb-3'>
        <Col>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashYamazumi data={infoIhmData} />
          </Card>
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
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'ALL'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Primeiro'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
      </Row>
      <Row className='mb-3'>
        <Col xs={12} xl={6} className='mb-3'>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Segundo'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Terceiro'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
      </Row>
      {dateMode === 'single' && (
        <Row>
          <Col xs={12}>
            <Card className='p-2 bg-transparent border-0 shadow-sm'>
              <DashTimeline data={infoIhmData} selectedLines={selectedLines} selectedShift={turn} />
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ManagementDashboards;
