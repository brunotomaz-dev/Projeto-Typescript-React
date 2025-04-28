import { format, startOfDay } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { getIndicator } from '../../../api/apiRequests';
import { ColorsSTM, IndicatorType, TurnosObj } from '../../../helpers/constants';
import { heatmapAdjust } from '../../../helpers/heatmapAdjust';
import { iHeatmapData } from '../../../interfaces/Heatmap.interface';
import SegmentedButtonTurno from './Sfm.SegmentedButton';

interface iHeatmapProps {
  indicator: IndicatorType;
}

interface iInd {
  data_registro: string;
  linha?: number;
  turno?: string;
  [key: string]: string | number | undefined;
}

const Heatmap: React.FC<iHeatmapProps> = ({ indicator }) => {
  // Data inicial
  const now = startOfDay(new Date());
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayString = format(firstDay, 'yyyy-MM-dd');

  /* --------------------------------------------- Estado local --------------------------------------------- */
  const [selectedTurno, setSelectedTurno] = useState<string>('');
  const [showByLine, setShowByLine] = useState<boolean>(false);
  const [indicatorData, setData] = useState<iInd[]>([]);
  const [heatmapData, setHeatmapData] = useState<iHeatmapData>({ x: [], y: [], z: [] });
  const [options, setOptions] = useState({});

  /* -------------------------------------------- Requisição API -------------------------------------------- */
  useEffect(() => {
    // Se o indicador for reparo, o nome da tabela do db é repair

    const indicatorDB = indicator === IndicatorType.REPAIR ? 'repair' : indicator;
    void getIndicator(
      indicatorDB,
      [firstDayString],
      ['data_registro', 'linha', 'turno', `${indicator}`]
    ).then((data: iInd[]) => {
      setData(data);
    });
  }, [firstDayString, indicator]);

  /* ------------------------------------------------ Filtra ------------------------------------------------ */
  const processData = useMemo(() => {
    if (!indicatorData.length) return [];

    return showByLine
      ? indicatorData
          .filter((item) => !selectedTurno || item.turno === selectedTurno)
          .map((curr) => ({
            linha: curr.linha,
            data_registro: curr.data_registro,
            [indicator]: Number(curr[indicator]) * 100,
          }))
      : indicatorData.map((curr) => ({
          data_registro: curr.data_registro,
          turno: curr.turno,
          [indicator]: Number(curr[indicator]) * 100,
        }));
  }, [indicatorData, selectedTurno, showByLine, indicator]);

  /* ------------------------------------------- Turno/Line change ------------------------------------------ */
  const handleTurnoChange = (turno: string) => {
    setSelectedTurno(turno);
    setHeatmapData(heatmapAdjust(processData, indicator));
  };

  const handleLineTurnChange = (show: boolean) => {
    setShowByLine(show);
    if (!show) setSelectedTurno('');
    setHeatmapData(heatmapAdjust(processData, indicator));
  };

  // Processar dados iniciais
  useEffect(() => {
    if (indicatorData.length > 0) {
      const processedData = processData;
      setHeatmapData(heatmapAdjust(processedData, indicator));
    }
  }, [indicatorData, indicator, processData]);

  /* ------------------------------------------------ Option ------------------------------------------------ */
  useEffect(() => {
    const meta = {
      [IndicatorType.EFFICIENCY]: 90,
      [IndicatorType.PERFORMANCE]: 4,
      [IndicatorType.REPAIR]: 4,
    };

    const piecesColor = {
      [IndicatorType.EFFICIENCY]: [
        { min: 0, max: 89.99, color: ColorsSTM.RED },
        { min: 90, max: 150, color: ColorsSTM.GREEN },
      ],
      [IndicatorType.PERFORMANCE]: [
        { min: 0, max: 3.99, color: ColorsSTM.GREEN },
        { min: 4, max: 150, color: ColorsSTM.RED },
      ],
      [IndicatorType.REPAIR]: [
        { min: 0, max: 3.99, color: ColorsSTM.GREEN },
        { min: 4, max: 150, color: ColorsSTM.RED },
      ],
    };

    const visualShow = showByLine ? false : true;

    const options = {
      textStyle: {
        fontFamily: 'Poppins',
      },
      title: {
        text: `${indicator.charAt(0).toUpperCase() + indicator.slice(1)} - ${meta[indicator]}%`,
        left: 'center',
        show: false,
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const valor = params.data[2];

          // Verifica se o valor é nulo ou indefinido
          if (valor === null || valor === undefined) {
            return `Dia: ${params.data[0]}<br>
                    ${showByLine ? 'Linha' : 'Turno'}: ${params.data[1]}<br>
                    Sem dados`;
          }

          // Formatação com informação do indicador
          return `Dia: ${params.data[0]}<br>
                  ${showByLine ? 'Linha' : 'Turno'}: ${showByLine ? params.data[1] + 1 : params.data[1]}<br>
                  ${indicator.charAt(0).toUpperCase() + indicator.slice(1)}: ${valor}%`;
        },
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
      },
      grid: {
        height: showByLine ? '83%' : '70%',
        x: '5%',
        y: '10%',
      },
      xAxis: {
        type: 'category',
        data: heatmapData.x,
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: heatmapData.y,
        splitArea: { show: false },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        range: [0, 100],
        type: 'piecewise',
        pieces: piecesColor[indicator],
        show: visualShow,
      },
      series: [
        {
          name: indicator,
          type: 'heatmap',
          data: heatmapData.z,
          label: { show: true },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' },
          },
          radius: '100%',
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: { title: 'Salvar' },
        },
      },
    };
    setOptions(options);
  }, [heatmapData, indicator, showByLine]);

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <div className='w-75 mx-auto'>
        <SegmentedButtonTurno
          turnos={TurnosObj}
          onTurnoChange={handleTurnoChange}
          onByLineChange={handleLineTurnChange}
        />
      </div>
      <EChartsReact option={options} opts={{ renderer: 'canvas' }} />
    </>
  );
};

export default Heatmap;
