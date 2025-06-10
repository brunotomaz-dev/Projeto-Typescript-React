import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { getProduction } from '../../../api/apiRequests';
import { setCurrentMonthProduction } from '../../../redux/store/features/productionMonthSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';
import ProductionCard from './monthProductionCard';

interface iTodayProductionCardsProps {
  // Propriedades
  firstDay: Date;
}

interface iProductionData {
  data_registro: string;
  produto: string;
  turno: string;
  total_produzido: number;
}

interface iSetProductionState {
  (value: iProductionData[]): void;
}

const MonthProdCardsMNT: React.FC<iTodayProductionCardsProps> = ({ firstDay }) => {
  /* ------------------------------------------------- DATAS ------------------------------------------------ */
  // Função para formatar o nome do mês
  const formatMonthName = (date: Date): string => {
    const monthName = format(date, 'MMMM', { locale: ptBR });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  // Baseado em firstDay, encontra o primeiro e último dia do mês anterior
  const firstDayLastMonth = new Date(firstDay);
  firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1);
  const lastDayLastMonth = new Date(firstDay);
  lastDayLastMonth.setDate(0);
  const monthNameLM = formatMonthName(firstDayLastMonth);

  // Faz o mesmo para pegar mais um mês anterior
  const firstDayTwoMonthsAgo = new Date(firstDayLastMonth);
  firstDayTwoMonthsAgo.setMonth(firstDayTwoMonthsAgo.getMonth() - 1);
  const lastDayTwoMonthsAgo = new Date(firstDayLastMonth);
  lastDayTwoMonthsAgo.setDate(0);
  const monthNameL2M = formatMonthName(firstDayTwoMonthsAgo);

  // Criar enum ou objeto para turnos
  const TURNOS = {
    NOTURNO: 'NOT',
    MATUTINO: 'MAT',
    VESPERTINO: 'VES',
  } as const;

  /* --------------------------------------------- ESTADO GLOBAL -------------------------------------------- */
  // Dispatch para enviar para o Redux
  const dispatch = useAppDispatch();
  // Seleciona o estado do Redux
  const currentMonthProduction = useAppSelector((state) => state.monthlyProduction.currentMonthProduction);

  /* ------------------------------------ INICIALIZAÇÃO DE ESTADOS LOCAIS ----------------------------------- */
  const [productionLM, setProductionLM] = useState<any[]>([]);
  const [productionL2M, setProductionL2M] = useState<any[]>([]);

  /* ------------------------------------------ REQUISIÇÃO DE DADOS ----------------------------------------- */
  const fetchProduction = async (
    dates: string[],
    setProdState: iSetProductionState | ((value: iProductionData[]) => void)
  ): Promise<void> => {
    // Faz a requisição
    const production: iProductionData[] = await getProduction(dates, [
      'data_registro',
      'produto',
      'turno',
      'total_produzido',
    ]);
    setProdState(production);
  };

  /* ------------------------------------------------ FUNÇÕES ----------------------------------------------- */
  const getAverageProduction = (production: iProductionData[]) => {
    return production.reduce((acc, item) => acc + item.total_produzido, 0);
  };

  // Criar hook para lógica de produção por turno
  const useProductionByShift = (production: iProductionData[]) => {
    const total = useMemo(() => getAverageProduction(production), [production]);
    const night = useMemo(
      () => getAverageProduction(production.filter((item) => item.turno === TURNOS.NOTURNO)),
      [production]
    );
    const morning = useMemo(
      () => getAverageProduction(production.filter((item) => item.turno === TURNOS.MATUTINO)),
      [production]
    );
    const afternoon = useMemo(
      () => getAverageProduction(production.filter((item) => item.turno === TURNOS.VESPERTINO)),
      [production]
    );

    return { total, night, morning, afternoon };
  };

  /* --------------------------------------------- CICLO DE VIDA -------------------------------------------- */
  useEffect(() => {
    fetchProduction([format(startOfDay(firstDay), 'yyyy-MM-dd')], (data) =>
      dispatch(setCurrentMonthProduction(data))
    );
  }, [dispatch]);

  useEffect(() => {
    fetchProduction(
      [format(startOfDay(firstDayLastMonth), 'yyyy-MM-dd'), format(lastDayLastMonth, 'yyyy-MM-dd')],
      setProductionLM
    );
    fetchProduction(
      [format(startOfDay(firstDayTwoMonthsAgo), 'yyyy-MM-dd'), format(lastDayTwoMonthsAgo, 'yyyy-MM-dd')],
      setProductionL2M
    );
  }, [firstDay]);

  // Calcula a produção total e por turno para o mês atual
  const {
    total: totalProduction,
    night: nightProduction,
    morning: morningProduction,
    afternoon: afternoonProduction,
  } = useProductionByShift(currentMonthProduction);

  // Calcula a produção total e por turno para o mês anterior
  const {
    total: totalProductionLM,
    night: nightProductionLM,
    morning: morningProductionLM,
    afternoon: afternoonProductionLM,
  } = useProductionByShift(productionLM);

  // Calcula a produção total e por turno para o mês retrasado
  const {
    total: totalProductionL2M,
    night: nightProductionL2M,
    morning: morningProductionL2M,
    afternoon: afternoonProductionL2M,
  } = useProductionByShift(productionL2M);

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <Card className='p-2 mt-2'>
      <ProductionCard
        title='Produção do Mês'
        total={totalProduction}
        night={nightProduction}
        morning={morningProduction}
        afternoon={afternoonProduction}
      />
      <ProductionCard
        title={`Produção de ${monthNameLM}`}
        total={totalProductionLM}
        night={nightProductionLM}
        morning={morningProductionLM}
        afternoon={afternoonProductionLM}
      />
      <ProductionCard
        title={`Produção de ${monthNameL2M}`}
        total={totalProductionL2M}
        night={nightProductionL2M}
        morning={morningProductionL2M}
        afternoon={afternoonProductionL2M}
      />
    </Card>
  );
};

export default MonthProdCardsMNT;
