import { format } from 'date-fns';
import React from 'react';
import { Card } from 'react-bootstrap';
import { BSColors, colorObj, DESC_EFF } from '../../../helpers/constants';
import { useFullInfoIHMQuery } from '../../../hooks/queries/useFullInfoIhmQuery';
import { useFilters } from '../../../hooks/useFilters';

interface TimelineItem {
  recno: number;
  fabrica: number;
  linha: number;
  maquina_id: string;
  turno: string;
  status: string;
  data_registro: string;
  hora_registro: string;
  motivo: string | null;
  equipamento: string | null;
  problema: string | null;
  causa: string | null;
  os_numero: string | null;
  operador_id: string | null;
  data_registro_ihm: string;
  hora_registro_ihm: string;
  s_backup: string | null;
  data_hora: string;
  data_hora_final: string;
  tempo: number;
  afeta_eff: number;
}

const TimelineOperation: React.FC = () => {
  const { data, isLoading, isRefreshing } = useFullInfoIHMQuery('operators');
  const { selectedLines } = useFilters('operators');

  // Filtrar pela linha selecionada e ordenar por data/hora
  const filteredData = data
    ?.filter((item) => selectedLines.includes(item.linha) && item.status === 'parada')
    ?.sort((a, b) => {
      const dateTimeA = new Date(`${a.data_registro}T${a.hora_registro}`);
      const dateTimeB = new Date(`${b.data_registro}T${b.hora_registro}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    }) as TimelineItem[];

  // Função para calcular desconto de refeição no turno
  const calcularDescontoRefeicao = (item: TimelineItem, allData: TimelineItem[]) => {
    // Filtrar apenas refeições do mesmo turno e linha, ordenadas por data_hora
    const refeicoesDoTurno = allData
      .filter(
        (dataItem) =>
          dataItem.linha === item.linha &&
          dataItem.turno === item.turno &&
          (dataItem.causa?.toLowerCase().includes('refeição') ||
            dataItem.problema?.toLowerCase().includes('refeição'))
      )
      .sort((a, b) => {
        const dateTimeA = new Date(a.data_hora);
        const dateTimeB = new Date(b.data_hora);
        return dateTimeA.getTime() - dateTimeB.getTime();
      });

    const DESCONTO_TOTAL_REFEICAO = 65; // 65 minutos totais no turno
    let descontoRestante = DESCONTO_TOTAL_REFEICAO;
    let descontoParaEsteItem = 0;

    // Calcular quanto de desconto este item recebe
    for (const refeicao of refeicoesDoTurno) {
      if (refeicao.recno === item.recno) {
        // Este é o item atual, calcular seu desconto
        descontoParaEsteItem = Math.min(item.tempo, descontoRestante);
        break;
      } else {
        // Diminuir o desconto restante pelos itens anteriores
        descontoRestante = Math.max(0, descontoRestante - refeicao.tempo);
      }
    }

    const tempoQueAfeta = Math.max(0, item.tempo - descontoParaEsteItem);

    return {
      descontoAplicado: descontoParaEsteItem,
      tempoQueAfeta,
      tempoOriginal: item.tempo,
      totalRefeicoesDoTurno: refeicoesDoTurno.length,
      posicaoNaSequencia: refeicoesDoTurno.findIndex((r) => r.recno === item.recno) + 1,
    };
  };

  // Função para obter informações sobre desconto aplicado
  const getDescontoInfo = (item: TimelineItem) => {
    if (item.afeta_eff === 1) return null;

    const descricaoParaDesconto = item.causa || item.problema || '';
    const descontoKey = Object.keys(DESC_EFF).find((key) =>
      descricaoParaDesconto.toLowerCase().includes(key.toLowerCase())
    );

    if (descontoKey) {
      // Lógica especial para refeição
      if (descontoKey.toLowerCase().includes('refeição')) {
        const refeicaoInfo = calcularDescontoRefeicao(item, filteredData);
        return {
          key: descontoKey,
          desconto: refeicaoInfo.descontoAplicado,
          tempoRestante: refeicaoInfo.tempoQueAfeta,
          tempoOriginal: item.tempo,
          isRefeicao: true,
          posicaoSequencia: refeicaoInfo.posicaoNaSequencia,
          totalRefeicoes: refeicaoInfo.totalRefeicoesDoTurno,
        };
      }

      // Lógica normal para outros casos
      const descontoMinutos = DESC_EFF[descontoKey as keyof typeof DESC_EFF];
      const tempoRestante = Math.max(0, item.tempo - descontoMinutos);

      return {
        key: descontoKey,
        desconto: descontoMinutos,
        tempoRestante,
        tempoOriginal: item.tempo,
        isRefeicao: false,
      };
    }

    return null;
  };

  // Função para calcular se realmente afeta a eficiência considerando descontos
  const calculaAfetaEficiencia = (item: TimelineItem): boolean => {
    // Se afeta_eff === 1, não afeta mesmo
    if (item.afeta_eff === 1) return false;

    // Se afeta_eff === 0, verificar se há desconto aplicável
    if (item.afeta_eff === 0) {
      const descricaoParaDesconto = item.causa || item.problema || '';
      const descontoKey = Object.keys(DESC_EFF).find((key) =>
        descricaoParaDesconto.toLowerCase().includes(key.toLowerCase())
      );

      if (descontoKey) {
        // Lógica especial para refeição
        if (descontoKey.toLowerCase().includes('refeição')) {
          const refeicaoInfo = calcularDescontoRefeicao(item, filteredData);
          return refeicaoInfo.tempoQueAfeta > 0;
        }

        // Lógica normal para outros casos
        const descontoMinutos = DESC_EFF[descontoKey as keyof typeof DESC_EFF];
        return item.tempo > descontoMinutos;
      }

      // Se não há desconto aplicável e afeta_eff === 0, afeta mesmo
      return true;
    }

    // Caso padrão
    return item.afeta_eff === 0;
  };

  // Função para obter cor do motivo
  const getMotivoColor = (motivo: string | null, causa: string | null): string => {
    // Priorizar refeição se estiver na causa
    if (causa === 'Refeição') {
      return colorObj['Refeição'] || BSColors.PINK_COLOR;
    }

    if (!motivo) return BSColors.WARNING_COLOR;
    return colorObj[motivo as keyof typeof colorObj] || BSColors.GREY_600_COLOR;
  };

  // Função para obter ícone do motivo
  const getMotivoIcon = (motivo: string | null, causa: string | null): string => {
    // Priorizar refeição se estiver na causa
    if (causa === 'Refeição') {
      return 'bi-cup-hot';
    }

    if (!motivo) return 'bi-question-circle';

    const iconMap: Record<string, string> = {
      Rodando: 'bi-play-circle-fill',
      Refeição: 'bi-cup-hot',
      Ajustes: 'bi-gear',
      Manutenção: 'bi-wrench',
      Setup: 'bi-tools',
      Fluxo: 'bi-arrow-right-circle',
      Qualidade: 'bi-shield-check',
      'Saída para Backup': 'bi-archive',
      Liberada: 'bi-unlock',
      Limpeza: 'bi-brush',
      'Parada Programada': 'bi-calendar-x',
      'Não apontado': 'bi-exclamation-triangle',
      'Perda de Ciclo': 'bi-speedometer2',
    };

    return iconMap[motivo] || 'bi-circle';
  };

  // Função para formatar tempo
  const formatTempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  if (isLoading) {
    return (
      <Card className='shadow border-0 bg-light p-3 mb-3'>
        <div className='text-center'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <p className='mt-2'>Carregando timeline...</p>
        </div>
      </Card>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    const hasNoLinesSelected = selectedLines.length === 0;

    return (
      <Card className='shadow border-0 bg-light p-3 mb-3'>
        <h3 className='text-center mb-3'>Timeline</h3>
        <div className='text-center text-muted'>
          <i className='bi bi-info-circle' style={{ fontSize: '2rem' }}></i>
          <p className='mt-2'>
            {hasNoLinesSelected
              ? 'Nenhuma linha selecionada'
              : 'Nenhum dado encontrado para a linha selecionada'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='shadow border-0 bg-light p-3 mb-3'>
      <h3 className='text-center mb-4'>Timeline</h3>

      {isRefreshing && (
        <div className='position-absolute top-0 end-0 m-2'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}

      <div className='timeline-centered'>
        {filteredData.map((item, index) => (
          <article key={item.recno} className={`timeline-entry ${index % 2 === 1 ? 'left-aligned' : ''}`}>
            <div className='timeline-entry-inner'>
              {/* Tempo */}
              <time className='timeline-time'>
                <span>{format(new Date(item.data_hora), 'HH:mm')}</span>
                <span>{item.turno}</span>
              </time>

              {/* Ícone */}
              <div
                className='timeline-icon'
                style={{ backgroundColor: getMotivoColor(item.motivo, item.causa) }}
              >
                <i className={getMotivoIcon(item.motivo, item.causa)}></i>
              </div>

              {/* Conteúdo */}
              <div className='timeline-label'>
                <h2>
                  {item.motivo || 'Não informado'}
                  {calculaAfetaEficiencia(item) && (
                    <span className='ms-2 badge bg-danger'>
                      <i className='bi bi-exclamation-triangle me-1'></i>
                      Afeta Eficiência
                    </span>
                  )}
                  {!calculaAfetaEficiencia(item) && (
                    <span className='ms-2 badge bg-success'>
                      <i className='bi bi-check-circle me-1'></i>
                      Não Afeta
                    </span>
                  )}
                </h2>

                {item.problema && (
                  <p className='mb-2'>
                    <strong>Problema:</strong> {item.problema}
                  </p>
                )}

                {item.causa && (
                  <p className='mb-2'>
                    <strong>Causa:</strong> {item.causa}
                  </p>
                )}

                {/* Informações de desconto */}
                {(() => {
                  const descontoInfo = getDescontoInfo(item);
                  if (descontoInfo) {
                    if (descontoInfo.isRefeicao) {
                      return (
                        <div className='mb-2 p-2 bg-light rounded border'>
                          <small className='text-muted'>
                            <i className='bi bi-cup-hot me-1'></i>
                            <strong>
                              {descontoInfo.totalRefeicoes && descontoInfo.totalRefeicoes > 1
                                ? `Refeição (${descontoInfo.posicaoSequencia}ª de ${descontoInfo.totalRefeicoes}):`
                                : 'Refeição:'}
                            </strong>
                            <br />
                            <strong>Desconto aplicado:</strong> {formatTempo(descontoInfo.desconto)} (de 65min
                            totais no turno)
                            <br />
                            <strong>Tempo que afeta eficiência:</strong>{' '}
                            {formatTempo(descontoInfo.tempoRestante)}
                          </small>
                        </div>
                      );
                    } else {
                      return (
                        <div className='mb-2 p-2 bg-light rounded border'>
                          <small className='text-muted'>
                            <i className='bi bi-clock me-1'></i>
                            <strong>Desconto aplicado ({descontoInfo.key}):</strong>{' '}
                            {formatTempo(descontoInfo.desconto)}
                            <br />
                            <strong>Tempo que afeta eficiência:</strong>{' '}
                            {formatTempo(descontoInfo.tempoRestante)}
                          </small>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

                <div className='row text-muted small'>
                  <div>
                    <strong>Duração:</strong> {formatTempo(item.tempo)}
                  </div>
                </div>

                {item.operador_id && (
                  <div className='mt-2 text-muted small'>
                    <strong>Operador:</strong> {item.operador_id}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}

        {/* Marcador de início */}
        <article className='timeline-entry begin'>
          <div className='timeline-entry-inner'>
            <div className='timeline-icon timeline-start'>
              <i className='bi bi-flag-fill'></i>
            </div>
          </div>
        </article>
      </div>
    </Card>
  );
};

export default TimelineOperation;
