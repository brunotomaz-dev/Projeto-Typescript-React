import React, { useMemo } from 'react';
import { Badge, Button, Card, Row } from 'react-bootstrap';
import { getTurnoName } from '../../../helpers/constants';
import { usePermissions } from '../../../hooks/usePermissions';
import { usePinnedCards } from '../../../hooks/usePinnedCards';
import { useToast } from '../../../hooks/useToast';
import { iActionPlanCards } from '../../../interfaces/ActionPlan.interface';

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
  const { hasElementAccess } = usePermissions();
  const { isPinned, pinnedCards, togglePin } = usePinnedCards();

  /* ------------------------------------------- Funções ------------------------------------------ */
  // Determina automaticamente se devemos mostrar apenas os pinados ou todos
  const showOnlyPinned = useMemo(() => pinnedCards.length >= 3, [pinnedCards]);

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
                    {pinnedCards.length > 0 && (
                      <span className='ms-2'>({pinnedCards.length}/3 fixados)</span>
                    )}
                  </Badge>
                )}
              </div>
            </>
          )}

          {/* Cartões de ação */}
          <Row className='row-wrap gap-3 justify-content-center cards-container'>
            {processedActionData.map((action) => {
              const headerColor =
                action.dias_aberto > 6 ? 'bg-danger text-light' : 'bg-warning';
              const borderStyle =
                action.dias_aberto > 6
                  ? 'border-danger border border-1'
                  : 'border-warning border border-1';
              const btnVariant = isPinned(action.recno)
                ? 'light'
                : action.dias_aberto > 6
                  ? 'outline-light'
                  : 'outline-secondary';
              const pinIcon = isPinned(action.recno) ? 'bi-pin-fill' : 'bi-pin-angle-fill';
              return (
                <Card
                  key={action.recno}
                  style={{ width: '18rem', height: '18rem' }}
                  className={`p-0 shadow ${borderStyle} ${isPinned(action.recno) ? 'card-pinned' : ''} action-card`}
                >
                  {/* Indicador visual de card pinado */}
                  {isPinned(action.recno) && (
                    <div className='pin-indicator'>
                      <i className='bi bi-star-fill'></i>
                    </div>
                  )}
                  <Card.Header
                    className={`d-flex justify-content-between align-items-center ${headerColor}`}
                  >
                    <span>
                      <strong>Dias em Aberto:</strong> {action.dias_aberto}
                    </span>
                    <Button
                      variant={btnVariant}
                      size='sm'
                      onClick={() => handleTogglePin(action.recno)}
                    >
                      <i className={pinIcon}></i>
                    </Button>
                  </Card.Header>
                  <Card.Body className='overflow-auto pb-1'>
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

export default SupervActionCards;
