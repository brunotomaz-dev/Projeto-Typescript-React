import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { getEstoqueMovimentacao, getProduction } from '../../../api/apiRequests';
import { setDailyProductionInWarehouse } from '../../../redux/store/features/productionSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

interface iTodayProductionCardsProps {
  // Propriedades
  today: Date;
}
interface iProduction {
  produto: string;
  turno: 'MAT' | 'VES' | 'NOT';
  total_produzido: number;
}

interface iProductionCF {
  hora: string;
  quantidade: number;
  data: string;
  unidade: string;
}

const TodayProductionCards: React.FC<iTodayProductionCardsProps> = ({ today }) => {
  /* ------------------------------------------------- REDUX ------------------------------------------------ */
  const dispatch = useAppDispatch();
  const productionCF = useAppSelector((state) => state.production.dailyProductionInWarehouse);

  /* ------------------------------------ INICIALIZAÇÃO DE ESTADOS LOCAIS ----------------------------------- */
  const [production, setProduction] = useState<iProduction[]>([]);
  const [totalProduction, setTotalProduction] = useState<number>(0);
  const [nightProduction, setNightProduction] = useState<number>(0);
  const [morningProduction, setMorningProduction] = useState<number>(0);
  const [afternoonProduction, setAfternoonProduction] = useState<number>(0);
  // const [productionCF, setProductionCF] = useState<iProductionCF[]>([]);
  const [productionCFNight, setProductionCFNight] = useState<number>(0);
  const [productionCFMorning, setProductionCFMorning] = useState<number>(0);
  const [productionCFAfternoon, setProductionCFAfternoon] = useState<number>(0);
  const [productionCFTotal, setProductionCFTotal] = useState<number>(0);

  /* ------------------------------------------ REQUISIÇÃO DE DADOS ----------------------------------------- */
  const fetchTodayProduction = async () => {
    // Faz a requisição
    const production: iProduction[] = await getProduction(format(startOfDay(today), 'yyyy-MM-dd'), [
      'produto',
      'turno',
      'total_produzido',
    ]);
    setProduction(production);
  };

  /* ------------------------------------------------ FUNÇÕES ----------------------------------------------- */
  const getAverageProduction = (production: iProduction[]) => {
    return production.reduce((acc, item) => acc + item.total_produzido, 0);
  };

  const getAverageProductionCF = (production: iProductionCF[]) => {
    return production.reduce((acc, item) => acc + item.quantidade, 0);
  };

  const turnFilter = (turno: string) => {
    // Horários iniciais e finais dos turnos
    const turnos = {
      MAT: { start: 8, end: 16 },
      VES: { start: 16, end: 24 },
      NOT: { start: 0, end: 8 },
    };

    // Retorna a produção do turno
    return productionCF.filter((item) => {
      const hour = Number(item.hora.split(':')[0]);
      return (
        hour >= turnos[turno as keyof typeof turnos].start &&
        hour < turnos[turno as keyof typeof turnos].end
      );
    });
  };

  console.log(productionCF);
  /* -------------------------------------------- CICLO DE VIDA -------------------------------------------- */
  useEffect(() => {
    fetchTodayProduction();
    // void getEstoqueMovimentacao().then((data: iProductionCF[]) => setProductionCF(data));
    void getEstoqueMovimentacao().then((data: iProductionCF[]) => {
      dispatch(setDailyProductionInWarehouse(data));
    });
  }, []);

  useEffect(() => {
    setTotalProduction(getAverageProduction(production));
    setNightProduction(getAverageProduction(production.filter((item) => item.turno === 'NOT')));
    setMorningProduction(getAverageProduction(production.filter((item) => item.turno === 'MAT')));
    setAfternoonProduction(getAverageProduction(production.filter((item) => item.turno === 'VES')));
  }, [production]);

  useEffect(() => {
    setProductionCFNight(getAverageProductionCF(turnFilter('NOT')));
    setProductionCFMorning(getAverageProductionCF(turnFilter('MAT')));
    setProductionCFAfternoon(getAverageProductionCF(turnFilter('VES')));
    setProductionCFTotal(getAverageProductionCF(productionCF));
  }, [productionCF]);

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <Card className='p-2'>
      <Card.Header className='fw-bold fst-italic'>
        Produção do dia {format(startOfDay(today), 'dd/MM/yyyy')}
      </Card.Header>
      <Card.Body>
        <Row>
          <Col className='border-end'>
            <h6>Produção Total</h6>
            <p className='fs-3'>{Math.round(totalProduction / 10).toLocaleString('pt-BR')} cxs</p>
            <h6>Câmara fria</h6>
            <p className='fs-3 mb-0'>{Math.round(productionCFTotal).toLocaleString('pt-BR')} cxs</p>
          </Col>
          <Col className='border-end'>
            <h6>Produção Noturno</h6>
            <p className='fs-3'>{Math.round(nightProduction / 10).toLocaleString('pt-BR')} cxs</p>
            <h6>Câmara fria</h6>
            <p className='fs-3 mb-0'>{Math.round(productionCFNight).toLocaleString('pt-BR')} cxs</p>
          </Col>
          <Col className='border-end'>
            <h6>Produção Matutino</h6>
            <p className='fs-3'>{Math.round(morningProduction / 10).toLocaleString('pt-BR')} cxs</p>
            <h6>Câmara fria</h6>
            <p className='fs-3 mb-0'>
              {Math.round(productionCFMorning).toLocaleString('pt-BR')} cxs
            </p>
          </Col>
          <Col>
            <h6>Produção Vespertino</h6>
            <p className='fs-3'>
              {Math.round(afternoonProduction / 10).toLocaleString('pt-BR')} cxs
            </p>
            <h6>Câmara fria</h6>
            <p className='fs-3 mb-0'>
              {Math.round(productionCFAfternoon).toLocaleString('pt-BR')} cxs
            </p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TodayProductionCards;
