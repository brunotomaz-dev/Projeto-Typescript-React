// cSpell: words yamazumi

import ReactECharts from 'echarts-for-react';
import React, { useMemo, useState } from 'react';
import { Alert, Row, Spinner } from 'react-bootstrap';
import { colorObj } from '../../../helpers/constants';
import { iInfoIHM } from '../../../interfaces/InfoIHM.interface';

interface iYamazumiProps {
  data: iInfoIHM[];
}

const DashYamazumi: React.FC<iYamazumiProps> = ({ data }) => {
  /* --------------------------------------- Estados Locais --------------------------------------- */
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------------------------------- Funções ------------------------------------------ */
  // Processar os dados para o formato ECharts
  const chartData = useMemo(() => {
    // Se não houver dados, retornar objeto vazio
    if (!data || data.length === 0) {
      return { xAxis: [], series: [] };
    }
    setIsLoading(true); // Iniciar o carregamento

    // Processar os dados conforme as regras
    const processedData = data.map((item) => {
      // Cópia do item para não modificar o original
      const processedItem = { ...item };

      // Aplicar as regras:
      // 1. Se status for 'rodando', motivo deve ser 'Rodando'
      if (processedItem.status === 'rodando') {
        processedItem.motivo = 'Rodando';
      }
      // 2. Se status for 'parada' e causa for 'Refeição', motivo = causa
      else if (processedItem.status === 'parada' && processedItem.causa === 'Refeição') {
        processedItem.motivo = processedItem.causa;
      }
      // 3. Se status for 'parada' e motivo for nulo, motivo = 'Não Apontado'
      else if (processedItem.status === 'parada' && !processedItem.motivo) {
        processedItem.motivo = 'Não apontado';
      }

      return processedItem;
    });

    // Obter todas as linhas distintas (eixo X) e ordenar numericamente de 1 a 14
    const linhas = [...new Set(processedData.map((item) => item.linha))].sort(
      (a, b) => a - b
    );

    // Obter todos os motivos distintos (para as séries)
    const motivos = [
      ...new Set(processedData.filter((item) => item.motivo).map((item) => item.motivo)),
    ].filter(Boolean) as string[];

    // Para cada motivo, criar uma série
    const series = motivos.map((motivo) => {
      // Para cada linha, somar o tempo para o motivo atual
      const data = linhas.map((linha) => {
        const tempoTotal = processedData
          .filter((item) => item.linha === linha && item.motivo === motivo)
          .reduce((sum, item) => sum + (item.tempo || 0), 0);

        return tempoTotal;
      });

      return {
        name: motivo,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        label: {
          show: true,
          formatter: (params: any) => {
            if (params.value > 0) {
              // Mostrar valores em minutos se for maior que zero
              return `${params.value}m`;
            }
            return '';
          },
        },
        itemStyle: { color: colorObj[motivo as keyof typeof colorObj] || '#000' }, // Usar cor padrão se não houver cor definida
        data,
      };
    });

    // Formatar os rótulos do eixo X (Linha 1, Linha 2, etc.)
    const linhasLabels = linhas.map((linha) => `Linha ${linha}`);

    setIsLoading(false); // Finalizar o carregamento
    return {
      xAxis: linhasLabels,
      series,
    };
  }, [data]);

  /* ------------------------------------------- Option ------------------------------------------- */
  // Opções do gráfico
  const options = {
    title: {
      text: 'Gráfico Yamazumi',
      left: 'center',
      top: '0%',
      textStyle: { fontSize: '20px' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params: any) {
        let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;

        // Somar o tempo total
        let tempoTotal = params.reduce(
          (total: number, item: any) => total + item.value,
          0
        );

        // Adicionar cada motivo
        params.forEach((item: any) => {
          if (item.value > 0) {
            const porcentagem = ((item.value / tempoTotal) * 100).toFixed(1);
            tooltip += `${item.marker} ${item.seriesName}: ${item.value} min (${porcentagem}%)<br/>`;
          }
        });

        // Adicionar tempo total
        tooltip += `<strong>Total: ${tempoTotal} minutos</strong>`;

        return tooltip;
      },
    },
    legend: {
      data: chartData.series.map((s) => s.name),
      textStyle: { fontSize: 11 },
      type: 'scroll',
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '7%',
      top: '7%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.xAxis,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Tempo (min)',
      nameTextStyle: { fontSize: 12 },
      axisLabel: { fontSize: 11 },
    },
    series: chartData.series,
    toolbox: {
      feature: {
        saveAsImage: { title: 'Salvar' },
        // dataView: { title: 'Ver Dados', lang: ['Dados', 'Fechar', 'Atualizar'] },
      },
    },
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {!isLoading ? (
        data && data.length > 0 ? (
          <ReactECharts
            option={options}
            style={{ height: '400px', width: '100%' }}
            className='react-echarts'
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
        <Row
          className='d-flex justify-content-center align-items-center p-3'
          style={{ height: '400px' }}
        >
          <Spinner animation='border' style={{ width: '3rem', height: '3rem' }} />
        </Row>
      )}
    </>
  );
};

export default DashYamazumi;
