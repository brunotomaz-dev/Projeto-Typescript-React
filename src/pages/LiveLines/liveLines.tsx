import { format, startOfDay } from 'date-fns';
import React, { useEffect, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import DateTurnFilter from '../../components/DateTurnFilter';
import { getShift } from '../../helpers/turn';
import { useLiveIndicatorsQuery } from '../../hooks/queries/useLiveIndicatorsQuery';
import { useFilters } from '../../hooks/useFilters';
import { useFiltersVisibility } from '../../hooks/useFiltersVisibility';
import { setTurn } from '../../redux/store/features/filterSlice';
import { setLiveSelectedMachine, setLiveSelectedShift } from '../../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import BarStops from './components/barStops';
import EfficiencyComparison from './components/effComparison';
import LineIndicators from './components/gauges';
import LiveLinesHeader from './components/header';
import LineAverages from './components/lineAverages';
import LineControls from './components/lineControls';
import LineCycle from './components/linecycle';
import ProductionPanel from './components/productionCard';
import Timeline from './components/timeline';
import TimelineSummary from './components/timelineSummary';
import UpdateStops from './components/UpdateStops';

// cspell: words linecycle eficiencia recno

const LiveLines: React.FC = () => {
  /* ----------------------------------------------- VARIÁVEIS ---------------------------------------------- */
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');
  const shiftActual = getShift(); // Obter o turno atual no momento da renderização inicial

  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const dispatch = useAppDispatch();
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  const isOpenedUpdateStops = useAppSelector((state) => state.liveLines.isOpenedUpdateStops);

  /* ----------------------------------------------- HOOKS ---------------------------------------------- */
  const { date } = useFilters('liveLines');
  const { isVisible: showFilters } = useFiltersVisibility('liveLines');

  /* ----------------------------------------------- USE QUERIES --------------------------------------------- */
  // Hooks de query
  const { machineId } = useLiveIndicatorsQuery(selectedLine);

  /* ------------------------------------------------ USE MEMO ----------------------------------------------- */
  // Verificar quais turnos devem ser desabilitados
  const disabledTurns = useMemo(() => {
    // Se não estiver na data atual, nenhum turno fica desabilitado
    if (date !== nowDate) {
      return {};
    }

    const result: Record<string, boolean> = {};

    // Lógica para desabilitar turnos futuros baseado no turno atual
    switch (shiftActual) {
      case 'NOT':
        result.MAT = true;
        result.VES = true;
        break;
      case 'MAT':
        result.VES = true;
        break;
    }

    return result;
  }, [date, nowDate, shiftActual]);

  // Verificar se é data histórica para habilitar opção "ALL" no filtro
  const isHistoricalDate = useMemo(() => {
    return date !== nowDate;
  }, [date, nowDate]);

  /* ---------------------------------------------- USE EFFECTS --------------------------------------------- */
  // Efeito para atualizar o turno atual ao montar o componente
  useEffect(() => {
    // Obter o turno atual novamente (para garantir a atualização)
    const currentShift = getShift();
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

    // Se estamos na data atual, atualizar o turno
    if (date === today) {
      // Atualizar no slice específico do LiveLines
      dispatch(setLiveSelectedShift(currentShift));

      // Atualizar também no sistema de filtros, mas apenas se estiver na data atual
      dispatch(setTurn({ scope: 'liveLines', turn: currentShift }));
    }
  }, [dispatch, date]); // Executar quando o componente for montado e quando a data mudar

  // Sincronizar a máquina selecionada com o Redux
  useEffect(() => {
    if (machineId) {
      dispatch(setLiveSelectedMachine(machineId));
    }
  }, [machineId, dispatch]);

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <>
      {/* Header agora não recebe mais props */}
      <LiveLinesHeader />

      {/* DateTurnFilter usa visibilidade do Redux */}
      <Row className='mx-2'>
        <DateTurnFilter
          show={showFilters}
          scope='liveLines'
          all={isHistoricalDate}
          disabled={disabledTurns}
        />
      </Row>

      <Row className='m-2 gap-1'>
        {/* --------------------------------------- COLUNA DOS GAUGES -------------------------------------- */}
        <Col
          xs={12}
          xl={5}
          className='card bg-light shadow d-flex justify-content-center border-0 mb-lg-0 mb-2'
        >
          <LineIndicators />
        </Col>
        {/* -------------------------------------- COLUNA DA PRODUÇÃO -------------------------------------- */}
        <Col xs={3} xl={2} className='card bg-light shadow mb-lg-0 mb-2'>
          <ProductionPanel />
        </Col>
        {/* --------------------------------------- COLUNA DE BARRAS --------------------------------------- */}
        <Col xs={5} xl className='card p-2 justify-content-center shadow bg-light border-0 mb-lg-0 mb-2'>
          <BarStops />
        </Col>
        {/* ---------------------_--------------- COLUNA DE COMPARAÇÃO ------------------------------------- */}
        <Col xs xl className='card p-2 shadow bg-light border-0 mb-lg-0 mb-2'>
          <EfficiencyComparison />
        </Col>
      </Row>
      <Row className='d-flex m-2 gap-1'>
        {/* ------------------------------------- COLUNA DOS CONTROLES ------------------------------------- */}
        <Col xs xl={2} className='card bg-transparent border-0 h-100'>
          <LineControls />
        </Col>
        {/* --------------------------- COLUNA DOS GRÁFICOS DE CICLOS E TIMELINE --------------------------- */}
        <Col xs={12} xl className='card p-2 shadow border-0 bg-light justify-content-around'>
          <LineCycle />
          <Timeline />
          <TimelineSummary />
        </Col>
        {/* -------------------------------------------- MÉDIAS -------------------------------------------- */}

        <Col xs={12} xl={2} className='card bg-light p-2 bg-light border-0 shadow align-items-center'>
          <LineAverages />
        </Col>
      </Row>
      {/* ----------------------------------- Tabela De Apontamentos ----------------------------------- */}
      {isOpenedUpdateStops && (
        <Col className='p-2'>
          <UpdateStops nowDate={nowDate} onUpdate={() => {}} />
        </Col>
      )}
    </>
  );
};

export default LiveLines;
