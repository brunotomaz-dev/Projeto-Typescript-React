import { format, startOfDay } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { getIndicator } from '../../../api/apiRequests';
import { ColorsSTM, IndicatorType } from '../../../helpers/constants';

interface iLineProps {
  indicator: IndicatorType;
}

interface iLineData {
  data_registro: string;
  [key: string]: string | number | undefined;
}

const LineSFM: React.FC<iLineProps> = ({ indicator }) => {
  // Data inicial
  const now = startOfDay(new Date());
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayString = format(firstDay, 'yyyy-MM-dd');

  /* --------------------------------------------- Estado local --------------------------------------------- */
  const [DBData, setDBData] = useState<iLineData[]>([]);

  /* -------------------------------------------- Requisição API -------------------------------------------- */
  useEffect(() => {
    const indicatorDB = indicator === IndicatorType.REPAIR ? 'repair' : indicator;
    void getIndicator(indicatorDB, [firstDayString], ['data_registro', `${indicator}`]).then(
      (data: iLineData[]) => {
        setDBData(data);
      }
    );
  }, [firstDayString, indicator]);

  /* ------------------------------------------- Ajuste dos dados ------------------------------------------- */
  const processData = useMemo(() => {
    if (!DBData.length) return [];
    // Remover onde o valor do indicador é 0 se o indicador for eficiencia
    const filtered =
      indicator === IndicatorType.EFFICIENCY ? DBData.filter((item) => Number(item[indicator]) > 0) : DBData;

    // Agrupar por data_registro
    const grouped = filtered.reduce<{ [key: string]: iLineData[] }>((acc, curr) => {
      const key = curr.data_registro;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    }, {});

    // Calcular média por dia
    return Object.entries(grouped)
      .map(([date, items]) => ({
        data_registro: date.split('-')[2],
        [indicator]: Math.round(
          (items.reduce((sum, item) => sum + Number(item[indicator]), 0) / items.length) * 100
        ),
      }))
      .sort((a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime());
  }, [DBData, indicator]);

  // Ajustar para ter todas as datas do mês, preenchendo com 0 onde ainda não há dados
  const allDatesData = useMemo(() => {
    const allDates = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const allDatesArray = Array.from({ length: allDates }, (_, i) => String(i + 1).padStart(2, '0'));
    return allDatesArray.map(
      (date) =>
        processData.find((item) => item.data_registro === date) || { data_registro: date, [indicator]: 0 }
    );
  }, [processData, indicator]);

  /* -------------------------------------------- Options echart -------------------------------------------- */
  const meta = {
    [IndicatorType.EFFICIENCY]: 90,
    [IndicatorType.PERFORMANCE]: 4,
    [IndicatorType.REPAIR]: 4,
  };

  const option = {
    xAxis: {
      type: 'category',
      data: allDatesData.map((item) => item.data_registro),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: allDatesData.map((item) => item[indicator]),
        type: 'line',
        smooth: true,
        markLine: {
          data: [
            {
              lineStyle: { color: ColorsSTM.RED, type: 'dashed' },
              yAxis: meta[indicator],
              label: { formatter: 'Meta', position: 'end', backgroundColor: 'transparent' },
            },
          ],
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: '{b} : {c}%',
      confine: true,
      axisPointer: { type: 'cross' },
    },
    grid: {
      // x: '5%',
      left: '5%',
      right: '5%',
      y: '10%',
      height: '80%',
    },
  };

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return <EChartsReact option={option} opts={{ renderer: 'canvas' }} style={{ height: '100px' }} />;
};

export default LineSFM;
