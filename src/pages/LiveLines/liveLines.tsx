import { format, startOfDay } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { getIndicator, getInfoIHM, getMaquinaInfo } from '../../api/apiRequests';
import DateTurnFilter from '../../components/DateTurnFilter';
import { IndicatorType } from '../../helpers/constants';
import { getShift } from '../../helpers/turn';
import { useFilters } from '../../hooks/useFilters';
import useInterval from '../../hooks/useInterval';
import {
  setLiveSelectedDate,
  setLiveSelectedMachine,
  setLiveSelectedShift,
} from '../../redux/store/features/liveLinesSlice';
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
import { iEff, iIndicator, iPerf, iRep } from './interfaces/indicator.interfaces';
import { iInfoIhmLive } from './interfaces/infoIhm.interface';
import { iMaquinaInfo } from './interfaces/maquinaInfo.interface';

// cspell: words linecycle eficiencia recno
/* --------------------------------------------- TIPOS LOCAIS --------------------------------------------- */
type tShiftOptions = 'NOT' | 'MAT' | 'VES' | 'DEFAULT';
type IndicatorKey = 'eficiencia' | 'performance' | 'reparo';

interface iEfficiencyComparison {
  linha: number;
  turno: string;
  eficiencia: number;
}

// Interfaces para estados consolidados
interface LineFilters {
  date: string;
  line: number;
  shift: string;
}

interface IndicatorData {
  efficiency: iEff[];
  performance: iPerf[];
  repair: iRep[];
}

interface EfficiencyMetrics {
  monthAverage: number;
  turnAverage: number;
  lineAverage: number;
  lineMatAverage: number;
  lineVesAverage: number;
  lineNotAverage: number;
}

interface UiState {
  isOpenedUpdateStops: boolean;
  isUpdated: boolean;
}

/* -------------------------------------------------------------------------------------------------------- */
/*                                           Componente Principal                                           */
/* -------------------------------------------------------------------------------------------------------- */

const LiveLines: React.FC = () => {
  /* ----------------------------------------------- VARIÁVEIS ---------------------------------------------- */
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');
  const lines = Array.from({ length: 14 }, (_, i) => i + 1);
  const cardStyle = { borderRadius: '10px', fontSize: '1.5vw' };
  const shiftActual = getShift();
  const turnos = {
    NOT: 'Noturno',
    MAT: 'Matutino',
    VES: 'Vespertino',
    ALL: 'Todos Turnos',
  };

  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const dispatch = useAppDispatch();
  const reduxShift = useAppSelector((state) => state.liveLines.selectedShift);

  /* -------------------------------------------- ESTADOS LOCAIS -------------------------------------------- */
  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = useState(false);

  // 1. Estado consolidado para filtros
  const [filters, setFilters] = useState<LineFilters>({
    date: nowDate,
    line: 1,
    shift: reduxShift,
  });

  // 2. Estado consolidado para dados de indicadores
  const [indicatorData, setIndicatorData] = useState<IndicatorData>({
    efficiency: [],
    performance: [],
    repair: [],
  });

  // 3. Estado para informações da máquina selecionada
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [maquinaInfo, setMaquinaInfo] = useState<iMaquinaInfo[]>([]);
  const [infoIHM, setInfoIHM] = useState<iInfoIhmLive[]>([]);

  // 4. Estado consolidado para métricas de eficiência
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetrics>({
    monthAverage: 0,
    turnAverage: 0,
    lineAverage: 0,
    lineMatAverage: 0,
    lineVesAverage: 0,
    lineNotAverage: 0,
  });

  // 5. Estado para controle da UI
  const [uiState, setUiState] = useState<UiState>({
    isOpenedUpdateStops: false,
    isUpdated: false,
  });

  /* ----------------------------------------------- USE FILTERS ---------------------------------------------- */
  // Usar o hook de filtros com escopo específico para LiveLines
  const { date, turn, setDateFilter, setTurnFilter } = useFilters('liveLines');

  // Sincronizar os filtros do Redux com os locais
  useEffect(() => {
    // Atualizar filtros locais baseado no useFilters
    setFilters((prev) => ({
      ...prev,
      date,
      shift: turn,
    }));

    // Sincronizar com Redux de LiveLines (mantendo compatibilidade)
    dispatch(setLiveSelectedDate(date));
    dispatch(setLiveSelectedShift(turn));
  }, [date, turn, dispatch]);

  /* ------------------------------------------------ HANDLES ----------------------------------------------- */
  // Toggle para mostrar/ocultar filtros
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Atualiza os dados dos apontamentos
  const handleUpdate = useCallback(() => {
    setUiState((prev) => ({ ...prev, isUpdated: !prev.isUpdated }));
  }, []);

  // Atualiza os filtros
  const updateFilter = useCallback(
    (key: keyof LineFilters, value: string | number) => {
      setFilters((prev) => ({ ...prev, [key]: value }));

      // Sincronização com Redux quando necessário
      if (key === 'date') dispatch(setLiveSelectedDate(value as string));
      if (key === 'shift') dispatch(setLiveSelectedShift(value as string));
    },
    [dispatch]
  );

  // Mudança de data (manter para compatibilidade enquanto refatoramos)
  const handleDateChange = useCallback(
    (date: Date | null) => {
      if (date) {
        const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
        updateFilter('date', formattedDate);
        setDateFilter(date); // Atualizar também no novo sistema de filtros

        if (formattedDate === nowDate) {
          updateFilter('shift', reduxShift);
        }
      }
    },
    [nowDate, reduxShift, updateFilter, setDateFilter]
  );

  // Mudança de turno (manter para compatibilidade enquanto refatoramos)
  const handleShiftChange = useCallback(
    (shift: string) => {
      updateFilter('shift', shift);
      setTurnFilter(shift as any); // Atualizar também no novo sistema de filtros
    },
    [updateFilter, setTurnFilter]
  );

  // Mudança de linha
  const handleLineChange = useCallback(
    (line: number) => {
      updateFilter('line', line);
    },
    [updateFilter]
  );

  // Controle do modal de apontamentos
  const toggleUpdateStops = useCallback(() => {
    setUiState((prev) => ({ ...prev, isOpenedUpdateStops: !prev.isOpenedUpdateStops }));
  }, []);

  // Opções de turno
  const shiftOptions = useMemo(() => {
    const opt: Record<tShiftOptions, string[]> = {
      NOT: ['NOT'],
      MAT: ['MAT', 'NOT'],
      VES: ['VES', 'MAT', 'NOT'],
      DEFAULT: ['ALL', 'NOT', 'MAT', 'VES'],
    };

    return filters.date === nowDate ? opt[shiftActual as keyof typeof opt] : opt.DEFAULT;
  }, [nowDate, filters.date, shiftActual]);

  // Verifica se o turno atual é o mesmo do Redux para ver se habilita o botão
  const disabledTurns = useMemo(() => {
    // Se não estiver na data atual, nenhum turno fica desabilitado
    if (date !== nowDate) {
      return {};
    }

    const result: Record<string, boolean> = {};

    // Lógica para desabilitar turnos futuros baseado no turno atual
    switch (shiftActual) {
      case 'NOT': // Se estamos no turno noturno
        result.MAT = true; // Desabilita matutino
        result.VES = true; // Desabilita vespertino
        break;
      case 'MAT': // Se estamos no turno matutino
        result.VES = true; // Desabilita apenas vespertino
        break;
      case 'VES': // Se estamos no turno vespertino
        // Nenhum turno é desabilitado, pois todos já aconteceram
        break;
    }

    return result;
  }, [date, nowDate, shiftActual]);

  // Verificar se a data atual é diferente da data do sistema
  // para configurar a propriedade 'all' do DateTurnFilter
  const isHistoricalDate = useMemo(() => {
    return filters.date !== nowDate;
  }, [filters.date, nowDate]);

  // Filtro de dados
  const filterData = useCallback(
    <T extends iIndicator>(data: T[]): T[] => {
      if (filters.shift === 'ALL') {
        return data.filter((item) => item.linha === filters.line);
      }
      return data.filter((item) => item.linha === filters.line && item.turno === filters.shift);
    },
    [filters.line, filters.shift]
  );

  // Média da eficiência
  const calculateAverage = useCallback(
    <T extends { [K in IndicatorKey]?: number }>(data: T[], indicator: IndicatorKey): number => {
      const filteredData = data.filter((item) => typeof item[indicator] === 'number' && item[indicator] > 0);

      if (filteredData.length === 0) {
        return 0;
      }

      const average =
        filteredData.reduce((acc, curr) => acc + (curr[indicator] ?? 0), 0) / filteredData.length;
      return average * 100;
    },
    []
  );

  /* ------------------------------------------ REQUISIÇÕES DA API ------------------------------------------ */
  // Requisição de eficiência, performance e reparo
  const fetchIndicators = useCallback(async () => {
    try {
      const [effData, perfData, repData] = await Promise.all([
        getIndicator(IndicatorType.EFFICIENCY, filters.date, [
          'linha',
          'maquina_id',
          'turno',
          'data_registro',
          'total_produzido',
          'eficiencia',
        ]),
        getIndicator(IndicatorType.PERFORMANCE, filters.date, [
          'linha',
          'turno',
          'data_registro',
          'performance',
        ]),
        getIndicator('repair', filters.date, ['linha', 'turno', 'data_registro', 'reparo']),
      ]);

      // Atualiza o estado consolidado
      setIndicatorData({
        efficiency: effData,
        performance: perfData,
        repair: repData,
      });
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
    }
  }, [filters.date]);

  // Requisição de Maquina Info
  const fetchMaqInfo = useCallback(async () => {
    if (selectedMachine) {
      try {
        const params =
          filters.shift === 'ALL'
            ? { data: filters.date, maquina_id: selectedMachine }
            : { data: filters.date, turno: filters.shift, maquina_id: selectedMachine };

        const data = await getMaquinaInfo(params, [
          'ciclo_1_min',
          'hora_registro',
          'produto',
          'recno',
          'status',
          'tempo_parada',
        ]);
        setMaquinaInfo(data);
      } catch (error) {
        console.error('Erro ao buscar info da máquina:', error);
      }
    }
  }, [selectedMachine, filters.date, filters.shift]);

  // Requisição de info + ihm
  const fetchInfoIHM = useCallback(async () => {
    try {
      const params =
        filters.shift === 'ALL'
          ? { data: filters.date, linha: filters.line }
          : { data: filters.date, linha: filters.line, turno: filters.shift };

      const data = await getInfoIHM(params, [
        'status',
        'data_hora',
        'data_hora_final',
        'motivo',
        'problema',
        'causa',
        'tempo',
        'afeta_eff',
      ]);
      setInfoIHM(data);
    } catch (error) {
      console.error('Erro ao buscar info IHM:', error);
    }
  }, [filters.date, filters.shift, filters.line]);

  // Requisição de eficiência média
  const fetchEfficiencyMetrics = useCallback(async () => {
    try {
      // Data inicial
      const now = startOfDay(new Date());
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayString = format(firstDay, 'yyyy-MM-dd');

      const data: iEfficiencyComparison[] = await getIndicator(
        IndicatorType.EFFICIENCY,
        [firstDayString],
        ['linha', 'turno', 'eficiencia']
      );

      // Filtra dados válidos
      const filteredData = data.filter((item) => item.eficiencia > 0);

      if (filteredData.length === 0) {
        return;
      }

      // Média da eficiência
      const calculateMetricAverage = (items: iEfficiencyComparison[]): number => {
        if (items.length === 0) return 0;
        return items.reduce((acc, curr) => acc + (Math.round(curr.eficiencia * 100) ?? 0), 0) / items.length;
      };

      // Cálculo de todas as médias
      const monthAverage = calculateMetricAverage(filteredData);

      // Eficiência do turno
      const turnData = filteredData.filter((item) => item.turno === filters.shift);
      const turnAverage = calculateMetricAverage(turnData);

      // Eficiência da linha
      const lineData = filteredData.filter((item) => item.linha === filters.line);
      const lineAverage = calculateMetricAverage(lineData);

      // Eficiência da linha por turno
      const lineMatData = lineData.filter((item) => item.turno === 'MAT');
      const lineMatAverage = calculateMetricAverage(lineMatData);

      const lineVesData = lineData.filter((item) => item.turno === 'VES');
      const lineVesAverage = calculateMetricAverage(lineVesData);

      const lineNotData = lineData.filter((item) => item.turno === 'NOT');
      const lineNotAverage = calculateMetricAverage(lineNotData);

      // Atualiza o estado consolidado de métricas
      setEfficiencyMetrics({
        monthAverage,
        turnAverage,
        lineAverage,
        lineMatAverage,
        lineVesAverage,
        lineNotAverage,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas de eficiência:', error);
    }
  }, [filters.line, filters.shift]);

  /* ------------------------------------------------ UseMemo ------------------------------------------------ */
  // Dados filtrados dos indicadores
  const filteredData = useMemo(
    () => ({
      efficiency: filterData(indicatorData.efficiency),
      performance: filterData(indicatorData.performance),
      repair: filterData(indicatorData.repair),
    }),
    [indicatorData, filterData]
  );

  // Cálculo dos indicadores a partir dos dados filtrados
  const indicators = useMemo(
    () => ({
      efficiency: calculateAverage(filteredData.efficiency, 'eficiencia'),
      performance: calculateAverage(filteredData.performance, 'performance'),
      repair: calculateAverage(filteredData.repair, 'reparo'),
      productionTotal: filteredData.efficiency.reduce((acc, curr) => acc + curr.total_produzido, 0),
    }),
    [filteredData, calculateAverage]
  );

  /* ---------------------------------------------- USE EFFECTS --------------------------------------------- */
  // Requisição de indicadores quando a data muda
  useEffect(() => {
    void fetchIndicators();
  }, [fetchIndicators]);

  // Atualizar máquina selecionada quando dados de eficiência mudam
  useEffect(() => {
    const machineId = filteredData.efficiency[0]?.maquina_id ?? '';
    setSelectedMachine(machineId);
    dispatch(setLiveSelectedMachine(machineId));
  }, [filteredData.efficiency, dispatch]);

  // Requisição de Maquina Info quando máquina/data/turno mudam
  useEffect(() => {
    void fetchMaqInfo();
  }, [fetchMaqInfo]);

  // Requisição de info + ihm quando data/turno/linha mudam
  useEffect(() => {
    void fetchInfoIHM();
  }, [fetchInfoIHM]);

  // Requisição de eficiência média quando linha/turno mudam
  useEffect(() => {
    void fetchEfficiencyMetrics();
  }, [fetchEfficiencyMetrics]);

  // Limpeza do componente
  useEffect(() => {
    return () => {
      // Restaura os dados do redux
      dispatch(setLiveSelectedDate(nowDate));
      dispatch(setLiveSelectedMachine(''));
      dispatch(setLiveSelectedShift(shiftActual));
    };
  }, [dispatch, nowDate, shiftActual]);

  /* --------------------------------------------- USE INTERVAL --------------------------------------------- */
  // Atualizações periódicas
  useInterval(
    () => {
      void fetchIndicators();
    },
    filters.date === nowDate ? 60 * 1000 : null
  );

  useInterval(
    () => {
      void fetchMaqInfo();
    },
    selectedMachine ? 60 * 1000 : null
  );

  useInterval(
    () => {
      void fetchInfoIHM();
    },
    filters.date === nowDate ? 60 * 1000 : null
  );

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <LiveLinesHeader
        nowDate={nowDate}
        showFilters={showFilters}
        toggleFilters={toggleFilters}
        isOpenedUpdateStops={uiState.isOpenedUpdateStops}
        setIsOpenedUpdateStops={toggleUpdateStops}
      />

      {/* DateTurnFilter - Novo componente de filtros */}
      <Row className='mx-2'>
        <DateTurnFilter
          show={showFilters}
          scope='liveLines'
          all={isHistoricalDate} // Ativar 'all' quando a data for histórica
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
          <ProductionPanel
            productionTotal={indicators.productionTotal}
            produto={maquinaInfo.at(-1)?.produto?.trim() || '-'}
          />
        </Col>
        {/* --------------------------------------- COLUNA DE BARRAS --------------------------------------- */}
        <Col
          xs={5}
          xl
          className='card p-2 justify-content-center shadow bg-transparent border-0 mb-lg-0 mb-2'
        >
          <BarStops data={infoIHM} cycleData={maquinaInfo} />
        </Col>
        {/* ---------------------_--------------- COLUNA DE COMPARAÇÃO -------------------------_----------- */}
        <Col xs xl className='card p-2 shadow bg-transparent border-0 mb-lg-0 mb-2'>
          <EfficiencyComparison
            factoryEff={efficiencyMetrics.monthAverage}
            turnEff={efficiencyMetrics.turnAverage}
            lineEff={efficiencyMetrics.lineAverage}
            currentEff={indicators.efficiency}
          />
        </Col>
      </Row>
      <Row className='d-flex m-2 gap-1'>
        {/* ------------------------------------- COLUNA DOS CONTROLES ------------------------------------- */}
        <Col xs xl={2} className='card bg-transparent border-0 h-100'>
          <LineControls
            selectedLine={filters.line}
            lines={lines}
            turnos={turnos}
            shiftOptions={shiftOptions}
            onLineChange={handleLineChange}
            onShiftChange={handleShiftChange}
            cardStyle={cardStyle}
            status={maquinaInfo.at(-1)?.status || '-'}
            statusRender={reduxShift === filters.shift && filters.date === nowDate}
            infoParada={infoIHM.at(-1)}
          />
        </Col>
        {/* --------------------------- COLUNA DOS GRÁFICOS DE CICLOS E TIMELINE --------------------------- */}
        <Col xs={12} xl className='card p-2 shadow border-0 bg-transparent justify-content-around'>
          <LineCycle maqInfo={maquinaInfo} />
          <Timeline data={infoIHM} />
        </Col>
        {/* -------------------------------------------- MÉDIAS -------------------------------------------- */}
        {efficiencyMetrics.monthAverage > 0 && (
          <Col xs={12} xl={2} className='card bg-light p-2 bg-transparent border-0 shadow align-items-center'>
            <Row className='w-100 h-100'>
              <h6 className='mt-2 fs-6 text-center fw-bold text-dark-emphasis'> Eficiência Média da Linha</h6>
              {efficiencyMetrics.lineNotAverage > 0 && (
                <GaugeAverage average={efficiencyMetrics.lineNotAverage} turn='Noturno' />
              )}
              {efficiencyMetrics.lineMatAverage > 0 && (
                <GaugeAverage average={efficiencyMetrics.lineMatAverage} turn='Matutino' />
              )}
              {efficiencyMetrics.lineVesAverage > 0 && (
                <GaugeAverage average={efficiencyMetrics.lineVesAverage} turn='Vespertino' />
              )}
            </Row>
          </Col>
        )}
      </Row>
      {/* ----------------------------------- Tabela De Apontamentos ----------------------------------- */}
      {uiState.isOpenedUpdateStops && (
        <Col className='p-2'>
          <UpdateStops nowDate={nowDate} selectedLine={filters.line} onUpdate={handleUpdate} />
        </Col>
      )}
    </>
  );
};

export default LiveLines;
