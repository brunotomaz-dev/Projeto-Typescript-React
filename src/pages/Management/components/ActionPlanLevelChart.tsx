import { differenceInDays, isPast, parseISO, startOfDay } from 'date-fns';
import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { ActionPlanStatus, BSColors } from '../../../helpers/constants';
import { iActionPlan } from '../../../interfaces/ActionPlan.interface';

interface ActionPlanLevelChartProps {
  actionPlanData: iActionPlan[];
}

const ActionPlanLevelChart: React.FC<ActionPlanLevelChartProps> = ({ actionPlanData }) => {
  // Estado para controlar o tipo de gráfico - começando com pizza
  const [chartType, setChartType] = React.useState<'pie' | 'bar'>('bar');

  // Definição dos níveis hierárquicos
  const levelLabels = {
    1: 'Liderança',
    2: 'Supervisão',
    3: 'Coordenação',
    4: 'Gerência',
    5: 'Diretoria',
  };

  // Cores para cada nível
  const levelColors = {
    1: BSColors.SUCCESS_COLOR, // Verde
    2: BSColors.INFO_COLOR, // Azul
    3: BSColors.WARNING_COLOR, // Amarelo
    4: BSColors.ORANGE_COLOR, // Laranja
    5: BSColors.DANGER_COLOR, // Vermelho
  };

  // Calcular o nível atual com base nos dias em aberto e status
  const calcularNivelAtual = (plano: iActionPlan): number => {
    // Verificar se o plano está em PDCA
    if (plano.conclusao === ActionPlanStatus.PDCA) {
      // Se tem data de conclusão e ela ainda não passou, manter no nível 3 ou no nível inicial (o que for maior)
      if (plano.data_conclusao) {
        const dataConclusao = parseISO(plano.data_conclusao);
        
        // Se a data de conclusão ainda não passou, manter no nível 3 ou no nível inicial (o que for maior)
        if (!isPast(dataConclusao)) {
          return Math.max(3, plano.lvl); // Mínimo nível 3 (coordenação) ou o nível inicial se for maior
        }
        
        // Se a data de conclusão já passou, calcular nível baseado em dias desde a data_registro
        // e considerar pelo menos nível 3 (coordenação)
        const dataInicial = parseISO(plano.data_registro);
        const hoje = startOfDay(new Date());
        const diasAbertos = differenceInDays(hoje, dataInicial);
        const niveisAdicionais = Math.floor(diasAbertos / 3);
        
        // Calcular o nível atual (limitado a 5), considerando o mínimo como nível 3
        return Math.min(5, Math.max(3, plano.lvl + niveisAdicionais));
      } 
      
      // Se não tem data de conclusão, considerar como nível 3 ou superior
      return Math.max(3, plano.lvl);
    }
    
    // Para planos em aberto normal (não PDCA), manter o cálculo original
    const dataInicial = parseISO(plano.data_registro);
    const hoje = startOfDay(new Date());
    const diasAbertos = differenceInDays(hoje, dataInicial);
    
    // A cada 3 dias, o nível sobe em 1
    const niveisAdicionais = Math.floor(diasAbertos / 3);
    
    // Calcular o nível atual (limitado a 5)
    return Math.min(5, plano.lvl + niveisAdicionais);
  };

  // Processar os dados para o gráfico
  const levelData = useMemo(() => {
    // Filtrar apenas os planos em aberto ou PDCA
    const planosAbertos = actionPlanData.filter(
      (plan) => plan.conclusao === ActionPlanStatus.Aberto || plan.conclusao === ActionPlanStatus.PDCA
    );

    // Inicializar contagem por nível
    const contagemPorNivel: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Calcular o nível atual de cada plano
    planosAbertos.forEach((plan) => {
      const nivelAtual = calcularNivelAtual(plan);
      contagemPorNivel[nivelAtual] = (contagemPorNivel[nivelAtual] || 0) + 1;
    });

    return contagemPorNivel;
  }, [actionPlanData]);

  // Dados para o gráfico de pizza
  const pieOption = {
    title: {
      text: 'Planos de Ação por Nível',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const nivel = Number(params.name.split(' ')[0]);
        return `${params.name}: ${params.value} (${params.percent}%)<br/>Planos que requerem ação de ${levelLabels[nivel as keyof typeof levelLabels]}`;
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.entries(levelLabels).map(([nivel, label]) => `${nivel} - ${label}`),
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [
      {
        name: 'Nível',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
          fontFamily: 'Poppins',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: true,
        },
        data: Object.entries(levelData).map(([nivel, quantidade]) => ({
          value: quantidade,
          name: `${nivel} - ${levelLabels[Number(nivel) as keyof typeof levelLabels]}`,
          itemStyle: { color: levelColors[Number(nivel) as keyof typeof levelColors] },
        })),
      },
    ],
  };

  // Dados para o gráfico de barras
  const barOption = {
    title: {
      text: 'Planos de Ação por Nível',
      left: 'center',
      textStyle: {
        fontFamily: 'Poppins',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const nivel = Number(params[0].name.split(' ')[0]);
        return `${params[0].name}: ${params[0].value} planos<br/>Requerem ação de ${levelLabels[nivel as keyof typeof levelLabels]}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: Object.entries(levelLabels).map(([nivel, label]) => `${nivel} - ${label}`),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        fontFamily: 'Poppins',
        interval: 0,
        rotate: 30,
        margin: 15,
      },
      show: true,
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        fontFamily: 'Poppins',
      },
      show: true,
    },
    series: [
      {
        name: 'Quantidade',
        type: 'bar',
        barWidth: '60%',
        data: Object.entries(levelData).map(([nivel, quantidade]) => ({
          value: quantidade,
          itemStyle: { color: levelColors[Number(nivel) as keyof typeof levelColors] },
        })),
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Poppins',
        },
      },
    ],
  };

  // Calcular o total de planos abertos
  const totalPlanosAbertos = Object.values(levelData).reduce((sum, val) => sum + val, 0);

  // Contar quantos planos estão em PDCA
  const totalPlanosPDCA = actionPlanData.filter(plan => plan.conclusao === ActionPlanStatus.PDCA).length;

  return (
    <Card className='shadow border-0 p-3 h-100'>
      <Card.Body>
        <Row className='mb-3'>
          <Col>
            <Form.Group>
              <Form.Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'pie' | 'bar')}
                size='sm'
                className='w-auto'
              >
                <option value='pie'>Gráfico de Pizza</option>
                <option value='bar'>Gráfico de Barras</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <ReactECharts
          option={chartType === 'pie' ? pieOption : barOption}
          style={{ height: '350px' }}
          notMerge={true}
        />

        <Row className='mt-3'>
          <Col>
            <div className='d-flex justify-content-between'>
              <div>
                <strong>Total de Planos Abertos:</strong> {totalPlanosAbertos}    
              </div>
              <div className='d-flex gap-3'>
                {Object.entries(levelData).map(([nivel, quantidade]) => (
                  <div key={nivel}>
                    <span
                      className={`badge me-1 ${Number(nivel) === 3 ? 'text-dark' : ''}`}
                      style={{ backgroundColor: levelColors[Number(nivel) as keyof typeof levelColors] }}
                    >
                      {quantidade}
                    </span>
                    {`Nível ${nivel}`}
                  </div>
                ))}
              </div>
            </div>
            {totalPlanosPDCA > 0 && 
                  <span className="ms-2">
                    (<span className="text-info">{totalPlanosPDCA} em PDCA</span>)
                  </span>
                }
          </Col>
        </Row>

        {/* Adicionando a nota informativa */}
        <Row className='mt-3'>
          <Col>
            <div className='alert alert-info mt-2 small'>
              <strong>Níveis de escalação:</strong> Este gráfico mostra planos abertos e em PDCA, classificados
              pelo nível atual.
              <br />
              Planos regulares sobem de nível a cada 3 dias em aberto, partindo do nível inicial.
              <br />
              <span className="text-info"><strong>Planos em PDCA</strong></span> são mantidos no mínimo no nível 3 (Coordenação) até sua data de conclusão.
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ActionPlanLevelChart;
