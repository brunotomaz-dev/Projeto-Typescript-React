import { format, startOfDay } from 'date-fns';
import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import GaugeChart from '../../components/gauge';
import { IndicatorType, RecheioMeta } from '../../helpers/constants';
import { useIndicatorData } from '../../hooks/useIndicatorData';
import { usePermissions } from '../../hooks/usePermissions';
import Heatmap from './components/sfm.heatmap';
import HeatmapBxPeople from './components/sfm.HeatmapBxPeople';
import LineSFM from './components/sfm.line';
import PinnedActionPlans from './components/sfm.PinnedActionPlan';
import TodayActionPlans from './components/sfm.TodayActionPlans';

const ShopFloor: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { hasElementAccess } = usePermissions();
  /* ------------------------------------------- Encontra as datas ------------------------------------------ */
  // Encontrar a data de hoje, primeiro dia do mês passado e ultimo dia do mês passado
  const now = startOfDay(new Date());
  const firstDateOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDateOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finalDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  // Ajustar para o formato yyyy-mm-dd
  const currentMonthBeginningDateString = format(firstDateOfCurrentMonth, 'yyyy-MM-dd');
  const lastMonthFirstDateString = format(firstDateOfLastMonth, 'yyyy-MM-dd');
  const lastMonthFinalDateString = format(finalDayOfLastMonth, 'yyyy-MM-dd');

  /* ---------------------------------------- Requisições Mês Passado ---------------------------------------- */

  // Função para calcular a média de um array de objetos com base em uma chave específica
  const getAverage = (data: any[], key: string): number => {
    return data.reduce((acc, curr): number => acc + curr[key] * 100, 0) / data.length;
  };

  // Requisitar o indicador do mês passado
  const {
    data: { efficiency: lastMonthEfficiency, performance: lastMonthPerformance, repair: lastMonthRepairs },
  } = useIndicatorData([lastMonthFirstDateString, lastMonthFinalDateString]);

  // Criar a média de eficiência do mês passado
  const lastEfficiency = useMemo(() => {
    const filtered = lastMonthEfficiency.filter((item) => item.eficiencia > 0);
    return filtered.length ? getAverage(filtered, 'eficiencia') : 0;
  }, [lastMonthEfficiency]);

  // Criar a média de performance do mês passado
  const lastPerformance = useMemo(() => {
    return getAverage(lastMonthPerformance, 'performance');
  }, [lastMonthPerformance]);

  // Criar a média de reparo do mês passado
  const lastRepairs = useMemo(() => {
    return getAverage(lastMonthRepairs, 'reparo');
  }, [lastMonthRepairs]);

  /* ------------------------------------------ Requisições do mês atual ----------------------------------- */
  // Requisição dos indicadores
  const {
    data: {
      efficiency: currentMonthEfficiency,
      performance: currentMonthPerformance,
      repair: currentMonthRepairs,
    },
  } = useIndicatorData([currentMonthBeginningDateString]);

  // Calcular a média de eficiência do mês atual
  const currentEfficiency = useMemo(() => {
    const filtered = currentMonthEfficiency.filter((item) => item.eficiencia > 0);
    return filtered.length ? getAverage(filtered, 'eficiencia') : 0;
  }, [currentMonthEfficiency]);

  // Calcular a média de performance do mês atual
  const currentPerformance = useMemo(() => {
    return currentMonthPerformance.length ? getAverage(currentMonthPerformance, 'performance') : 0;
  }, [currentMonthPerformance]);

  // Calcular a média de reparo do mês atual
  const currentRepairs = useMemo(() => {
    return currentMonthRepairs.length ? getAverage(currentMonthRepairs, 'reparo') : 0;
  }, [currentMonthRepairs]);

  /* ------------------------------------------------ Layout ------------------------------------------------ */
  return (
    <>
      <h1 className='text-center'>Shop Floor Management</h1>
      <Card className='shadow bg-transparent border-0 p-3 mb-2'>
        <Row>
          <h3 className='text-center'>Eficiência - {RecheioMeta.EFFICIENCY}%</h3>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Anterior</p>
              <GaugeChart indicator={IndicatorType.EFFICIENCY} data={lastEfficiency} />
            </Card>
          </Col>
          <Col className='col-8'>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <Heatmap indicator={IndicatorType.EFFICIENCY} />
            </Card>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <LineSFM indicator={IndicatorType.EFFICIENCY} />
            </Card>
          </Col>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Atual</p>
              <GaugeChart indicator={IndicatorType.EFFICIENCY} data={currentEfficiency} />
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className='shadow bg-transparent border-0 p-3 mb-2'>
        <Row>
          <h3 className='text-center'>Performance - {RecheioMeta.PERFORMANCE}%</h3>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Anterior</p>
              <GaugeChart indicator={IndicatorType.PERFORMANCE} data={lastPerformance} />
            </Card>
          </Col>
          <Col className='col-8'>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <Heatmap indicator={IndicatorType.PERFORMANCE} />
            </Card>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <LineSFM indicator={IndicatorType.PERFORMANCE} />
            </Card>
          </Col>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Atual</p>
              <GaugeChart indicator={IndicatorType.PERFORMANCE} data={currentPerformance} />
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className='shadow bg-transparent border-0 p-3 mb-2'>
        <Row>
          <h3 className='text-center'>Reparos - {RecheioMeta.REPAIR}%</h3>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Anterior</p>
              <GaugeChart indicator={IndicatorType.REPAIR} data={lastRepairs} />
            </Card>
          </Col>
          <Col className='col-8'>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <Heatmap indicator={IndicatorType.REPAIR} />
            </Card>
            <Card className='bg-transparent border-0 p-0 mb-2'>
              <LineSFM indicator={IndicatorType.REPAIR} />
            </Card>
          </Col>
          <Col className='col-2'>
            <Card className='bg-transparent border-0 p-3 mb-2'>
              <p className='text-center'>Mês Atual</p>
              <GaugeChart indicator={IndicatorType.REPAIR} data={currentRepairs} />
            </Card>
          </Col>
        </Row>
      </Card>
      <Card className='shadow bg-transparent border-0 p-3 mb-2'>
        <Row>
          <h3 className='text-center'>Produção de Caixas por Pessoa - 50 cxs</h3>

          <HeatmapBxPeople />
        </Row>
      </Card>
      {hasElementAccess('sfm_action_plan') && (
        <>
          <TodayActionPlans />
          <PinnedActionPlans />
        </>
      )}
    </>
  );
};

export default ShopFloor;
