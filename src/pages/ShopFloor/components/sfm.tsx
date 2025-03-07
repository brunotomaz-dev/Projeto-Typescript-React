import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { getIndicator } from '../../../api/apiRequests';
import GaugeChart from '../../../components/gauge';
import { IndicatorType, RecheioMeta } from '../../../helpers/constants';
import { useAppSelector } from '../../../redux/store/hooks';
import { RootState } from '../../../redux/store/store';
import Heatmap from './sfm.heatmap';
import LineSFM from './sfm.line';

interface iEff {
  data_registro: string;
  eficiencia: number;
}

interface iRep {
  data_registro: string;
  reparo: number;
}

interface iPerf {
  data_registro: string;
  performance: number;
}

const ShopFloor: React.FC = () => {
  /* --------------------------------------- Recuperar dados do redux --------------------------------------- */
  const isCollapsed = useAppSelector((state: RootState) => state.sidebar.isCollapsed);

  /* ------------------------------------------ Inicia estado local ----------------------------------------- */
  const [lastEfficiency, setLastEfficiency] = useState<number>(0);
  const [lastPerformance, setLastPerformance] = useState<number>(0);
  const [lastRepairs, setLastRepairs] = useState<number>(0);
  const [currentEfficiency, setCurrentEfficiency] = useState<number>(0);
  const [currentPerformance, setCurrentPerformance] = useState<number>(0);
  const [currentRepairs, setCurrentRepairs] = useState<number>(0);

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

  /* ---------------------------------------------- Requisições --------------------------------------------- */
  useEffect(() => {
    // Requisita o indicador de eficiencia
    void getIndicator(
      IndicatorType.EFFICIENCY,
      [lastMonthFirstDateString, lastMonthFinalDateString],
      ['data_registro', 'eficiencia']
    ).then((data: iEff[]) => {
      // Remover onde a eficiencia é 0
      data = data.filter((item) => item.eficiencia > 0);
      // Obter a média de eficiencia
      const average = data.reduce((acc, curr): number => acc + curr.eficiencia, 0) / data.length;
      setLastEfficiency(average * 100);
    });

    // Requisita o indicador de performance
    void getIndicator(
      IndicatorType.PERFORMANCE,
      [lastMonthFirstDateString, lastMonthFinalDateString],
      ['data_registro', 'performance']
    ).then((data: iPerf[]) => {
      // Obter a média de performance
      const average = data.reduce((acc, curr): number => acc + curr.performance, 0) / data.length;
      setLastPerformance(average * 100);
    });

    // Requisita o indicador de reparo
    void getIndicator('repair', [lastMonthFirstDateString, lastMonthFinalDateString], ['data_registro', 'reparo']).then(
      (data: iRep[]) => {
        // Obter a média de reparo
        const average = data.reduce((acc, curr): number => acc + curr.reparo, 0) / data.length;
        setLastRepairs(average * 100);
      }
    );
  }, [lastMonthFirstDateString, lastMonthFinalDateString]);

  // Requisitar os indicadores de eficiencia, performance e reparo do mês atual
  useEffect(() => {
    // Indicador de eficiencia
    void getIndicator(
      IndicatorType.EFFICIENCY,
      [currentMonthBeginningDateString],
      ['data_registro', 'eficiencia']
    ).then((data: iEff[]) => {
      // Remover onde a eficiencia é 0
      data = data.filter((item) => item.eficiencia > 0);
      // Obter a média de eficiencia
      const average = data.reduce((acc, curr): number => acc + curr.eficiencia, 0) / data.length;
      setCurrentEfficiency(average * 100);
    });

    // Indicador de performance
    void getIndicator(
      IndicatorType.PERFORMANCE,
      [currentMonthBeginningDateString],
      ['data_registro', 'performance']
    ).then((data: iPerf[]) => {
      // Obter a média de performance
      const average = data.reduce((acc, curr): number => acc + curr.performance, 0) / data.length;
      setCurrentPerformance(average * 100);
    });

    // Indicador de reparo
    void getIndicator('repair', [currentMonthBeginningDateString], ['data_registro', 'reparo']).then((data: iRep[]) => {
      // Obter a média de reparo
      const average = data.reduce((acc, curr): number => acc + curr.reparo, 0) / data.length;
      setCurrentRepairs(average * 100);
    });
  }, [currentMonthBeginningDateString]);

  /* ------------------------------------------------ Layout ------------------------------------------------ */
  return (
    <main className={`p-2 w-100 main-content ${isCollapsed ? 'collapsed' : ''}`}>
      <h1 className='text-center'>Shop Floor Management</h1>
      <section>
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
              <Card className='bg-transparent border-0 p-3 mb-2'>
                <Heatmap indicator={IndicatorType.EFFICIENCY} />
              </Card>
              <Card className='bg-transparent border-0 p-3 mb-2'>
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
              <Card className='bg-transparent border-0 p-3 mb-2'>
                <Heatmap indicator={IndicatorType.PERFORMANCE} />
              </Card>
              <Card className='bg-transparent border-0 p-3 mb-2'>
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
              <Card className='bg-transparent border-0 p-3 mb-2'>
                <Heatmap indicator={IndicatorType.REPAIR} />
              </Card>
              <Card className='bg-transparent border-0 p-3 mb-2'>
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
      </section>
    </main>
  );
};

export default ShopFloor;
