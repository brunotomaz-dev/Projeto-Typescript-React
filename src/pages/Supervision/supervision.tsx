// cspell:words superv nivel exibicao

import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Container, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { getAbsenceData, getPresenceData } from '../../api/apiRequests';
import ActionPlanCards from '../../components/actionPlanCards';
import SegmentedTurnBtn from '../../components/SegmentedTurnBtn';
import { ActionPlanStatus, TurnoID, superTurns } from '../../helpers/constants';
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
import CardGauges from './components/Superv.CardGauges';
import CaixasPessoa from './components/superv.CxsPessoa';
import SupervDiscardsTable from './components/Superv.DiscardsTable';
import ProductionTable from './components/superv.prodTable';

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

  /* -------------------------------------------- HOOK -------------------------------------------- */
  const { isSuperUser, userFunctionalLevel } = usePermissions();
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

  const isLeadership = userFunctionalLevel === 1;
  const isSupervisor = userFunctionalLevel === 2;

  const statusFilter = useMemo(() => [ActionPlanStatus.Aberto, ActionPlanStatus.PDCA], []);

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

    // Segundo passo: filtrar por critérios de nível mínimo, pins e nível inicial máximo
    const filteredByRules = adjustedData.filter(
      (plan) =>
        // Superusuários veem todos os cards
        isSuperUser ||
        // Condições normais para outros usuários:
        plan.isPinned || // Sempre mostra os pinados
        (plan.lvl <= userFunctionalLevel && // Nível inicial do plano <= nível do usuário
          plan.nivelExibicao === userFunctionalLevel) // Nível de exibição === nível do usuário
    );

    // Terceiro passo: filtrar por turno se necessário (exceto para superusuários)
    if (userFunctionalLevel < 3 && !isSuperUser) {
      // Líderes (1) e supervisores (2) só veem seu próprio turno, a menos que sejam superusers
      setActionPlanToShow(filteredByRules.filter((plan) => plan.turno === superTurns[userName]));
    } else {
      // Coordenadores (3) e acima, e superusers, veem todos os turnos
      setActionPlanToShow(filteredByRules);
    }
  }, [actionPlanData, pinnedCards, userFunctionalLevel, userName, isSuperUser]); // Adicionando isSuperUser nas dependências

  /* ------------------------------------------ FUNCTIONS ----------------------------------------- */
  const levelAdjust = (data: iActionPlanCards[]): iActionToShow[] => {
    return data.map((plan) => {
      const diasAberto = plan.dias_aberto;
      const isPinned = pinnedCards.includes(plan.recno);

      // Verificar se é um plano em PDCA
      const isPDCA = plan.conclusao === 3;

      // Verificar se o plano PDCA está dentro do prazo
      const isPDCAComPrazo = isPDCA && plan.prazo;
      const estaDentroDoPrazo =
        isPDCAComPrazo && plan.prazo
          ? differenceInDays(parseISO(plan.prazo), startOfDay(new Date())) >= 0
          : false;

      // Ajuste para planos em PDCA
      if (isPDCA && estaDentroDoPrazo) {
        // Planos em PDCA dentro do prazo têm nível mínimo 3 (coordenação)
        // ou mantêm o nível inicial se for maior que 3
        const nivelPDCA = Math.max(3, plan.lvl);

        // Se estiver pinado, garantir nível mínimo 5
        const nivelFinal = isPinned ? Math.max(5, nivelPDCA) : nivelPDCA;

        return {
          ...plan,
          nivelExibicao: nivelFinal,
          isPinned,
        };
      }

      // Lógica original para outros casos
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
        isPinned,
      };
    });
  };

  // Função para carregar dados de ausência
  const loadAbsenceData = async () => {
    Promise.allSettled([getAbsenceData(selectedDate), getAbsenceData(selectedDate, true)])
      .then((results: PromiseSettledResult<iAbsence[]>[]) => {
        const [absData, absDaysOff] = results.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.error('Erro ao carregar dados de ausência:', result.reason);
            showToast('Erro ao carregar dados de ausência', 'danger');
            return [];
          }
        });

        // Une os dados de ausência e dias de ausencia, evitando duplicatas
        const combinedData = [...absData, ...absDaysOff].reduce((acc: iAbsence[], curr: iAbsence) => {
          const exists = acc.find((item) => item.recno === curr.recno);
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setAbsenceData(combinedData.filter((absence) => absence.turno === superTurn));
      })
      .catch((error) => {
        console.error('Erro ao carregar dados de ausência:', error);
        showToast('Erro ao carregar dados de ausência', 'danger');
      });
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

  const validRecnos = actionPlanData
    .filter((plan) => plan.conclusao === ActionPlanStatus.Aberto)
    .map((plan) => plan.recno);

  usePinnedCards(3, 'supervActionPinnedCards', {
    enabled: validRecnos.length > 0,
    validRecnos,
  });

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
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
          <Col style={{ minWidth: '340px', maxWidth: '450px' }}>
            <SegmentedTurnBtn turn={superTurn} onTurnChange={handleTurnChange} fullWidth />
          </Col>
        </Stack>

        <SupervActionCards actionPlanData={actionPlanToShow} />

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
            <Card className='bg-transparent border-0 h-100'>
              <CardGauges shift={superTurn} today={selectedDate} />
            </Card>
          </Col>
        </Row>

        <Row className='mb-3'>
          <SupervDiscardsTable />
        </Row>

        <SupervAbsence
          selectedDate={selectedDate}
          selectedTurno={superTurn}
          absenceData={absenceData}
          presenceData={presenceData}
          onDataChange={refreshData}
          onPresenceChange={handlePresentesTotal}
        />

        <Row>
          <ActionPlanCards status={statusFilter} shift={superTurn} onDataChange={setActionPlanData} />
        </Row>
      </Container>
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default SupervisionPage;
