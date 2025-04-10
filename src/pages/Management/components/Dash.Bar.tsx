import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Row, Spinner } from 'react-bootstrap';
import { getMaquinaInfo } from '../../../api/apiRequests';
import {
  CICLOS_ESPERADOS,
  CICLOS_ESPERADOS_BOL,
  TurnoID,
  colorObj,
} from '../../../helpers/constants';
import { impactFilter, notImpactFilter } from '../../../helpers/ImpactFilter';
import { iInfoIHM } from '../../../interfaces/InfoIHM.interface';
import { useAppSelector } from '../../../redux/store/hooks';

/* ----------------------------------------- Interfaces ----------------------------------------- */
interface iDashBarProps {
  data: iInfoIHM[];
  selectedLines: number[];
  selectedDate: string | string[];
  selectedShift: TurnoID;
  dataType: 'ALL' | 'Primeiro' | 'Segundo' | 'Terceiro';
  notAffBar: boolean;
}

interface iStopSummary {
  motivo: string;
  problema: string;
  causa: string;
  tempo: number;
  impacto: number;
  linha?: number; // Adicionado para casos de Perda de Ciclo
}

interface iMaquinaInfo {
  maquina_id: string;
  ciclo_1_min: number;
  produto: string;
  status: string;
  linha?: number;
}

/* ---------------------------------------------------------------------------------------------- */

/*                                        FUNÇÃO PRINCIPAL                                        */

/* ---------------------------------------------------------------------------------------------- */
const DashBar: React.FC<iDashBarProps> = ({
  data,
  selectedLines,
  selectedDate,
  selectedShift,
  dataType = 'ALL',
  notAffBar,
}) => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  const lineMachine = useAppSelector((state) => state.home.lineMachine);

  /* ---------------------------------------- Estado Local ---------------------------------------- */
  const [maqInfoData, setMaqInfoData] = useState<iMaquinaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------------------------------- Funções ------------------------------------------ */

  /* ---------------------------------------------------------------------- Filtro De Info-ihm ---- */
  const filteredData = useMemo(() => {
    setIsLoading(true); // Iniciar o carregamento

    const filterData = notAffBar ? notImpactFilter(data) : impactFilter(data);

    setIsLoading(false); // Finalizar o carregamento

    return filterData;
  }, [data, notAffBar]);

  /* ------------------------------------------------------------------ Tempo Total De Parada ---- */
  // Tempo total de parada
  const totalStopTime = useMemo(() => {
    const data = filteredData
      .filter((item) => item.status === 'parada')
      .reduce((acc, item) => acc + (item.tempo || 0), 0);
    return data;
  }, [filteredData]);

  /* ---------------------------------------------- Fetch Dados Da Máquina - Para Obter Ciclos ---- */
  // Fetch dados da máquina - para obter ciclos
  const fetchMaqInfo = async () => {
    let params: {
      data: string | string[];
      turno?: string;
      maquina_id?: string[] | string;
      status?: string;
    } = { data: selectedDate, status: 'true' };

    if (selectedLines.length === 0 || selectedLines.length === 14) {
      // Se nenhuma linha estiver selecionada ou todas estiverem, filtre apenas por turno
      if (selectedShift !== 'ALL') {
        params.turno = selectedShift;
      }
    } else {
      // Pegar as maquina_ids correspondentes às linhas selecionadas
      const selectedMachines = Object.entries(lineMachine)
        .filter(([_maquina_id, linha]) => selectedLines.includes(Number(linha)))
        .map(([maquina_id]) => maquina_id);

      params.maquina_id = selectedMachines;

      if (selectedShift !== 'ALL') {
        params.turno = selectedShift;
      }
    }
    // Chama a API para buscar as informações da máquina
    const data = await getMaquinaInfo(params, [
      'ciclo_1_min',
      'produto',
      'status',
      'maquina_id',
    ]);

    // Inclui o número da linha nos dados da máquina
    const maqInfoWithLine = data.map((item: iMaquinaInfo) => {
      const linha = Number(lineMachine[item.maquina_id]);
      return { ...item, linha };
    });

    // Atualiza o estado com os dados da máquina
    setMaqInfoData(maqInfoWithLine);
  };

  /* -------------------------------------------------------------------------- Perda De Ciclo ---- */
  // Calcula perdas de ciclo por linha
  const cycleLostByLine = useMemo(() => {
    if (!maqInfoData || maqInfoData.length === 0) return [];

    // Tempo rodando por linha
    const runTimeByLine = data
      .filter((item) => item.status === 'rodando')
      .reduce(
        (acc, item) => {
          if (!acc[item.linha]) {
            acc[item.linha] = 0;
          }
          acc[item.linha] += item.tempo;
          return acc;
        },
        {} as Record<number, number>
      );

    // Ajusta os ciclos perdidos por linha
    const cycleLossByLine: iStopSummary[] = [];

    // Obter linhas únicas das máquinas
    const uniqueLines = [...new Set(maqInfoData.map((item) => item.linha))];

    uniqueLines.forEach((linha) => {
      if (!linha) return; // Skip undefined linhas

      // Filtrar máquinas para esta linha
      const lineMachines = maqInfoData.filter((m) => m.linha === linha);

      if (lineMachines.length === 0) return;

      // Primeiro, calcular a média de ciclos por minuto da linha
      const averageCyclesByMin =
        lineMachines.reduce((acc, item) => acc + item.ciclo_1_min, 0) /
        lineMachines.length;

      // Determinar o ciclo ideal baseado no tipo de produto mais comum na linha
      const bolProducts = lineMachines.filter((item) =>
        item.produto.includes(' BOL')
      ).length;
      const regularProducts = lineMachines.length - bolProducts;

      // Usar o ciclo ideal baseado na maioria dos produtos na linha
      const idealCycle =
        bolProducts > regularProducts ? CICLOS_ESPERADOS_BOL : CICLOS_ESPERADOS;

      // Calcular a perda de ciclo com base na média da linha vs. ciclo ideal
      const cycleLossPercent =
        idealCycle > averageCyclesByMin
          ? ((idealCycle - averageCyclesByMin) * 100) / idealCycle
          : 0;

      // Calcular tempo perdido para esta linha
      const runTime = runTimeByLine[linha] || 0;
      const lostTime = Math.round((cycleLossPercent * runTime) / 100);

      if (lostTime > 0) {
        cycleLossByLine.push({
          motivo: 'Perda de Ciclo',
          problema: `Ciclo ${cycleLossPercent.toFixed(2)}% abaixo do esperado`,
          causa: 'Ciclo Perdido',
          tempo: lostTime,
          impacto: 0, // Será calculado depois
          linha: linha,
        });
      }
    });

    // Calcular o tempo total perdido para todas as linhas
    const totalLostTime = cycleLossByLine.reduce((acc, item) => acc + item.tempo, 0);

    // Adicionar cálculo de impacto (porcentagem do tempo total)
    return cycleLossByLine
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / totalLostTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);
  }, [maqInfoData, data]);

  // Cria a perda por ciclo total (como já existe, mas usando o cycleLostByLine)
  const cycleLost = useMemo(() => {
    const totalLostTime = cycleLostByLine.reduce((acc, item) => acc + item.tempo, 0);
    const averageLoss =
      maqInfoData.length > 0
        ? cycleLostByLine.reduce(
            (acc, item) => acc + (item.tempo * 100) / totalLostTime,
            0
          ) / cycleLostByLine.length
        : 0;

    return {
      ['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min']: {
        problema: `Perda média de ciclo --> ${averageLoss.toFixed(2)} %`,
        impacto: 0,
        motivo: 'Perda de Ciclo',
        causa: 'Ciclo Baixo',
        tempo: totalLostTime,
      },
    };
  }, [cycleLostByLine, maqInfoData]);

  /* ----------------------------------------------------------------------- Resumo De Paradas ---- */
  const stopSummary = useMemo(() => {
    setIsLoading(true); // Iniciar o carregamento
    // Filtra e agrupa os dados por causa
    const stops = filteredData
      .filter((item) => item.status === 'parada')
      .reduce(
        (acc, item) => {
          const key = `${item.motivo}`;

          if (!acc[key]) {
            acc[key] = {
              motivo: item.motivo || 'Não apontado',
              problema: item.problema || 'Não apontado',
              causa: item.causa || 'Não apontado',
              tempo: 0,
              impacto: 0,
            };
          }

          acc[key].tempo += item.tempo;
          return acc;
        },
        {} as Record<string, iStopSummary>
      );

    const lostCycleTime = notAffBar
      ? 0
      : cycleLost['Perda de Ciclo-Ciclo Baixo-Ciclo Perdido Min'].tempo;

    // Une os dados de parada com os dados de ciclo baixo se houver dados de ciclos baixos
    const allStops = lostCycleTime > 0 ? { ...stops, ...cycleLost } : stops;

    // Calcula o tempo total de parada
    const stopTime = totalStopTime + lostCycleTime;

    const summary = Object.values(allStops)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / stopTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);

    setIsLoading(false); // Finalizar o carregamento
    return summary;
  }, [filteredData, cycleLost, totalStopTime, notAffBar]);

  /* ----------------------------------------------------------------------------- Top Motivos ---- */
  // Novo: Obter o primeiro, segundo e terceiro motivos
  const topMotivos = useMemo(() => {
    if (!stopSummary || stopSummary.length === 0) return [];

    // Filtrar motivos indesejados antes de pegar os três principais
    const filteredMotivos = stopSummary
      .filter((item) => item.motivo !== 'Liberada' && item.motivo !== 'Não apontado')
      .map((item) => item.motivo);

    // Pegar os três primeiros motivos distintos
    const uniqueMotivos = [...new Set(filteredMotivos)];
    return uniqueMotivos.slice(0, 3);
  }, [stopSummary]);

  // Novo: Obter dados específicos para um determinado motivo (primeiro, segundo, terceiro)
  const getMotivoDetails = useMemo(() => {
    setIsLoading(true);

    // Se não for um dos três primeiros motivos, retornar vazio
    if (dataType === 'ALL') {
      setIsLoading(false);
      return stopSummary;
    }

    // Determinar qual motivo estamos analisando
    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      setIsLoading(false);
      return [];
    }

    const targetMotivo = topMotivos[motiveIndex];

    // Caso especial: Se o motivo for "Perda de Ciclo", agrupar por linha
    if (targetMotivo === 'Perda de Ciclo') {
      setIsLoading(false);
      return cycleLostByLine;
    }

    // Caso padrão: Filtrar paradas pelo motivo e agrupar por causa
    const motivoDetails = filteredData
      .filter((item) => item.motivo === targetMotivo)
      .reduce(
        (acc, item) => {
          // Chave de agrupamento: causa
          const key = `${item.causa || 'Não apontado'}`;

          if (!acc[key]) {
            acc[key] = {
              motivo: item.motivo || 'Não apontado',
              problema: item.problema || 'Não apontado',
              causa: item.causa || 'Não apontado',
              tempo: 0,
              impacto: 0,
            };
          }

          acc[key].tempo += item.tempo;
          return acc;
        },
        {} as Record<string, iStopSummary>
      );

    // Calcular o tempo total para este motivo
    const totalTime = Object.values(motivoDetails).reduce(
      (acc, item) => acc + item.tempo,
      0
    );

    // Converter para array e adicionar impacto
    const result = Object.values(motivoDetails)
      .map((item) => ({
        ...item,
        impacto: parseFloat(((item.tempo / totalTime) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.tempo - a.tempo);

    setIsLoading(false);
    return result.slice(0, 5);
  }, [dataType, topMotivos, stopSummary, filteredData, cycleLostByLine]);

  // Atualizar o cálculo do tempo total para o subtext
  const subTextTime = useMemo(() => {
    if (dataType === 'ALL') {
      return totalStopTime;
    }

    // Tempo total do motivo específico
    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      return 0;
    }

    const targetMotivo = topMotivos[motiveIndex];

    if (targetMotivo === 'Perda de Ciclo') {
      return cycleLostByLine.reduce((acc, item) => acc + item.tempo, 0);
    }

    return filteredData
      .filter((item) => item.motivo === targetMotivo)
      .reduce((acc, item) => acc + item.tempo, 0);
  }, [dataType, topMotivos, filteredData, totalStopTime, cycleLostByLine]);

  /* ------------------------------------------- Effects ------------------------------------------ */
  useEffect(() => {
    setIsLoading(true); // Iniciar o carregamento
    // Chama a função para buscar as informações da máquina
    fetchMaqInfo();
    setIsLoading(false); // Finalizar o carregamento
  }, [selectedLines, selectedDate, selectedShift]);

  /* ------------------------------------------- Series ------------------------------------------- */
  const series = useMemo(() => {
    setIsLoading(true);

    const displayData = dataType === 'ALL' ? stopSummary : getMotivoDetails;

    if (!displayData || displayData.length === 0) {
      setIsLoading(false);
      return [];
    }

    const serie = [
      {
        type: 'bar',
        data: displayData.map((item: iStopSummary) => {
          const isPerdaCiclo = item.motivo === 'Perda de Ciclo';

          // Para casos de Perda de Ciclo quando agrupando por linha
          const name =
            isPerdaCiclo && item.linha
              ? `Linha ${item.linha}`
              : dataType === 'ALL'
                ? item.motivo
                : item.causa;

          return {
            value: item.tempo,
            name,
            motivo: item.motivo,
            problema: item.problema,
            causa: item.causa,
            impacto: item.impacto,
            linha: item.linha,
          };
        }),
        itemStyle: {
          color: function (params: any) {
            const motivo = displayData[params.dataIndex].motivo;
            return colorObj[motivo as keyof typeof colorObj] || '#999';
          },
        },
        label: {
          show: true,
          // position: dataType === 'ALL' ? 'right' : 'insideLeft',
          position: 'right',
          formatter: function (params: any) {
            return `${params.data.impacto}%`;
          },
          // formatter: function (params: any) {
          //   // Para ALL, mostrar apenas a porcentagem
          //   if (dataType === 'ALL') {
          //     return `${params.data.impacto}%`;
          //   }

          //   // Para não-ALL, mostrar nome e porcentagem
          //   return `${params.name} - ${params.data.impacto}%`;
          // },
          overflow: 'break',
          width: 300,
          textShadow: dataType === 'ALL' ? 'none' : '1px 1px 2px rgba(0,0,0,0.5)',
        },
      },
    ];

    setIsLoading(false);
    return serie;
  }, [stopSummary, dataType, getMotivoDetails]);

  // Título dinâmico com base no dataType
  const chartTitle = useMemo(() => {
    if (dataType === 'ALL') {
      return 'Principais Motivos de Parada';
    }

    const motiveIndex = dataType === 'Primeiro' ? 0 : dataType === 'Segundo' ? 1 : 2;

    if (topMotivos.length <= motiveIndex) {
      return `${dataType} Motivo de Parada`;
    }

    const targetMotivo = topMotivos[motiveIndex];

    // Título especial para Perda de Ciclo
    if (targetMotivo === 'Perda de Ciclo') {
      return `Linhas com Maior Perda de Ciclo`;
    }

    return `Principais Causas: ${targetMotivo}`;
  }, [dataType, topMotivos]);

  /* ---------------------------------------------------------------------------------- Option ---- */
  // Configurações do gráfico
  const option = {
    title: {
      text: chartTitle,
      subtext: `Total de Paradas: ${subTextTime} min`,
      left: 'center',
      textStyle: {
        fontSize: 16,
      },
    },
    textStyle: {
      fontFamily: 'Poppins',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const { data } = params;

        // Tooltip base começa com o valor selecionado como cabeçalho
        let tooltipContent = '';

        // Montagem dinâmica do tooltip com base no dataType e tipo de dado
        if (data.linha && data.motivo === 'Perda de Ciclo') {
          tooltipContent = `
            ${params.marker}
            <strong>Linha ${data.linha}</strong><br/>
            Motivo: ${data.motivo}<br/>
            Problema: ${data.problema}<br/>
            Tempo: ${data.value} min<br/>
            Impacto: ${data.impacto}%
          `;
        } else if (dataType === 'ALL') {
          if (data.motivo === 'Perda de Ciclo') {
            tooltipContent = `
              ${params.marker}
              <strong>${data.motivo}</strong><br/>
              Problema: ${data.problema}<br/>
              Tempo: ${data.value} min<br/>
              Impacto: ${data.impacto}%
            `;
          } else {
            tooltipContent = `
              ${params.marker}
              <strong>${data.motivo}</strong><br/>
              Tempo: ${data.value} min<br/>
              Impacto: ${data.impacto}%
            `;
          }
        } else {
          tooltipContent = `
            ${params.marker}
            <strong>${data.motivo}</strong><br/>
            Problema: ${data.problema}<br/>
            Causa: ${data.causa}<br/>
            Tempo: ${data.value} min<br/>
            Impacto: ${data.impacto}%
          `;
        }

        return tooltipContent;
      },
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Tempo (min)',
      nameLocation: 'center',
      nameGap: 30,
      splitLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: (dataType === 'ALL' ? stopSummary : getMotivoDetails).map(
        (item: iStopSummary) => {
          // Para casos de Perda de Ciclo quando agrupando por linha
          if (item.motivo === 'Perda de Ciclo' && item.linha) {
            return `Linha ${item.linha}`;
          }

          return dataType === 'ALL'
            ? item.motivo
            : item.causa === 'Realizar análise de falha' ||
                item.causa === 'Necessidade de análise'
              ? item.problema
              : item.causa;
        }
      ),
      axisLabel: {
        // show: dataType === 'ALL', // Mostrar apenas no modo ALL
        show: true,
        width: 100,
        overflow: 'break',
        fontSize: 11,
      },
    },
    series: series,
    toolbox: {
      feature: {
        saveAsImage: { title: 'Salvar' },
      },
    },
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {!isLoading ? (
        (dataType === 'ALL' ? stopSummary : getMotivoDetails).length > 0 ? (
          <EChartsReact
            option={option}
            style={{ height: '400px', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
          />
        ) : (
          <Row
            style={{ height: '400px' }}
            className='d-flex justify-content-center align-items-center p-2'
          >
            <Alert variant='info' className='text-center'>
              Sem dados disponíveis para exibição. Por favor, selecione outra data ou
              período.
            </Alert>
          </Row>
        )
      ) : (
        <Row className='d-flex justify-content-center align-items-center p-3'>
          <Spinner animation='border' style={{ width: '3rem', height: '3rem' }} />
        </Row>
      )}
    </>
  );
};

export default DashBar;
