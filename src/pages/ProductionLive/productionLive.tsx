import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getHourProduction, getProduction } from '../../api/apiRequests';
import PageLayout from '../../components/pageLayout';
import { useAppSelector } from '../../redux/store/hooks';
import { RootState } from '../../redux/store/store';
import ProductionLiveTable from './components/productionLive.table';

interface ProductionData {
  maquina_id: string;
  intervalo: string;
  total: number;
  linha?: number;
}

interface iMaqLine {
  maquina_id: string;
  linha: number;
}

const ProductionLive: React.FC = () => {
  const MaqLine = useAppSelector((state: RootState) => state.home.lineMachine);
  const [prodHour, setProdHour] = useState<ProductionData[]>([]);
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(nowDate);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados de produção e relação máquina-linha
  const fetchData = async (date: string, isToday: boolean) => {
    try {
      setError(null);
      // Busca dados de produção por hora
      const hourlyData = await getHourProduction(date);

      // Se for hoje, usa MaqLine do Redux, senão busca dados históricos
      if (isToday) {
        setProdHour(
          hourlyData.map((item: ProductionData) => ({
            ...item,
            linha: MaqLine[item.maquina_id as keyof typeof MaqLine],
          }))
        );
      } else {
        // Busca relação histórica de máquina-linha
        const historicalData: iMaqLine[] = await getProduction(date, ['maquina_id', 'linha']);
        const maqLineHistorical = changeMaqLine(historicalData);

        setProdHour(
          hourlyData.map((item: ProductionData) => ({
            ...item,
            linha: maqLineHistorical[item.maquina_id as keyof typeof maqLineHistorical],
          }))
        );
      }
    } catch (err) {
      setError((err as Error).message);
      setProdHour([]);
    }
  };

  // Effect para carregar dados iniciais ou quando a data mudar
  useEffect(() => {
    const isToday = selectedDate === nowDate;
    void fetchData(selectedDate, isToday);
  }, [selectedDate, nowDate, MaqLine]);

  const changeMaqLine = (data: iMaqLine[]) => {
    return data.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.maquina_id] = curr.linha;
      return acc;
    }, {});
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
    }
  };

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1 className='text-center p-2'>Caixas produzidas por hora</h1>
      <div className='d-flex justify-content-between mb-2 ms-3'>
        <DatePicker
          selected={parseISO(selectedDate)}
          onChange={(date: Date | null) => handleDateChange(date)}
          dateFormat='dd/MM/yyyy'
          className='form-control text-center '
          calendarIconClassName='mr-2'
          icon={'bi bi-calendar'}
          showIcon={true}
          // withPortal={true}
          popperClassName='custom-popper'
          calendarClassName='custom-calendar'
          locale={ptBR}
          minDate={parseISO('2024-08-01')}
          maxDate={now}
        />
      </div>
      {!error ? (
        <ProductionLiveTable data={prodHour} />
      ) : (
        <div className='alert alert-warning text-center' role='alert'>
          <i className='bi bi-exclamation-triangle me-2'></i>
          {error}
        </div>
      )}
    </PageLayout>
  );
};

export default ProductionLive;
