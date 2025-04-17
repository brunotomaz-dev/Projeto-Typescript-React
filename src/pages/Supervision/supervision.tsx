// cspell:words superv nivel exibicao

import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { getAbsenceData, getPresenceData } from '../../api/apiRequests';
import ActionPlanCards from '../../components/actionPlanCards';
import PageLayout from '../../components/pageLayout';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { ActionPlanStatus, superTurns, TurnoID } from '../../helpers/constants';
import { getShift } from '../../helpers/turn';
import { usePermissions } from '../../hooks/usePermissions';
import { usePinnedCards } from '../../hooks/usePinnedCards';
import { useToast } from '../../hooks/useToast';
import { iAbsence, iPresence } from '../../interfaces/Absence.interface';
import { iActionPlanCards } from '../../interfaces/ActionPlan.interface';
import { useAppSelector } from '../../redux/store/hooks';
import { RootState } from '../../redux/store/store';
import SupervActionCards from './components/super.ActionCards';
import SupervAbsence from './components/superv.Absence';
import AbsenceTable from './components/superv.AbsTable';
import CardGauges from './components/Superv.CardGauges';
import CaixasPessoa from './components/superv.CxsPessoa';
import SupervDiscardsTable from './components/Superv.DiscardsTable';
import PresenceTable from './components/superv.PresenceTable';
import ProductionTable from './components/superv.prodTable';
import { iDescartes } from './interface/Descartes.interface';

interface iActionToShow extends iActionPlanCards {
  nivelExibicao: number;
  isPinned: boolean;
}

const SupervisionPage: React.FC = () => {
  const now = new Date();
  const formatNow = format(startOfDay(now), 'yyyy-MM-dd');
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // User
  const userName = useAppSelector((state: RootState) => state.user.fullName);
  const userGroup = useAppSelector((state) => state.user.groups);
  const isSupervisor = userGroup.some((group) => group.includes('Supervisores'));
  const isLeadership = userGroup.some((group) => group.includes('Liderança'));

  /* -------------------------------------------- HOOK -------------------------------------------- */
  const { isSuperUser } = usePermissions();
  const { pinnedCards } = usePinnedCards();

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [superTurn, setSuperTurn] = useState<TurnoID>(getShift());
  const [selectedDate, setSelectedDate] = useState<string>(formatNow);
  const [absenceData, setAbsenceData] = useState<iAbsence[]>([]);
  const [presenceData, setPresenceData] = useState<iPresence[]>([]);
  const [totalProduction, setTotalProduction] = useState<number>(0);
  const [totalPresentes, setTotalPresentes] = useState<number>(0);
  const { showToast, ToastDisplay } = useToast();
  const [actionPlanData, setActionPlanData] = useState<iActionPlanCards[]>([]);
  const [actionPlanToShow, setActionPlanToShow] = useState<iActionToShow[]>([]);
  const [discards, setDiscards] = useState<iDescartes[]>([]);

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

  useEffect(() => {
    // Primeiro passo: aplicar o ajuste de nível aos dados
    const adjustedData = levelAdjust(actionPlanData);

    // Segundo passo: filtrar por critérios de nível mínimo e pinados
    const filteredByRules = adjustedData.filter(
      (plan) =>
        plan.isPinned ||
        ((isSupervisor || isSuperUser) && plan.nivelExibicao >= 2) ||
        (isLeadership && plan.nivelExibicao >= 1)
    );

    // Terceiro passo: filtrar por turno se necessário
    if (isLeadership || isSupervisor) {
      setActionPlanToShow(
        filteredByRules.filter((plan) => plan.turno === superTurns[userName])
      );
    } else {
      setActionPlanToShow(filteredByRules);
    }
  }, [actionPlanData, pinnedCards]);

  /* ------------------------------------------ FUNCTIONS ----------------------------------------- */
  const levelAdjust = (data: iActionPlanCards[]): iActionToShow[] => {
    return data.map((plan) => {
      const diasAberto = plan.dias_aberto;
      const isPinned = pinnedCards.includes(plan.recno);

      const nivelBaseadoEmDias =
        diasAberto >= 15
          ? 5
          : diasAberto >= 12
            ? 4
            : diasAberto >= 9
              ? 3
              : diasAberto >= 6
                ? 2
                : diasAberto >= 3
                  ? 1
                  : 0;

      // Cartões pinados sempre têm nível de exibição 5 para garantir que sejam mostrados
      const nivelFinal = isPinned
        ? Math.max(5, plan.lvl + nivelBaseadoEmDias)
        : plan.lvl + nivelBaseadoEmDias;

      return {
        ...plan,
        nivelExibicao: nivelFinal,
        isPinned, // Adicionada a informação para possível uso futuro
      };
    });
  };

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

  const handleDiscards = (data: iDescartes[]) => {
    setDiscards(data);
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h4 className='text-center fs-4'>
        {isSupervisor ? 'Supervisão - ' : isLeadership ? 'Liderança - ' : ''}
        {userName}
      </h4>
      <Container fluid>
        <Stack direction='horizontal' className='p-2 gap-5 mb-3'>
          <DatePicker
            selected={parseISO(selectedDate)}
            onChange={(date: Date | null) => handleDateChange(date)}
            dateFormat='dd/MM/yyyy'
            className='form-control text-center'
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

        <SupervActionCards actionPlanData={actionPlanToShow} />

        <Row className='my-3'>
          <Col xs={12} xl={4}>
            <ProductionTable
              shift={superTurn}
              todayString={selectedDate}
              totalProduction={handleProductionTotal}
              descartes={handleDiscards}
            />
          </Col>
          <Col>
            <CaixasPessoa totalProduction={totalProduction} presentes={totalPresentes} />
          </Col>
          <Col xs={12} xl={5}>
            <Card className='bg-transparent border-0 h-100'>
              <CardGauges shift={superTurn} today={selectedDate} />
            </Card>
          </Col>
        </Row>

        <Row className='mb-3'>
          <SupervDiscardsTable discardData={discards} />
        </Row>

        <SupervAbsence
          selectedDate={selectedDate}
          selectedTurno={superTurn}
          absenceData={absenceData}
          presenceData={presenceData}
          onDataChange={refreshData}
          onPresenceChange={handlePresentesTotal}
        />

        <Row className='g-1 mb-3'>
          <Col xs={12} xl={9}>
            <AbsenceTable absenceData={absenceData} onDataChange={refreshData} />
          </Col>
          <Col xs={12} xl>
            <PresenceTable presenceData={presenceData} onDataChange={refreshData} />
          </Col>
        </Row>

        <Row>
          <ActionPlanCards
            status={ActionPlanStatus.Aberto}
            shift={superTurn}
            onDataChange={setActionPlanData}
          />
        </Row>
      </Container>
      {ToastDisplay && <ToastDisplay />}
    </PageLayout>
  );
};

export default SupervisionPage;
