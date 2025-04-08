import { format, startOfDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { getIndicator, getInfoIHM, getMaquinaInfo } from '../../api/apiRequests';
import PageLayout from '../../components/pageLayout';
import { IndicatorType } from '../../helpers/constants';
import { getShift } from '../../helpers/turn';
import useInterval from '../../hooks/useInterval';
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
import { iInfoIhmLive } from './interfaces/infoIhm';
import { iMaquinaInfo } from './interfaces/maquinaInfo.interface';

// cspell: words linecycle eficiencia recno
/* --------------------------------------------- TIPOS LOCAIS --------------------------------------------- */
type tShiftOptions = 'NOT' | 'MAT' | 'VES' | 'DEFAULT';
type IndicatorKey = 'eficiencia' | 'performance' | 'reparo';
type SetStateFunction = (value: number) => void;

interface iEfficiencyComparison {
  linha: number;
  turno: string;
  eficiencia: number;
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
  const shift = getShift();
  const turnos = {
    NOT: 'Noturno',
    MAT: 'Matutino',
    VES: 'Vespertino',
    TOT: 'Total',
  };

  /* -------------------------------------------- ESTADOS LOCAIS -------------------------------------------- */
  const [selectedDate, setSelectedDate] = useState<string>(nowDate);
  const [selectedLine, setSelectedLine] = useState<number>(1);
  const [selectedShift, setSelectedShift] = useState<string>(shift);
  const [effData, setEffData] = useState<iEff[]>([]);
  const [perfData, setPerfData] = useState<iPerf[]>([]);
  const [repData, setRepData] = useState<iRep[]>([]);
  const [eficiencia, setEficiencia] = useState<number>(0);
  const [performance, setPerformance] = useState<number>(0);
  const [reparos, setReparos] = useState<number>(0);
  const [productionTotal, setProductionTotal] = useState<number>(0);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [maquinaInfo, setMaquinaInfo] = useState<iMaquinaInfo[]>([]);
  const [infoIHM, setInfoIHM] = useState<iInfoIhmLive[]>([]);
  const [monthEff, setMonthEff] = useState<number>(0);
  const [turnEff, setTurnEff] = useState<number>(0);
  const [lineEff, setLineEff] = useState<number>(0);
  const [lineMatEff, setLineMatEff] = useState<number>(0);
  const [lineVesEff, setLineVesEff] = useState<number>(0);
  const [lineNotEff, setLineNotEff] = useState<number>(0);
  const [isOpenedUpdateStops, setIsOpenedUpdateStops] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  // const [containerHeight, setContainerHeight] = useState<string>('100%');

  /* ------------------------------------------------ HANDLES ----------------------------------------------- */
  const handleUpdate = () => {
    setIsUpdated((prev) => !prev);
  };

  // Mudança de data
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
      if (formattedDate === nowDate) {
        setSelectedShift(shift);
      }
    }
  };

  // Opções de turno
  const handleShiftOptions = useMemo(() => {
    const opt: Record<tShiftOptions, string[]> = {
      NOT: ['NOT'],
      MAT: ['MAT', 'NOT'],
      VES: ['VES', 'MAT', 'NOT'],
      DEFAULT: ['TOT', 'NOT', 'MAT', 'VES'],
    };

    return selectedDate === nowDate ? opt[shift as keyof typeof opt] : opt.DEFAULT;
  }, [nowDate, selectedDate, shift]);

  // Filtro de dados
  const filterData = useMemo(() => {
    return <T extends iIndicator>(data: T[]): T[] => {
      if (selectedShift === 'TOT') {
        return data.filter((item) => item.linha === selectedLine);
      }
      return data.filter(
        (item) => item.linha === selectedLine && item.turno === selectedShift
      );
    };
  }, [selectedLine, selectedShift]);

  // Média da eficiência
  const calculateAverage = <T extends { [K in IndicatorKey]?: number }>(
    data: T[],
    indicator: IndicatorKey,
    setState: SetStateFunction
  ): void => {
    const filteredData = data.filter(
      (item) => typeof item[indicator] === 'number' && item[indicator] > 0
    );

    if (filteredData.length === 0) {
      setState(0);
      return;
    }

    const average =
      filteredData.reduce((acc, curr) => acc + (curr[indicator] ?? 0), 0) /
      filteredData.length;
    setState(average * 100);
  };

  /* ------------------------------------------ REQUISIÇÕES DA API ------------------------------------------ */
  // Requisição de eficiência, performance e reparo
  const fetchIndicators = async () => {
    const [effData, perfData, repData] = await Promise.all([
      getIndicator(IndicatorType.EFFICIENCY, selectedDate, [
        'linha',
        'maquina_id',
        'turno',
        'data_registro',
        'total_produzido',
        'eficiencia',
      ]),
      getIndicator(IndicatorType.PERFORMANCE, selectedDate, [
        'linha',
        'turno',
        'data_registro',
        'performance',
      ]),
      getIndicator('repair', selectedDate, ['linha', 'turno', 'data_registro', 'reparo']),
    ]);
    // Setar os estados
    setEffData(effData);
    setPerfData(perfData);
    setRepData(repData);
  };

  // Requisição de Maquina Info
  const fetchMaqInfo = async () => {
    if (selectedMachine) {
      const params =
        selectedShift === 'TOT'
          ? { data: selectedDate, maquina_id: selectedMachine }
          : { data: selectedDate, turno: selectedShift, maquina_id: selectedMachine };
      const data = await getMaquinaInfo(params, [
        'ciclo_1_min',
        'hora_registro',
        'produto',
        'recno',
        'status',
        'tempo_parada',
      ]);
      setMaquinaInfo(data);
    }
  };

  // Requisição de info + ihm
  const fetchInfoIHM = async () => {
    const params =
      selectedShift === 'TOT'
        ? { data: selectedDate, linha: selectedLine }
        : { data: selectedDate, linha: selectedLine, turno: selectedShift };

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
  };

  /* ---------------------------------------------- USE EFFECTS --------------------------------------------- */
  // Requisição de indicadores
  useEffect(() => {
    void fetchIndicators();
  }, [selectedDate]);

  // Setar os valores dos indicadores
  useEffect(() => {
    const eficienciaFiltered = filterData(effData);
    calculateAverage(eficienciaFiltered, 'eficiencia', setEficiencia);
    calculateAverage(filterData(perfData), 'performance', setPerformance);
    calculateAverage(filterData(repData), 'reparo', setReparos);
    setProductionTotal(
      eficienciaFiltered.reduce((acc, curr) => acc + curr.total_produzido, 0)
    );
    setSelectedMachine(eficienciaFiltered[0]?.maquina_id ?? '');
  }, [effData, perfData, repData, filterData]);

  // Requisição de Maquina Info
  useEffect(() => {
    void fetchMaqInfo();
  }, [selectedMachine, selectedDate, selectedShift]);

  // Requisição de info + ihm
  useEffect(() => {
    void fetchInfoIHM();
  }, [selectedDate, selectedShift, selectedLine, isUpdated]);

  useEffect(() => {
    // Data inicial
    const now = startOfDay(new Date());
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayString = format(firstDay, 'yyyy-MM-dd');
    void getIndicator(
      IndicatorType.EFFICIENCY,
      [firstDayString],
      ['linha', 'turno', 'eficiencia']
    ).then((data: iEfficiencyComparison[]) => {
      // Média da eficiência
      const filteredData = data.filter((item) => item.eficiencia > 0);

      const average =
        filteredData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / filteredData.length;
      setMonthEff(average || 0);

      // Eficiência do turno
      const turnData = filteredData.filter((item) => item.turno === selectedShift);
      const turnAverage =
        turnData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / turnData.length;
      setTurnEff(turnAverage || 0);

      // Eficiência da linha
      const lineData = filteredData.filter((item) => item.linha === selectedLine);
      const lineAverage =
        lineData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / lineData.length;
      setLineEff(lineAverage || 0);

      // Eficiência da linha matutino
      const lineMatData = lineData.filter((item) => item.turno === 'MAT');
      const lineMatAverage =
        lineMatData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / lineMatData.length;
      setLineMatEff(lineMatAverage || 0);

      // Eficiência da linha vespertino
      const lineVesData = lineData.filter((item) => item.turno === 'VES');
      const lineVesAverage =
        lineVesData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / lineVesData.length;
      setLineVesEff(lineVesAverage || 0);

      // Eficiência da linha noturno
      const lineNotData = lineData.filter((item) => item.turno === 'NOT');
      const lineNotAverage =
        lineNotData.reduce(
          (acc, curr): number => acc + (Math.round(curr.eficiencia * 100) ?? 0),
          0
        ) / lineNotData.length;
      setLineNotEff(lineNotAverage || 0);
    });
  }, [selectedLine, selectedShift]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setContainerHeight(window.innerWidth >= 1200 ? '100%' : '400px');
  //   };

  //   // Configuração inicial
  //   handleResize();

  //   // Adiciona listener
  //   window.addEventListener('resize', handleResize);

  //   // Cleanup
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);
  /* --------------------------------------------- USE INTERVAL --------------------------------------------- */

  // Nova requisição em intervalo de 60s
  useInterval(
    () => {
      void fetchIndicators();
    },
    selectedDate === nowDate ? 60 * 1000 : null
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
    selectedDate === nowDate ? 60 * 1000 : null
  );

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <LiveLinesHeader
        selectedDate={selectedDate}
        nowDate={nowDate}
        selectedMachine={selectedMachine}
        onDateChange={handleDateChange}
        isOpenedUpdateStops={isOpenedUpdateStops}
        setIsOpenedUpdateStops={setIsOpenedUpdateStops}
      />
      <Row className='m-2 gap-1'>
        {/* --------------------------------------- COLUNA DOS GAUGES -------------------------------------- */}
        <Col
          xs={12}
          xl={5}
          className='card bg-transparent shadow d-flex justify-content-center border-0 mb-lg-0 mb-2'
        >
          <LineIndicators
            eficiencia={eficiencia}
            performance={performance}
            reparos={reparos}
          />
        </Col>
        {/* -------------------------------------- COLUNA DA PRODUÇÃO -------------------------------------- */}
        <Col xs={3} xl={2} className='card bg-transparent shadow mb-lg-0 mb-2'>
          <ProductionPanel
            productionTotal={productionTotal}
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
            factoryEff={monthEff}
            turnEff={turnEff}
            lineEff={lineEff}
            currentEff={eficiencia}
            currentTurn={selectedShift}
          />
        </Col>
      </Row>
      <Row className='d-flex m-2 gap-1'>
        {/* ------------------------------------- COLUNA DOS CONTROLES ------------------------------------- */}
        <Col xs xl={2} className='card bg-transparent border-0 h-100'>
          <LineControls
            selectedLine={selectedLine}
            selectedShift={selectedShift}
            lines={lines}
            turnos={turnos}
            shiftOptions={handleShiftOptions}
            onLineChange={setSelectedLine}
            onShiftChange={setSelectedShift}
            cardStyle={cardStyle}
            status={maquinaInfo.at(-1)?.status || '-'}
            statusRender={shift === selectedShift && selectedDate === nowDate}
            infoParada={infoIHM.at(-1)}
          />
        </Col>
        {/* --------------------------- COLUNA DOS GRÁFICOS DE CICLOS E TIMELINE --------------------------- */}
        <Col
          xs={12}
          xl
          className='card p-2 shadow border-0 bg-transparent justify-content-around'
        >
          <LineCycle maqInfo={maquinaInfo} />
          <Timeline data={infoIHM} />
        </Col>
        {/* -------------------------------------------- MÉDIAS -------------------------------------------- */}
        {monthEff > 0 && (
          <Col
            xs={12}
            xl={2}
            className='card bg-light p-2 bg-transparent border-0 shadow align-items-center'
            // style={{ height: containerHeight }}
          >
            <Row className='w-100 h-100'>
              <h6 className='mt-2 fs-6 text-center fw-bold text-dark-emphasis'>
                {' '}
                Eficiência Média da Linha
              </h6>
              {lineNotEff > 0 && <GaugeAverage average={lineNotEff} turn='Noturno' />}
              {lineMatEff > 0 && <GaugeAverage average={lineMatEff} turn='Matutino' />}
              {lineVesEff > 0 && <GaugeAverage average={lineVesEff} turn='Vespertino' />}
            </Row>
          </Col>
        )}
      </Row>
      {/* ----------------------------------- Tabela De Apontamentos ----------------------------------- */}
      {isOpenedUpdateStops && (
        <Col className='p-2'>
          <UpdateStops
            selectedDate={selectedDate}
            nowDate={nowDate}
            selectedLine={selectedLine}
            selectedShift={selectedShift}
            selectedMachine={selectedMachine}
            onUpdate={handleUpdate}
          />
        </Col>
      )}
    </PageLayout>
  );
};

export default LiveLines;
