// cspell:words superv

import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { getAbsenceData, getPresenceData } from '../../api/apiRequests';
import PageLayout from '../../components/pageLayout';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { groupLevels, superTurns, TurnoID } from '../../helpers/constants';
import { getShift } from '../../helpers/turn';
import { useToast } from '../../hooks/useToast';
import { iAbsence, iPresence } from '../../interfaces/Absence.interface';
import { useAppSelector } from '../../redux/store/hooks';
import { RootState } from '../../redux/store/store';
import SupervAbsence from './components/superv.Absence';
import AbsenceTable from './components/superv.AbsTable';
import CardGauges from './components/Superv.CardGauges';
import CaixasPessoa from './components/superv.CxsPessoa';
import PresenceTable from './components/superv.PresenceTable';
import ProductionTable from './components/superv.prodTable';

const SupervisionPage: React.FC = () => {
  const now = new Date();
  const formatNow = format(startOfDay(now), 'yyyy-MM-dd');
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // User
  const userName = useAppSelector((state: RootState) => state.user.fullName);
  const userGroup = useAppSelector((state) => state.user.groups);
  const isSupervisor = userGroup.some((group) => groupLevels[4].includes(group));
  // const isLeadership = userGroup.some((group) => groupLevels[5].includes(group));

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [superTurn, setSuperTurn] = useState<TurnoID>(getShift());
  const [selectedDate, setSelectedDate] = useState<string>(formatNow);
  const [absenceData, setAbsenceData] = useState<iAbsence[]>([]);
  const [presenceData, setPresenceData] = useState<iPresence[]>([]);
  const [totalProduction, setTotalProduction] = useState<number>(0);
  const [totalPresentes, setTotalPresentes] = useState<number>(0);
  const { showToast, ToastDisplay } = useToast();

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

  useEffect(() => {
    loadAbsenceData();
    loadPresenceData();
  }, [selectedDate, superTurn]);

  /* ------------------------------------------ FUNCTIONS ----------------------------------------- */
  // Função para carregar dados de ausência
  const loadAbsenceData = async () => {
    try {
      const data: iAbsence[] = await getAbsenceData(selectedDate);
      setAbsenceData(data.filter((absence) => absence.turno === superTurn));
    } catch (error) {
      console.error('Erro ao carregar dados de ausência:', error);
      showToast('Erro ao carregar dados de ausência', 'danger');
    }
  };

  // Função para carregar dados de presença
  const loadPresenceData = async () => {
    try {
      const data: iPresence[] = await getPresenceData(selectedDate);
      setPresenceData(data.filter((presence) => presence.turno === superTurn));
    } catch (error) {
      console.error('Erro ao carregar dados de presença:', error);
      showToast('Erro ao carregar dados de presença', 'danger');
    }
  };

  // Função para recarregar os dados após operações
  const refreshData = () => {
    loadAbsenceData();
    loadPresenceData();
  };

  const handleProductionTotal = (total: number) => {
    setTotalProduction(total);
  };

  const handlePresentesTotal = (total: number) => {
    setTotalPresentes(total);
  };

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
            popperClassName='custom-popper'
            calendarClassName='custom-calendar'
            locale={ptBR}
            minDate={parseISO('2024-08-01')}
            maxDate={now}
          />
          <SegmentedTurnBtn turn={superTurn} onTurnChange={handleTurnChange} />
        </Stack>
        <Row className='my-3'>
          <Col xs={12} xl={4}>
            <ProductionTable
              shift={superTurn}
              todayString={selectedDate}
              totalProduction={handleProductionTotal}
            />
          </Col>
          <Col>
            <CaixasPessoa totalProduction={totalProduction} presentes={totalPresentes} />
          </Col>
          <Col xs={12} xl={5}>
            <Card className='border-0 h-100 bg-transparent'>
              <CardGauges shift={superTurn} today={selectedDate} />
            </Card>
          </Col>
        </Row>
        <SupervAbsence
          selectedDate={selectedDate}
          selectedTurno={superTurn}
          absenceData={absenceData}
          presenceData={presenceData}
          onDataChange={refreshData}
          onPresenceChange={handlePresentesTotal}
        />
        <Row className='mb-3 g-1'>
          <Col xs={12} xl={9}>
            <AbsenceTable
              absenceData={absenceData}
              onDataChange={refreshData}
              isSupervisor={isSupervisor}
            />
          </Col>
          <Col xs={12} xl>
            <PresenceTable presenceData={presenceData} onDataChange={refreshData} />
          </Col>
        </Row>
      </Container>
      {ToastDisplay && <ToastDisplay />}
    </PageLayout>
  );
};

export default SupervisionPage;
