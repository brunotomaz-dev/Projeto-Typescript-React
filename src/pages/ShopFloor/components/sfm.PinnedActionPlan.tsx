import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Row } from 'react-bootstrap';
import { getActionPlan } from '../../../api/apiRequests';
import { ActionPlanStatus, getTurnoName } from '../../../helpers/constants';
import { useToast } from '../../../hooks/useToast';
import { iActionPlan, iActionPlanCards } from '../../../interfaces/ActionPlan.interface';
import { cleanupPins } from '../../../redux/store/features/pinsSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

const PinnedActionPlans: React.FC = () => {
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const pinnedCards = useAppSelector((state) => state.pins.pinnedCards);
  const dispatch = useAppDispatch();

  /* ---------------------------------------------- Local State ---------------------------------------------- */
  const [pinnedPlans, setPinnedPlans] = useState<iActionPlanCards[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allRecnos, setAllRecnos] = useState<number[]>([]);

  /* ---------------------------------------------- Hooks --------------------------------------------------- */
  const { showToast, ToastDisplay } = useToast();

  /* -------------------------------------------- DATAS ------------------------------------------- */
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const dayStartString = format(startOfDay(threeMonthsAgo), 'yyyy-MM-dd');

  // Buscar os planos de ação pinados
  useEffect(() => {
    if (pinnedCards.length === 0) {
      setPinnedPlans([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchPinnedPlans = async () => {
      try {
        // Buscar todos os planos de ação
        const allPlans = await getActionPlan([dayStartString], [0, 3]); // Buscando planos abertos e em PDCA

        // Armazenar todos os recnos válidos para limpeza
        const validRecnos = allPlans.map((plan: iActionPlan) => plan.recno);
        setAllRecnos(validRecnos);

        // Filtrar apenas os pinados
        const filteredPlans = allPlans
          .filter((plan: iActionPlan) => pinnedCards.includes(plan.recno))
          .map((plan: iActionPlan) => {
            // Calcular dias em aberto
            const dataInicial = parseISO(plan.data_registro);
            const hoje = new Date();
            const diasAberto = differenceInDays(hoje, dataInicial);

            return {
              ...plan,
              dias_aberto: diasAberto >= 0 ? diasAberto : 0,
            };
          });

        setPinnedPlans(filteredPlans);

        // Limpeza de pins inválidos
        if (filteredPlans.length < pinnedCards.length) {
          // Calcular os recnos que foram removidos
          const removedPins = pinnedCards.filter((pin) => !validRecnos.includes(pin));

          // Temos pins que não correspondem a planos existentes
          dispatch(cleanupPins(validRecnos));

          // Mostrar toast informando sobre a limpeza
          if (removedPins.length > 0) {
            const pinWord = removedPins.length === 1 ? 'plano fixado' : 'planos fixados';
            showToast(`${removedPins.length} ${pinWord} não existe(m) mais e foi(ram) removido(s)`, 'info');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar planos pinados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPinnedPlans();
  }, [pinnedCards, dispatch, showToast]);

  // Efeito adicional para limpeza periódica dos pins
  useEffect(() => {
    // Se temos dados de recnos válidos, podemos limpar os pins
    if (allRecnos.length > 0 && pinnedCards.length > 0) {
      // Verificar pins que não existem em allRecnos
      const invalidPins = pinnedCards.filter((pin) => !allRecnos.includes(pin));

      if (invalidPins.length > 0) {
        // Temos pins inválidos para limpar
        dispatch(cleanupPins(allRecnos));

        // Mostrar toast só a primeira vez que detectarmos pins inválidos
        const pinWord = invalidPins.length === 1 ? 'plano fixado' : 'planos fixados';
        showToast(`${invalidPins.length} ${pinWord} não existe(m) mais e foi(ram) removido(s)`, 'info');
      }
    }
  }, [allRecnos, pinnedCards, dispatch, showToast]);

  // Função para obter a cor do badge de status
  const getStatusBadge = (status: number) => {
    switch (status) {
      case ActionPlanStatus.Aberto:
        return <Badge bg='info'>Aberto</Badge>;
      case ActionPlanStatus.PDCA:
        return (
          <Badge bg='warning' text='dark'>
            PDCA
          </Badge>
        );
      default:
        return <Badge bg='secondary'>Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className='shadow mb-4'>
        <Card.Body className='text-center p-4'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <p className='mt-2'>Buscando planos de ação pinados...</p>
        </Card.Body>
      </Card>
    );
  }

  if (pinnedCards.length === 0) {
    return (
      <Card className='shadow mb-4'>
        <Card.Header>
          <h5 className='mb-0'>Planos de Ação Prioritários</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant='info' className='mb-0'>
            <i className='bi bi-info-circle me-2'></i>
            Nenhum plano de ação foi pinado. Visite a página de Supervisão para destacar planos importantes.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {/* Componente principal */}
      <Card className='shadow mb-4'>
        <Card.Header className='bg-light d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>
            <i className='bi bi-pin-fill me-2 text-danger'></i>
            Planos de Ação Prioritários
          </h5>
          <Badge bg='secondary'>{pinnedPlans.length} indicados</Badge>
        </Card.Header>
        <Card.Body className='p-0'>
          <Row className='g-0'>
            {pinnedPlans.map((plan) => (
              <Col key={plan.recno} md={4} className={pinnedPlans.length > 1 ? 'border-end' : ''}>
                <div className='p-3 h-100'>
                  <div className='d-flex justify-content-between align-items-center mb-2'>
                    <div>
                      <Badge bg='primary' className='me-2'>
                        #{plan.recno}
                      </Badge>
                      {getStatusBadge(plan.conclusao)}
                    </div>
                    <Badge bg='secondary'>{plan.dias_aberto} dias</Badge>
                  </div>

                  <h6 className='border-bottom pb-2'>
                    <strong>Indicador:</strong> {plan.indicador} | <strong>Turno:</strong>{' '}
                    {getTurnoName(plan.turno)}
                  </h6>

                  <div className='mb-2'>
                    <strong>Responsável:</strong> {plan.responsavel}
                  </div>

                  <div className='mb-2'>
                    <strong>Data de Registro:</strong> {format(parseISO(plan.data_registro), 'dd/MM/yyyy')}
                  </div>

                  <div className='mb-2'>
                    <strong>Descrição:</strong>
                    <p className='mb-1'>{plan.descricao}</p>
                  </div>

                  <div className='mb-2'>
                    <strong>Solução:</strong>
                    <p className='mb-0'>{plan.solucao}</p>
                  </div>

                  {plan.conclusao === ActionPlanStatus.PDCA && plan.prazo && (
                    <div className='mt-2 text-end'>
                      <Badge bg='warning' text='dark'>
                        <i className='bi bi-calendar-check me-1'></i>
                        Prazo: {format(parseISO(plan.prazo), 'dd/MM/yyyy')}
                      </Badge>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Componente Toast */}
      <ToastDisplay />
    </>
  );
};

export default PinnedActionPlans;
