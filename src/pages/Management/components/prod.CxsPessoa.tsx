import { format } from 'date-fns';
import EChartsReact from 'echarts-for-react';
import React, { useEffect, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { getPresenceData, getProduction } from '../../../api/apiRequests';
import { ColorsSTM } from '../../../helpers/constants';
import { iPresence } from '../../../interfaces/Absence.interface';

interface iPresenceTotal {
  data_registro: string;
  turno: string;
  quantidade: number;
}

interface iProductionTotal {
  data_registro: string;
  turno: string;
  total_produzido: number;
}

interface iHeatmap {
  x: string[]; // dias
  y: string[]; // turnos
  z: (number | string)[]; // valores de caixas por pessoa
}

const CxsPessoaHeatmap: React.FC = () => {
  /* ------------------------------------------- Datas ------------------------------------------ */
  // Data de hoje
  const today = new Date();
  // Primeiro dia do mês
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  // Último dia do mês
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // Formatar para YYYY-MM-DD
  const firstDayFormatted = format(firstDay, 'yyyy-MM-dd');
  const lastDayFormatted = format(lastDay, 'yyyy-MM-dd');

  /* ---------------------------------------- Local State --------------------------------------- */
  const [presenceTotal, setPresenceTotal] = React.useState<iPresenceTotal[]>([]);
  const [productionTotal, setProductionTotal] = React.useState<iProductionTotal[]>([]);

  /* ------------------------------------------ Funções ----------------------------------------- */
  const orderPresence = (presence: iPresence[]): iPresence[] => {
    if (!presence || presence.length === 0) return [];

    return presence.sort((a, b) => {
      // Primeiro, comparar por data
      const dateA = new Date(a.data_registro).getTime();
      const dateB = new Date(b.data_registro).getTime();

      if (dateA !== dateB) {
        return dateA - dateB; // Ordem crescente de data
      }

      // Se as datas forem iguais, ordenar por turno na sequência NOT, MAT, VES
      const turnoOrder: Record<string, number> = {
        NOT: 1,
        MAT: 2,
        VES: 3,
      };

      const turnoValueA = turnoOrder[a.turno] || 999; // Valor alto para turnos desconhecidos
      const turnoValueB = turnoOrder[b.turno] || 999;

      return turnoValueA - turnoValueB;
    });
  };

  const presenceSum = (presence: iPresence[]): iPresenceTotal[] => {
    if (!presence || presence.length === 0) return [];

    // Mapeamento dos registros somando todos os setores
    return presence.map((item) => {
      // Extrai apenas o dia da data_registro (ex: '25' de '2025-04-25')
      const dataParts = item.data_registro.split('-');
      const dia = dataParts.length === 3 ? dataParts[2] : item.data_registro;

      // Soma todos os valores numéricos dos setores
      const quantidade =
        (Number(item.embalagem) || 0) +
        (Number(item.forno) || 0) +
        (Number(item.lideranca) || 0) +
        (Number(item.panificacao) || 0) +
        (Number(item.pasta) || 0) +
        (Number(item.recheio) || 0);

      return {
        data_registro: dia,
        turno: item.turno,
        quantidade,
      };
    });
  };

  const productionSum = (production: any[]): iProductionTotal[] => {
    if (!production || production.length === 0) return [];

    // Agrupar por data_registro e turno
    const grouped = production.reduce((acc: Record<string, iProductionTotal>, item) => {
      // Extrai apenas o dia da data_registro
      const dataParts = item.data_registro.split('-');
      const dia = dataParts.length === 3 ? dataParts[2] : item.data_registro;

      // Cria uma chave única para cada combinação de data e turno
      const key = `${dia}-${item.turno}`;

      if (!acc[key]) {
        acc[key] = {
          data_registro: dia,
          turno: item.turno,
          total_produzido: 0,
        };
      }

      // Soma o total_produzido para a chave correspondente
      acc[key].total_produzido += Number(item.total_produzido) || 0;

      return acc;
    }, {});

    // Converte o objeto agrupado de volta para um array
    let result = Object.values(grouped);

    // Ordenar por data e depois por turno (NOT, MAT, VES)
    result = result.sort((a, b) => {
      // Primeiro por data
      if (a.data_registro !== b.data_registro) {
        return parseInt(a.data_registro) - parseInt(b.data_registro);
      }

      // Se as datas forem iguais, ordenar por turno
      const turnoOrder: Record<string, number> = {
        NOT: 1,
        MAT: 2,
        VES: 3,
      };

      const turnoValueA = turnoOrder[a.turno] || 999;
      const turnoValueB = turnoOrder[b.turno] || 999;

      return turnoValueA - turnoValueB;
    });

    return result;
  };

  /* ----------------------------------------- Memo HOOK ---------------------------------------- */
  // Usando useMemo para calcular caixas por pessoa apenas quando presenceTotal ou productionTotal mudar
  const caixasPorPessoa = useMemo((): iHeatmap => {
    if (presenceTotal.length === 0 && productionTotal.length === 0) {
      return { x: [], y: [], z: [] };
    }

    // Determinar o primeiro e último dia do mês
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Criar um array com todos os dias do mês (01 a 31)
    const todosOsDias = Array.from({ length: lastDayOfMonth }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );

    // Turnos na ordem desejada
    const turnos = ['NOT', 'MAT', 'VES'];

    // Mapear os dados de produção para facilitar a busca
    const productionMap: Record<string, number> = {};
    productionTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      productionMap[key] = item.total_produzido;
    });

    // Mapear os dados de presença para facilitar a busca
    const presenceMap: Record<string, number> = {};
    presenceTotal.forEach((item) => {
      const key = `${item.data_registro}-${item.turno}`;
      presenceMap[key] = item.quantidade;
    });

    // Array para armazenar valores de z
    const valoresZ: Array<number | '-'> = [];

    // Para cada combinação de data e turno
    for (const dia of todosOsDias) {
      for (const turno of turnos) {
        // Buscar a presença e produção correspondentes
        const key = `${dia}-${turno}`;
        const quantidade = presenceMap[key] || 0;
        const producao = productionMap[key] || 0;

        // Se não houver dados de presença ou produção, usar '-'
        if (quantidade === 0 || producao === 0) {
          valoresZ.push('-');
          continue;
        }

        // Calcular caixas por pessoa
        const caixas = producao / 10;
        const valor = Math.round(Number(caixas / quantidade));
        valoresZ.push(valor);
      }
    }

    // Retornar os arrays x, y, z
    return {
      x: todosOsDias,
      y: turnos,
      z: valoresZ,
    };
  }, [presenceTotal, productionTotal, today]);

  /* ------------------------------------------ Effect ------------------------------------------ */
  useEffect(() => {
    void getPresenceData([firstDayFormatted, lastDayFormatted]).then(
      (response: iPresence[]) => {
        // Ordenar par data_registro
        const responseOrdered = orderPresence(response);

        // Somar os setores e retornar para o estado local
        setPresenceTotal(presenceSum(responseOrdered));
      }
    );

    void getProduction([firstDayFormatted, lastDayFormatted]).then((response) => {
      const productionTotals = productionSum(response);

      // Somar os totais de produção e retornar para o estado local
      setProductionTotal(productionTotals);
    });
  }, []);

  /* ------------------------------------------ Option ------------------------------------------ */
  const option = {
    textStyle: {
      fontFamily: 'Poppins',
    },
    title: {
      text: 'Produção de Caixas por Pessoa',
      left: 'center',
      top: '0%',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `Dia: ${params.data[0]}<br>Turno: ${params.data[1]}<br>Caixas por pessoa: ${params.data[2]}`;
      },
    },
    grid: {
      height: '60%',
      top: '15%',
      left: '5%',
      right: '5%',
    },
    xAxis: {
      type: 'category',
      data: caixasPorPessoa.x,
      splitArea: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: caixasPorPessoa.y,
      splitArea: {
        show: false,
      },
    },
    visualMap: {
      min: 0,
      max: 60,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      text: ['Alta Produtividade', 'Baixa Produtividade'],
      // Escala de cores de vermelho para verde
      inRange: {
        color: [
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.RED,
          ColorsSTM.YELLOW,
          ColorsSTM.YELLOW,
          ColorsSTM.GREEN,
        ],
      },
    },
    series: [
      {
        name: 'Caixas por Pessoa',
        type: 'heatmap',
        data: caixasPorPessoa.x.flatMap((dia, i) =>
          caixasPorPessoa.y.map((turno, j) => {
            const index = i * caixasPorPessoa.y.length + j;
            return [dia, turno, caixasPorPessoa.z[index]];
          })
        ),
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: { title: 'Salvar' },
      },
    },
  };

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <Card className='shadow border-0 mb-3 bg-transparent align-items-center py-2'>
      <EChartsReact option={option} style={{ height: '350px', width: '98%' }} />
    </Card>
  );
};

export default CxsPessoaHeatmap;
