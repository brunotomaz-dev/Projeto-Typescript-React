import React, { useMemo } from 'react';
import { Badge, Button, Card, Row } from 'react-bootstrap';
import { getTurnoName } from '../../../helpers/constants';
import { usePermissions } from '../../../hooks/usePermissions';
import { usePinnedCards } from '../../../hooks/usePinnedCards';
import { useToast } from '../../../hooks/useToast';
import { iActionPlanCards } from '../../../interfaces/ActionPlan.interface';
import { differenceInDays, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

//cSpell: words nivel exibicao superv responsavel solucao

interface iActionToShow extends iActionPlanCards {
  nivelExibicao: number;
}

interface iSupervActionCardsProps {
  actionPlanData: iActionToShow[];
}

const SupervActionCards: React.FC<iSupervActionCardsProps> = ({ actionPlanData }) => {
  /* -------------------------------------------- HOOK -------------------------------------------- */
  const { ToastDisplay, showToast } = useToast();
  const { hasElementAccess, userFunctionalLevel } = usePermissions(); // Adicionar userFunctionalLevel aqui

  // Extrair recnos válidos dos dados atuais (apenas se os dados não estiver vazios)
  const validRecnos = useMemo(
    () => (actionPlanData.length > 0 ? actionPlanData.map((action) => action.recno) : []),
    [actionPlanData]
  );

  // Passar opção de limpeza para o hook
  const { isPinned, pinnedCards, togglePin } = usePinnedCards(3, 'supervActionPinnedCards', {
    // Só habilitar limpeza se tivermos dados válidos
    enabled: validRecnos.length > 0,
    validRecnos,
  });

  /* ------------------------------------------- Funções ------------------------------------------ */
  // Determina automaticamente se devemos mostrar apenas os pinados ou todos
  const showOnlyPinned = useMemo(() => pinnedCards.length >= 3, [pinnedCards]);

  // Verificar se um plano está em PDCA e se está dentro do prazo
  const verificarPrazoPDCA = (plan: iActionToShow) => {
    if (plan.conclusao !== 3 || !plan.prazo) return { isPDCA: false, diasRestantes: 0, estaNoPrazo: false };
    
    const hoje = new Date();
    const dataPrazo = parseISO(plan.prazo);
    const diasRestantes = differenceInDays(dataPrazo, hoje);
    
    return {
      isPDCA: true,
      diasRestantes,
      estaNoPrazo: diasRestantes >= 0,
      // Se estiver a 2 dias ou menos do prazo, destacar como próximo
      estaPróximo: diasRestantes >= 0 && diasRestantes <= 2
    };
  };

  // Filtrar e ordenar os dados
  const processedActionData = useMemo(() => {
    // Primeiro filtramos se necessário
    const filteredData = showOnlyPinned
      ? actionPlanData.filter((action) => pinnedCards.includes(action.recno))
      : actionPlanData;

    // Depois ordenamos (pinados primeiro, depois por dias em aberto)
    return [...filteredData].sort((a, b) => {
      // Ordenar itens fixados primeiro
      const aIsPinned = pinnedCards.includes(a.recno) ? 1 : 0;
      const bIsPinned = pinnedCards.includes(b.recno) ? 1 : 0;

      if (aIsPinned !== bIsPinned) return bIsPinned - aIsPinned;

      // Depois ordenar por dias em aberto (mais dias primeiro)
      return b.dias_aberto - a.dias_aberto;
    });
  }, [actionPlanData, pinnedCards, showOnlyPinned]);

  /* ------------------------------------------- Handles ------------------------------------------ */
  const handleTogglePin = (recno: number) => {
    if (pinnedCards.length >= 3 && !isPinned(recno)) {
      return showToast('Você já fixou o máximo de 3 cartões.', 'warning');
    }

    togglePin(recno);
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {processedActionData.length > 0 && (
        <>
          {hasElementAccess('post_it_action') && (
            <>
              {/* Indicador de modo de visualização */}
              <div className='d-flex justify-content-between mb-3 align-items-center'>
                <h5 className='mb-0'>Planos de Ação</h5>
                {showOnlyPinned ? (
                  <Badge bg='info' className='fs-6 d-flex align-items-center gap-1'>
                    <i className='bi bi-pin-fill'></i>
                    Mostrando apenas cartões fixados
                  </Badge>
                ) : (
                  <Badge bg='secondary' className='fs-6 d-flex align-items-center gap-1'>
                    <i className='bi bi-grid'></i>
                    Mostrando todos os cartões
                    {pinnedCards.length > 0 && <span className='ms-2'>({pinnedCards.length}/3 fixados)</span>}
                  </Badge>
                )}
              </div>
            </>
          )}

          {/* Cartões de ação */}
          <Row className='row-wrap gap-3 justify-content-center cards-container'>
            {processedActionData.map((action) => {
              // Verificar status PDCA
              const { isPDCA, diasRestantes, estaNoPrazo, estaPróximo } = verificarPrazoPDCA(action);
              
              // Calcular dias para vermelho (não aplicável em PDCA com prazo válido)
              const diasParaVermelho = calcularDiasParaVermelho(userFunctionalLevel, action.lvl);

              // Verificar se está em estado de urgência (vermelho) - não se aplica a PDCA dentro do prazo
              const isUrgente = !isPDCA && action.dias_aberto >= diasParaVermelho;

              // Verificar se está em estado de alerta (amarelo) - não se aplica a PDCA dentro do prazo
              const isAlerta = !isPDCA && isCartaoEmAlerta(userFunctionalLevel, action.lvl, action.dias_aberto);

              // Definir cores com base no estado
              let headerColor, borderStyle, btnVariant, cardClass = '';

              if (isPDCA && estaNoPrazo) {
                // Cartão em PDCA dentro do prazo (dourado)
                headerColor = 'bg-warning text-dark';
                borderStyle = 'border-warning border border-2';
                btnVariant = isPinned(action.recno) ? 'dark' : 'outline-dark';
                cardClass = 'pdca-card';
              } else if (isUrgente) {
                // Cartão urgente (vermelho)
                headerColor = 'bg-danger text-light';
                borderStyle = 'border-danger border border-1';
                btnVariant = isPinned(action.recno) ? 'light' : 'outline-light';
              } else if (isAlerta) {
                // Cartão em alerta (amarelo)
                headerColor = 'bg-warning';
                borderStyle = 'border-warning border border-1';
                btnVariant = isPinned(action.recno) ? 'light' : 'outline-secondary';
              } else {
                // Cartão normal (cinza ou outra cor de sua preferência)
                headerColor = 'bg-light';
                borderStyle = 'border-secondary border border-1';
                btnVariant = 'outline-secondary';
              }

              const pinIcon = isPinned(action.recno) ? 'bi-pin-fill' : 'bi-pin-angle-fill';

              return (
                <Card
                  key={action.recno}
                  style={{ width: '18rem', height: '18rem' }}
                  className={`p-0 shadow ${borderStyle} ${isPinned(action.recno) ? 'card-pinned' : ''} action-card ${cardClass}`}
                >
                  {/* Indicador visual de card pinado */}
                  {isPinned(action.recno) && (
                    <div className='pin-indicator'>
                      <i className='bi bi-star-fill'></i>
                    </div>
                  )}
                  <Card.Header className={`d-flex justify-content-between align-items-center ${headerColor}`}>
                    <div className="d-flex align-items-center">
                      {isPDCA && estaNoPrazo ? (
                        <span className="d-flex align-items-center">
                          <Badge className="pdca-badge me-2">
                            <i className="bi bi-arrow-repeat me-1"></i>
                            PDCA
                          </Badge>
                          {diasRestantes > 0 && (
                            <span className={estaPróximo ? 'prazo-proximo' : 'prazo-destaque'}>
                              ({diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>
                          <strong>Dias em Aberto:</strong> {action.dias_aberto}
                        </span>
                      )}
                    </div>
                    <Button variant={btnVariant} size='sm' onClick={() => handleTogglePin(action.recno)}>
                      <i className={pinIcon}></i>
                    </Button>
                  </Card.Header>
                  <Card.Body className='overflow-auto pb-1'>
                    {isPDCA && action.prazo && (
                      <Card.Text className="mb-2">
                        <strong>Prazo:</strong>{' '}
                        <span className={estaPróximo ? 'prazo-proximo' : ''}>
                          {format(parseISO(action.prazo), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </Card.Text>
                    )}
                    <Card.Text>
                      <strong>Responsável: </strong>
                      {action.responsavel}
                    </Card.Text>
                    <Card.Text>
                      <strong>Turno: </strong>
                      {getTurnoName(action.turno)}
                    </Card.Text>
                    <Card.Text>
                      <strong>Causa Raiz: </strong>
                      {action.causa_raiz}
                    </Card.Text>
                    <Card.Text>
                      <strong>Solução: </strong>
                      {action.solucao}
                    </Card.Text>
                  </Card.Body>
                </Card>
              );
            })}
          </Row>
        </>
      )}
      <ToastDisplay />
    </>
  );
};

// Função auxiliar para calcular quantos dias são necessários para um cartão ficar vermelho
function calcularDiasParaVermelho(nivelUsuario: number, nivelCartao: number): number {
  // Diferença de nível entre o usuário e o cartão
  const diferenca = nivelUsuario - nivelCartao;

  // Base de dias para vermelho (pode ajustar estes valores conforme necessário)
  if (diferenca <= 0) {
    // Se o cartão tem nível igual ou maior que o usuário, fica vermelho em 3 dias
    return 3;
  } else if (diferenca === 1) {
    // Se o cartão tem nível 1 abaixo do usuário, fica vermelho em 6 dias
    return 6;
  } else if (diferenca === 2) {
    // Se o cartão tem nível 2 abaixo do usuário, fica vermelho em 9 dias
    return 9;
  } else {
    // Para diferenças maiores, aumenta proporcionalmente
    return 3 + diferenca * 3;
  }
}

// Nova função para determinar se o cartão deve estar em amarelo (warning)
// Agora mostra amarelo 2 dias antes de ficar vermelho
function isCartaoEmAlerta(nivelUsuario: number, nivelCartao: number, diasAberto: number): boolean {
  // Calcular quando o cartão ficará vermelho
  const diasParaVermelho = calcularDiasParaVermelho(nivelUsuario, nivelCartao);

  // Cartão fica amarelo 2 dias antes de ficar vermelho
  // Garantimos que não ficará amarelo com menos de 1 dia
  return diasAberto >= Math.max(1, diasParaVermelho - 2) && diasAberto < diasParaVermelho;
}

export default SupervActionCards;
