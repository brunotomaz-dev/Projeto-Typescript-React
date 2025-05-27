import { differenceInDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Modal, Row, Table } from 'react-bootstrap';
import { getActionPlan } from '../../../api/apiRequests';
import { ActionPlanStatus, getTurnoName } from '../../../helpers/constants';
import { iActionPlan, iActionPlanCards } from '../../../interfaces/ActionPlan.interface';

const TodayActionPlans: React.FC = () => {
  /* ---------------------------------------- States ---------------------------------------- */
  const [actionPlans, setActionPlans] = useState<iActionPlanCards[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<iActionPlanCards | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  /* ---------------------------------------- Dates ----------------------------------------- */
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(today, 1));
  const todayString = format(today, 'yyyy-MM-dd');
  const yesterdayString = format(yesterday, 'yyyy-MM-dd');

  /* ---------------------------------------- Handlers -------------------------------------- */
  const handlePlanClick = (plan: iActionPlanCards) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  /* ---------------------------------------- Effects --------------------------------------- */
  useEffect(() => {
    const fetchTodayActionPlans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Buscar todos os tipos de planos de ação (abertos, PDCA, concluídos e cancelados)
        const data = await getActionPlan(
          [yesterdayString],
          [
            ActionPlanStatus.Aberto,
            ActionPlanStatus.PDCA,
            ActionPlanStatus.Concluído,
            ActionPlanStatus.Cancelado,
          ]
        );

        // Filtrar apenas planos criados hoje (MAT, NOT) ou ontem (VES)
        const filteredPlans = data.filter((plan: iActionPlan) => {
          const planDate = format(parseISO(plan.data_registro), 'yyyy-MM-dd');

          // Para o turno VES, pegamos os planos de ontem
          if (plan.turno === 'VES') {
            return planDate === yesterdayString;
          }
          // Para os turnos MAT e NOT, pegamos os planos de hoje
          return planDate === todayString;
        });

        // Processar os planos e adicionar dias em aberto apenas para Abertos e PDCA
        const plansWithDays = filteredPlans.map((plan: iActionPlan) => {
          // Calcular dias em aberto apenas para planos Abertos ou em PDCA
          if (plan.conclusao === ActionPlanStatus.Aberto || plan.conclusao === ActionPlanStatus.PDCA) {
            const dataInicial = parseISO(plan.data_registro);
            const diasAberto = differenceInDays(today, dataInicial);
            return {
              ...plan,
              dias_aberto: diasAberto >= 0 ? diasAberto : 0,
            };
          } else {
            // Para planos concluídos ou cancelados, dias_aberto = 0
            return {
              ...plan,
              dias_aberto: 0,
            };
          }
        });

        setActionPlans(plansWithDays);
      } catch (error) {
        console.error('Erro ao buscar planos de ação do dia:', error);
        setError('Falha ao carregar os planos de ação. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayActionPlans();
  }, [todayString, yesterdayString]);

  /* ---------------------------------------- Helpers --------------------------------------- */
  // Agrupar planos por turno
  const plansByShift = {
    NOT: actionPlans.filter((plan) => plan.turno === 'NOT'),
    MAT: actionPlans.filter((plan) => plan.turno === 'MAT'),
    VES: actionPlans.filter((plan) => plan.turno === 'VES'),
  };

  // Função para obter a variante e texto do badge de status
  const getStatusBadge = (status: number) => {
    switch (status) {
      case ActionPlanStatus.Aberto:
        return { variant: 'info', text: 'Aberto', textClass: '' };
      case ActionPlanStatus.PDCA:
        return { variant: 'warning', text: 'PDCA', textClass: 'text-dark' };
      case ActionPlanStatus.Concluído:
        return { variant: 'success', text: 'Concluído', textClass: '' };
      case ActionPlanStatus.Cancelado:
        return { variant: 'danger', text: 'Cancelado', textClass: '' };
      default:
        return { variant: 'secondary', text: 'Desconhecido', textClass: '' };
    }
  };

  // Função para renderizar um plano de ação na tabela
  const renderActionPlan = (plan: iActionPlanCards) => {
    // Obter dados do badge de status
    const statusBadge = getStatusBadge(plan.conclusao);

    return (
      <tr
        key={plan.recno}
        onClick={() => handlePlanClick(plan)}
        className='cursor-pointer'
        style={{ cursor: 'pointer' }}
      >
        <td>#{plan.recno}</td>
        <td>{plan.indicador}</td>
        <td>
          <Badge bg={statusBadge.variant} className={statusBadge.textClass}>
            {statusBadge.text}
          </Badge>
        </td>
        <td>{plan.responsavel}</td>
        <td className='text-truncate' style={{ maxWidth: '180px' }} title={plan.descricao}>
          {plan.descricao}
        </td>
      </tr>
    );
  };

  // Função para renderizar uma seção de turno
  const renderShiftSection = (shift: 'NOT' | 'MAT' | 'VES') => {
    const plans = plansByShift[shift];
    const shiftDate =
      shift === 'VES'
        ? format(yesterday, "dd 'de' MMMM", { locale: ptBR })
        : format(today, "dd 'de' MMMM", { locale: ptBR });

    return (
      <Card className='mb-3 bg-transparent border-0'>
        <Card.Header className='d-flex justify-content-between align-items-center bg-light'>
          <h6 className='mb-0'>
            <i
              className={`bi ${shift === 'MAT' ? 'bi-sun' : shift === 'VES' ? 'bi-sunset' : 'bi-moon'} me-2`}
            ></i>
            Turno {getTurnoName(shift)} - {shiftDate}
          </h6>
          <Badge bg='secondary'>{plans.length} planos</Badge>
        </Card.Header>
        <Card.Body className='p-0'>
          {plans.length > 0 ? (
            <Table hover responsive size='sm' className='mb-0'>
              <thead className='table-light'>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th style={{ width: '100px' }}>Indicador</th>
                  <th style={{ width: '80px' }}>Status</th>
                  <th style={{ width: '150px' }}>Responsável</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>{plans.map(renderActionPlan)}</tbody>
            </Table>
          ) : (
            <div className='text-center p-3 text-muted'>
              <i className='bi bi-clipboard-x me-2'></i>
              Nenhum plano de ação registrado
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  /* ---------------------------------------- Layout --------------------------------------- */
  return (
    <>
      <Card className='shadow mb-4'>
        <Card.Header className='bg-light d-flex justify-content-between align-items-center'>
          <h5 className='mb-0'>
            <i className='bi bi-calendar-check me-2 text-primary'></i>
            Planos de Ação do Dia
          </h5>
          <Badge bg='primary'>{actionPlans.length} planos</Badge>
        </Card.Header>
        <Card.Body className='pb-2'>
          {isLoading ? (
            <div className='text-center p-4'>
              <div className='spinner-border text-primary' role='status'>
                <span className='visually-hidden'>Carregando...</span>
              </div>
              <p className='mt-2'>Carregando planos de ação...</p>
            </div>
          ) : error ? (
            <div className='alert alert-danger'>{error}</div>
          ) : actionPlans.length === 0 ? (
            <div className='alert alert-info'>
              <i className='bi bi-info-circle me-2'></i>
              Nenhum plano de ação registrado hoje ou ontem (turno vespertino).
            </div>
          ) : (
            <Row>
              <Col md={4} className='mb-md-0 mb-3'>
                {renderShiftSection('NOT')}
              </Col>
              <Col md={4} className='mb-md-0 mb-3'>
                {renderShiftSection('MAT')}
              </Col>
              <Col md={4}>{renderShiftSection('VES')}</Col>
            </Row>
          )}
        </Card.Body>
        <Card.Footer className='bg-transparent text-center small text-muted'>
          <i className='bi bi-info-circle me-1'></i>
          Mostrando todos os planos do turno Noturno e Matutino de hoje, e planos do turno Vespertino de ontem
        </Card.Footer>
      </Card>

      {/* Modal para exibir os detalhes do plano de ação */}
      <Modal show={showModal} onHide={handleCloseModal} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Plano de Ação #{selectedPlan?.recno}
            <span className='ms-2'>
              {selectedPlan && (
                <Badge
                  bg={getStatusBadge(selectedPlan.conclusao).variant}
                  className={getStatusBadge(selectedPlan.conclusao).textClass}
                >
                  {getStatusBadge(selectedPlan.conclusao).text}
                </Badge>
              )}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <div className='action-plan-details'>
              <Row className='mb-3'>
                <Col md={6}>
                  <h6>Indicador</h6>
                  <p>{selectedPlan.indicador}</p>
                </Col>
                <Col md={6}>
                  <h6>Turno</h6>
                  <p>{getTurnoName(selectedPlan.turno)}</p>
                </Col>
              </Row>

              <Row className='mb-3'>
                <Col md={6}>
                  <h6>Responsável</h6>
                  <p>{selectedPlan.responsavel}</p>
                </Col>
                <Col md={6}>
                  <h6>Data de Registro</h6>
                  <p>{format(parseISO(selectedPlan.data_registro), 'dd/MM/yyyy')}</p>
                </Col>
              </Row>

              <div className='mb-3'>
                <h6>Descrição</h6>
                <div className='p-2 bg-light rounded'>{selectedPlan.descricao}</div>
              </div>

              <div className='mb-3'>
                <h6>Causa Raiz</h6>
                <div className='p-2 bg-light rounded'>
                  {selectedPlan.causa_raiz ? selectedPlan.causa_raiz : 'Não informada.'}
                </div>
              </div>

              {selectedPlan.solucao && (
                <div className='mb-3'>
                  <h6>Solução</h6>
                  <div className='p-2 bg-light rounded'>{selectedPlan.solucao}</div>
                </div>
              )}

              <div className='mb-3'>
                <h6>Feedback</h6>
                <div className='p-2 bg-light rounded'>
                  {selectedPlan.feedback ? selectedPlan.feedback : 'Nenhum feedback registrado.'}
                </div>
              </div>

              {/* Datas especiais baseadas no status */}
              {selectedPlan.conclusao === ActionPlanStatus.PDCA && selectedPlan.prazo && (
                <div className='mb-3'>
                  <h6>Prazo para PDCA</h6>
                  <p className='text-warning'>
                    <i className='bi bi-clock-history me-1'></i>
                    {format(parseISO(selectedPlan.prazo), 'dd/MM/yyyy')}
                  </p>
                </div>
              )}

              {selectedPlan.conclusao === ActionPlanStatus.Concluído && selectedPlan.data_conclusao && (
                <div className='mb-3'>
                  <h6>Data de Conclusão</h6>
                  <p className='text-success'>
                    <i className='bi bi-check-circle me-1'></i>
                    {format(parseISO(selectedPlan.data_conclusao), 'dd/MM/yyyy')}
                  </p>
                </div>
              )}

              {/* Mostrar dias em aberto apenas para planos Abertos ou em PDCA */}
              {(selectedPlan.conclusao === ActionPlanStatus.Aberto ||
                selectedPlan.conclusao === ActionPlanStatus.PDCA) && (
                <div className='mb-1'>
                  <h6>Dias em Aberto</h6>
                  <Badge bg='secondary' className='fs-6'>
                    {selectedPlan.dias_aberto} {selectedPlan.dias_aberto === 1 ? 'dia' : 'dias'}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TodayActionPlans;
