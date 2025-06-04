import { format, startOfDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DateTurnFilter from '../../components/DateTurnFilter';
import { getShift } from '../../helpers/turn';
import { useLiveIndicatorsQuery } from '../../hooks/queries/useLiveIndicatorsQuery';
import { useInfoIHMQuery } from '../../hooks/queries/useLiveInfoIHMQuery';
import { useMachineInfoQuery } from '../../hooks/queries/useLiveMachineInfoQuery';
import { useFilters } from '../../hooks/useFilters';
import { setLiveSelectedMachine } from '../../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import BarStops from './components/barStops';
import EfficiencyComparison from './components/effComparison';
import GaugeAverage from './components/gaugeAverage';
import LineIndicators from './components/gauges';
import LiveLinesHeader from './components/header';
import LineControls from './components/lineControls';
import LineCycle from './components/linecycle';
import ProductionPanel from './components/productionCard';
import Timeline from './components/timeline';
import UpdateStops from './components/UpdateStops';

// cspell: words linecycle eficiencia recno

const LiveLines: React.FC = () => {
  /* ----------------------------------------------- VARIÁVEIS ---------------------------------------------- */
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');
  const shiftActual = getShift();

  /* -------------------------------------------- ESTADOS LOCAIS -------------------------------------------- */
  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = useState(false);

  // Estado para controle do modal de apontamentos
  const [isOpenedUpdateStops, setIsOpenedUpdateStops] = useState(false);

  // Estado para forçar atualização dos apontamentos
  const [updateTrigger, setUpdateTrigger] = useState(false);

  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const dispatch = useAppDispatch();
  // Buscar a linha selecionada diretamente do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);

  /* ----------------------------------------------- USE FILTERS ---------------------------------------------- */
  // Usar filtros com escopo 'liveLines'
  const { date } = useFilters('liveLines');

  /* ----------------------------------------------- USE QUERIES --------------------------------------------- */
  // Usar os novos hooks de query
  const {
    indicators,
    metrics,
    machineId,
    isLoading: indicatorsLoading,
    isFetching: indicatorsFetching,
  } = useLiveIndicatorsQuery(selectedLine);

  const { machineInfo, product } = useMachineInfoQuery(machineId);

  const { ihmData } = useInfoIHMQuery(selectedLine);

  /* ------------------------------------------------ HANDLES ----------------------------------------------- */
  // Toggle para mostrar/ocultar filtros
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  // Atualizar apontamentos
  const handleUpdateTrigger = () => {
    setUpdateTrigger((prev) => !prev);
  };

  // Toggle modal de apontamentos
  const toggleUpdateStops = () => {
    setIsOpenedUpdateStops((prev) => !prev);
  };

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
      case 'VES':
        // Nenhum turno desabilitado
        break;
    }

    return result;
  }, [date, nowDate, shiftActual]);

  // Verificar se é data histórica para habilitar opção "ALL" no filtro
  const isHistoricalDate = useMemo(() => {
    return date !== nowDate;
  }, [date, nowDate]);

  /* ---------------------------------------------- USE EFFECTS --------------------------------------------- */
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
      <LiveLinesHeader
        nowDate={nowDate}
        showFilters={showFilters}
        toggleFilters={toggleFilters}
        isOpenedUpdateStops={isOpenedUpdateStops}
        setIsOpenedUpdateStops={toggleUpdateStops}
      />

      {/* DateTurnFilter - Componente de filtros */}
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
          className='card bg-transparent shadow d-flex justify-content-center border-0 mb-lg-0 mb-2'
        >
          <LineIndicators
            eficiencia={indicators.efficiency}
            performance={indicators.performance}
            reparos={indicators.repair}
          />
        </Col>
        {/* -------------------------------------- COLUNA DA PRODUÇÃO -------------------------------------- */}
        <Col xs={3} xl={2} className='card bg-transparent shadow mb-lg-0 mb-2'>
          <ProductionPanel productionTotal={indicators.productionTotal} produto={product} />
        </Col>
        {/* --------------------------------------- COLUNA DE BARRAS --------------------------------------- */}
        <Col
          xs={5}
          xl
          className='card p-2 justify-content-center shadow bg-transparent border-0 mb-lg-0 mb-2'
        >
          <BarStops data={ihmData} cycleData={machineInfo} />
        </Col>
        {/* ---------------------_--------------- COLUNA DE COMPARAÇÃO -------------------------_----------- */}
        <Col xs xl className='card p-2 shadow bg-transparent border-0 mb-lg-0 mb-2'>
          <EfficiencyComparison
            factoryEff={metrics?.monthAverage || 0}
            turnEff={metrics?.turnAverage || 0}
            lineEff={metrics?.lineAverage || 0}
            currentEff={indicators.efficiency}
          />
        </Col>
      </Row>
      <Row className='d-flex m-2 gap-1'>
        {/* ------------------------------------- COLUNA DOS CONTROLES ------------------------------------- */}
        <Col xs xl={2} className='card bg-transparent border-0 h-100'>
          <LineControls />
        </Col>
        {/* --------------------------- COLUNA DOS GRÁFICOS DE CICLOS E TIMELINE --------------------------- */}
        <Col xs={12} xl className='card p-2 shadow border-0 bg-transparent justify-content-around'>
          <LineCycle maqInfo={machineInfo} />
          <Timeline data={ihmData} />
        </Col>
        {/* -------------------------------------------- MÉDIAS -------------------------------------------- */}
        {(metrics?.monthAverage || 0) > 0 && (
          <Col xs={12} xl={2} className='card bg-light p-2 bg-transparent border-0 shadow align-items-center'>
            <Row className='w-100 h-100'>
              <h6 className='mt-2 fs-6 text-center fw-bold text-dark-emphasis'> Eficiência Média da Linha</h6>
              {(metrics?.lineNotAverage || 0) > 0 && (
                <GaugeAverage average={metrics?.lineNotAverage || 0} turn='Noturno' />
              )}
              {(metrics?.lineMatAverage || 0) > 0 && (
                <GaugeAverage average={metrics?.lineMatAverage || 0} turn='Matutino' />
              )}
              {(metrics?.lineVesAverage || 0) > 0 && (
                <GaugeAverage average={metrics?.lineVesAverage || 0} turn='Vespertino' />
              )}
            </Row>
          </Col>
        )}
      </Row>
      {/* ----------------------------------- Tabela De Apontamentos ----------------------------------- */}
      {isOpenedUpdateStops && (
        <Col className='p-2'>
          <UpdateStops nowDate={nowDate} onUpdate={handleUpdateTrigger} />
        </Col>
      )}
    </>
  );
};

export default LiveLines;
