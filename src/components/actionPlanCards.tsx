// #cSpell: words descricao contencao solucao responsavel pontuacao superv

import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal } from 'react-bootstrap';
import { deleteActionPlan, getActionPlan, updateActionPlan } from '../api/apiRequests';
import { ActionPlanStatus, getTurnoName, Turno, TurnoID } from '../helpers/constants';
import { usePermissions } from '../hooks/usePermissions';
import { usePinnedCards } from '../hooks/usePinnedCards';
import { useToast } from '../hooks/useToast';
import { iActionPlan, iActionPlanCards } from '../interfaces/ActionPlan.interface';
import ActionPlanFormModal from './actionPlanFormModal';

interface iActionPlanTableProps {
  status: ActionPlanStatus | ActionPlanStatus[];
  shift: TurnoID;
  onDataChange: (actionPlan: iActionPlanCards[]) => void;
}

const ActionPlanCards: React.FC<iActionPlanTableProps> = ({ status, shift, onDataChange }) => {
  /* --------------------------------------------- HOOK -------------------------------------------- */
  const {
    hasResourcePermission,
    userFunctionalLevel: userLvl,
    hasElementAccess,
    isSuperUser,
  } = usePermissions(); // Adicionando isSuperUser
  const { ToastDisplay, showToast } = useToast();
  const { isPinned, togglePin, pinnedCards } = usePinnedCards();

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [actionPlanFiltered, setActionPlanFiltered] = useState<iActionPlanCards[]>([]);
  const [selectedActionPlan, setSelectedActionPlan] = useState<iActionPlan | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* -------------------------------------------- DATAS ------------------------------------------- */
  const today = new Date();
  const threeMonthsAgo = today.setMonth(today.getMonth() - 3);
  const dayStartString = format(startOfDay(threeMonthsAgo), 'yyyy-MM-dd');

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  useEffect(() => {
    void getActionPlan([dayStartString], status).then((data) => {
      const adjustedData = data.map((item: iActionPlan) => ({
        ...item,
        // Passando todos os parâmetros necessários
        dias_aberto: calcularDiasEmAberto(item.data_registro, item.conclusao, item.prazo),
      }));

      onDataChange(adjustedData);

      // Aplicar filtro por nível e turno
      const filteredData = adjustedData.filter((item: iActionPlanCards) => {
        // Verificação de nível: usuário só vê cartões com nível <= seu nível
        const passesLevelCheck = item.lvl <= userLvl;

        // Superusuários veem todos os cartões independente do turno
        if (isSuperUser) {
          return passesLevelCheck;
        }

        // Usuários com nível 3+ (acima de supervisão) veem todos os turnos
        if (userLvl >= 3) {
          return passesLevelCheck;
        }

        // Líderes (1) e supervisores (2) só veem seu próprio turno
        return passesLevelCheck && item.turno === shift;
      });

      const sortedData = sortActionPlans(filteredData);
      setActionPlanFiltered(sortedData);
    });
  }, [dayStartString, shift, userLvl, isSuperUser, status]); // Garantir que todas as dependências estejam aqui

  // Adicionar este useEffect dentro do componente ActionPlanCards
  useEffect(() => {
    // Verificar planos com prazos PDCA vencidos
    const verificarPrazosPDCA = async () => {
      const hoje = startOfDay(new Date());

      // Filtrar planos em PDCA com prazo vencido
      const planosPDCAVencidos = actionPlanFiltered.filter(
        (plan) =>
          plan.conclusao === 3 && // É PDCA
          plan.prazo && // Tem prazo definido
          differenceInDays(hoje, parseISO(plan.prazo)) > 0 // Prazo já passou
      );

      // Se encontrou planos vencidos, atualizá-los
      if (planosPDCAVencidos.length > 0) {
        // Atualizar cada plano vencido
        for (const plan of planosPDCAVencidos) {
          try {
            // Preparar dados atualizados - garantindo que data_registro seja uma string
            const planUpdated = {
              ...plan,
              conclusao: 0, // Muda para Aberto
              data_registro: plan.prazo || new Date().toISOString(), // Nova data = prazo antigo ou data atual se for nulo
              prazo: null, // Remove o prazo
            };

            // Chamar API para atualizar o plano
            await updateActionPlan(planUpdated as iActionPlan);

            // Mostrar notificação para o usuário
            showToast(`Plano #${plan.recno} saiu de PDCA por prazo vencido`, 'warning');
          } catch (error) {
            console.error('Erro ao atualizar plano PDCA vencido:', error);
            showToast(`Erro ao atualizar plano PDCA #${plan.recno}`, 'danger');
          }
        }

        // Recarregar os dados para refletir as mudanças
        void loadActionPlanData();
      }
    };

    // Executar a verificação
    void verificarPrazosPDCA();

    // Configurar intervalo para verificar periodicamente
    const intervalId = setInterval(
      () => {
        void verificarPrazosPDCA();
      },
      60 * 60 * 1000
    ); // Verificar a cada 1 hora

    // Limpar intervalo ao desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Função para carregar dados dos planos de ação
  const loadActionPlanData = async () => {
    try {
      // Passando os mesmos parâmetros usados no useEffect
      const data = await getActionPlan([dayStartString], status);

      if (data) {
        // Processar os dados e calcular dias em aberto
        const processedData: iActionPlanCards[] = data
          .filter((plan: iActionPlan) => {
            // Lidar com status como array ou valor único
            if (Array.isArray(status)) {
              return status.includes(plan.conclusao);
            }
            // Lidar com status como valor único
            return plan.conclusao === status;
          })
          .map((plan: iActionPlan) => {
            // Calcular dias em aberto
            const diasAberto = calcularDiasEmAberto(plan.data_registro, plan.conclusao, plan.prazo);
            return { ...plan, dias_aberto: diasAberto };
          });

        setActionPlanFiltered(processedData);

        // Notificar componente pai sobre mudança nos dados
        if (onDataChange) {
          onDataChange(processedData);
        }
      }
    } catch (error) {
      console.error('Error fetching action plan data:', error);
      showToast('Erro ao carregar os planos de ação', 'danger');
    }
  };

  /* ------------------------------------------- FUNÇÕES ------------------------------------------ */
  const sortActionPlans = (planos: iActionPlanCards[]): iActionPlanCards[] => {
    // Obter a data atual e a data de ontem (formato yyyy-MM-dd)
    const hoje = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const ontem = format(startOfDay(new Date(new Date().setDate(new Date().getDate() - 1))), 'yyyy-MM-dd');

    return [...planos].sort((a, b) => {
      const dataA = format(parseISO(a.data_registro), 'yyyy-MM-dd');
      const dataB = format(parseISO(b.data_registro), 'yyyy-MM-dd');

      // Verificar prioridade por data para turno VES
      if (a.turno === Turno.VES) {
        // Para VES, ontem tem prioridade sobre hoje
        if (dataA === ontem && dataB !== ontem) return -1;
        if (dataB === ontem && dataA !== ontem) return 1;
      } else {
        // Para outros turnos, hoje tem prioridade
        if (dataA === hoje && dataB !== hoje) return -1;
        if (dataB === hoje && dataA !== hoje) return 1;
      }

      // Após a ordenação por data atual/ontem, continuar com a lógica existente de pontuação
      const PESO_PRIORIDADE = 5;
      const PESO_DIAS = 1;

      const pontuacaoA = a.prioridade * PESO_PRIORIDADE + a.dias_aberto * PESO_DIAS;
      const pontuacaoB = b.prioridade * PESO_PRIORIDADE + b.dias_aberto * PESO_DIAS;

      // Ordenar por pontuação (maior primeiro)
      if (pontuacaoA !== pontuacaoB) {
        return pontuacaoB - pontuacaoA;
      }

      // Em caso de empate na pontuação, ordenar pelo mais antigo primeiro
      const timestampA = new Date(a.data_registro).getTime();
      const timestampB = new Date(b.data_registro).getTime();
      return timestampA - timestampB;
    });
  };

  const calcularDiasEmAberto = (dataRegistro: Date | string, conclusao?: number, prazo?: string | null) => {
    const dataInicial = dataRegistro instanceof Date ? dataRegistro : parseISO(dataRegistro);
    const hoje = startOfDay(new Date());

    // Para planos em PDCA, considerar os dias até o prazo
    if (conclusao === 3 && prazo) {
      const dataPrazo = parseISO(prazo);
      // Se ainda estiver dentro do prazo, mostrar dias desde registro
      if (differenceInDays(dataPrazo, hoje) >= 0) {
        return differenceInDays(hoje, dataInicial);
      } else {
        // Se o prazo já passou, mostrar dias desde o prazo
        return differenceInDays(hoje, dataPrazo);
      }
    }

    // Lógica normal para outros casos
    const dias = differenceInDays(hoje, dataInicial);
    return dias >= 0 ? dias : 0; // Evita números negativos
  };

  // Função para calcular quantos dias até ficar vermelho (conforme o nível)
  const calcularDiasParaVermelho = (nivelUsuario: number, nivelCartao: number): number => {
    // Diferença de nível entre o usuário e o cartão
    const diferenca = nivelUsuario - nivelCartao;

    // Base de dias para vermelho
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
  };

  // Função para verificar se o cartão está em estado de alerta (amarelo)
  const isCartaoEmAlerta = (nivelUsuario: number, nivelCartao: number, diasAberto: number): boolean => {
    // Calcular quando o cartão ficará vermelho
    const diasParaVermelho = calcularDiasParaVermelho(nivelUsuario, nivelCartao);

    // Cartão fica amarelo 2 dias antes de ficar vermelho
    // Garantimos que não ficará amarelo com menos de 1 dia
    return diasAberto >= Math.max(1, diasParaVermelho - 2) && diasAberto < diasParaVermelho;
  };

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Handler para clique no botão de edição
  const handleEditClick = (actionPlan: iActionPlanCards) => {
    const { dias_aberto, ...rest } = actionPlan;
    setSelectedActionPlan(rest);
    setShowEditModal(true);
  };

  // Handler para clique no botão de exclusão
  const handleDeleteClick = (actionPlan: iActionPlanCards) => {
    setSelectedActionPlan(actionPlan);
    setShowDeleteModal(true);
  };

  // Handler para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!selectedActionPlan || !hasResourcePermission('action_plan', 'delete')) return;

    try {
      setIsDeleting(true);
      await deleteActionPlan(selectedActionPlan.recno);

      // Atualizar a lista sem o item excluído
      const updatedList = actionPlanFiltered.filter((item) => item.recno !== selectedActionPlan.recno);

      setActionPlanFiltered(updatedList);
      onDataChange(updatedList);

      // Fechar o modal de confirmação
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Erro ao excluir plano de ação:', error);
      showToast('Erro ao excluir plano de ação', 'danger');
    } finally {
      setIsDeleting(false);
      showToast('Plano de ação excluído com sucesso', 'success');
    }
  };

  // Handler para fechamento do modal de edição
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedActionPlan(null);
  };

  // Handler para atualização de plano de ação
  const handleActionPlanUpdate = (updatedActionPlan: iActionPlanCards) => {
    // Atualizar a lista com o item modificado
    const updatedList = actionPlanFiltered.map((item) =>
      item.recno === updatedActionPlan.recno ? updatedActionPlan : item
    );

    setActionPlanFiltered(updatedList);
    onDataChange(updatedList);
    handleCloseEditModal();
  };

  // Handler para criar novo plano de ação
  const handleCreateActionPlan = (newActionPlan: iActionPlanCards) => {
    const updatedList = [...actionPlanFiltered, newActionPlan];
    setActionPlanFiltered(updatedList);
    onDataChange(updatedList);
    setShowCreateModal(false);
  };

  const handleTogglePin = (recno: number) => {
    if (pinnedCards.length >= 3 && !isPinned(recno)) {
      return showToast('Você já fixou o máximo de 3 cartões.', 'warning');
    }
    togglePin(recno);
  };

  // Ajustando as variantes dos botões para incluir o caso PDCA
  const getButtonVariant = (isUrgente: boolean, isAlerta: boolean, isPDCA: boolean = false) => {
    if (isPDCA) {
      return 'outline-dark'; // Bom contraste com fundo dourado/amarelo
    } else if (isUrgente) {
      return 'outline-light'; // Bom contraste com fundo vermelho
    } else if (isAlerta) {
      return 'outline-dark'; // Bom contraste com fundo amarelo
    } else {
      return 'outline-secondary'; // Para fundos claros
    }
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Col>
      <Card className='bg-transparent border-0 shadow mb-3 pt-2 px-2'>
        <Card.Header className='d-flex justify-content-between align-items-center'>
          <h5 className='text-center fs-5'>Planos de Ação</h5>
          {hasResourcePermission('action_plan', 'create') && (
            <Button variant='primary' size='sm' onClick={() => setShowCreateModal(true)}>
              <i className='bi bi-plus-lg me-1'></i>
              Novo Plano
            </Button>
          )}
        </Card.Header>
        <Card.Body className='d-flex flex-row flex-wrap justify-content-around gap-2'>
          {actionPlanFiltered.map((actionPlan) => {
            // Calcular dias para vermelho com base no nível
            const diasParaVermelho = calcularDiasParaVermelho(userLvl, actionPlan.lvl);

            // Verificar se está em estado de urgência (vermelho)
            const isUrgente = actionPlan.dias_aberto >= diasParaVermelho;

            // Verificar se está em estado de alerta (amarelo)
            const isAlerta = isCartaoEmAlerta(userLvl, actionPlan.lvl, actionPlan.dias_aberto);

            // Verificar se está em PDCA
            const isPDCA = actionPlan.conclusao === 3;

            // Definir cores com base no estado
            let headerColor, borderStyle, btnVariant;

            if (isPDCA) {
              // Cartão em estado PDCA (dourado)
              headerColor = 'bg-warning text-dark';
              borderStyle = 'border-warning border border-2';
              btnVariant = isPinned(actionPlan.recno) ? 'dark' : 'outline-dark';
            } else if (isUrgente) {
              // Cartão urgente (vermelho)
              headerColor = 'bg-danger text-light';
              borderStyle = 'border-danger border border-1';
              btnVariant = isPinned(actionPlan.recno) ? 'light' : 'outline-light';
            } else if (isAlerta) {
              // Cartão em alerta (amarelo)
              headerColor = 'bg-warning';
              borderStyle = 'border-warning border border-1';
              btnVariant = isPinned(actionPlan.recno) ? 'light' : 'outline-secondary';
            } else {
              // Cartão normal (cinza)
              headerColor = 'bg-light';
              borderStyle = 'border-secondary border border-0';
              btnVariant = 'outline-secondary';
            }

            // Adicionar uma classe personalizada para dar um tom dourado ao cartão PDCA
            const cardClass = isPDCA ? 'pdca-card' : '';

            const pinIcon = isPinned(actionPlan.recno) ? 'bi-pin-fill' : 'bi-pin-angle-fill';

            const editBtnVariant = getButtonVariant(isUrgente, isAlerta, isPDCA);
            const deleteBtnVariant = getButtonVariant(isUrgente, isAlerta, isPDCA);

            return (
              <Card
                className={`shadow ${borderStyle} mb-2 ${isPinned(actionPlan.recno) ? 'card-pinned' : ''} action-card ${cardClass}`}
                style={{
                  width: '24vw',
                  height: '670px',
                }}
                key={actionPlan.recno}
              >
                {/* Indicador visual de card pinado */}
                {isPinned(actionPlan.recno) && (
                  <div className='pin-indicator pin-indicator-pulse'>
                    <i className='bi bi-star-fill'></i>
                  </div>
                )}
                <Card.Header className={`d-flex justify-content-between align-items-center ${headerColor}`}>
                  <div className='d-flex align-items-center'>
                    <span className='fw-bold me-2'>Dias em Aberto: {actionPlan.dias_aberto}</span>
                    {isPDCA && (
                      <span className='pdca-badge ms-2'>
                        <i className='bi bi-arrow-repeat me-1'></i>PDCA
                      </span>
                    )}
                  </div>
                  <div>
                    {hasElementAccess('btn_pin_action') && (
                      <Button
                        variant={btnVariant}
                        size='sm'
                        className='me-2'
                        onClick={() => handleTogglePin(actionPlan.recno)}
                      >
                        <i className={pinIcon}></i>
                      </Button>
                    )}
                    {hasResourcePermission('action_plan', 'update') && (
                      <Button
                        variant={editBtnVariant}
                        size='sm'
                        className='me-2'
                        onClick={() => handleEditClick(actionPlan)}
                      >
                        <i className='bi bi-pencil-fill'></i>
                      </Button>
                    )}
                    {hasResourcePermission('action_plan', 'delete') && (
                      <Button
                        variant={deleteBtnVariant}
                        size='sm'
                        onClick={() => handleDeleteClick(actionPlan)}
                      >
                        <i className='bi bi-trash-fill'></i>
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Body className='overflow-auto pb-1'>
                  <Card.Text>
                    <strong>Indicador: </strong>
                    {actionPlan.indicador}
                  </Card.Text>
                  <Card.Text>
                    <strong>Prioridade: </strong>
                    {actionPlan.prioridade}
                  </Card.Text>
                  <Card.Text>
                    <strong>Impacto: </strong>
                    {actionPlan.impacto}%
                  </Card.Text>
                  <Card.Text>
                    <strong>Dias em aberto: </strong>
                    {actionPlan.dias_aberto}
                  </Card.Text>
                  <Card.Text>
                    <strong>Data de Registro: </strong>
                    {format(parseISO(actionPlan.data_registro), 'dd/MM/yyyy')}
                  </Card.Text>
                  <Card.Text>
                    <strong>Turno: </strong>
                    {getTurnoName(actionPlan.turno)}
                  </Card.Text>
                  <Card.Text>
                    <strong>Descrição: </strong>
                    {actionPlan.descricao}
                  </Card.Text>
                  <Card.Text>
                    <strong>Contenção: </strong>
                    {actionPlan.contencao}
                  </Card.Text>
                  <Card.Text>
                    <strong>Causa Raiz: </strong>
                    {actionPlan.causa_raiz}
                  </Card.Text>
                  <Card.Text>
                    <strong>Solução: </strong>
                    {actionPlan.solucao}
                  </Card.Text>
                  <Card.Text>
                    <strong>Feedback: </strong>
                    {actionPlan.feedback}
                  </Card.Text>
                  <Card.Text>
                    <strong>Responsável: </strong>
                    {actionPlan.responsavel}
                  </Card.Text>
                </Card.Body>
              </Card>
            );
          })}
        </Card.Body>
      </Card>
      {/* <pre>{JSON.stringify(actionPlanData[0], null, 2)}</pre> */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir este plano de ação?</p>
          <p>
            <strong>Indicador:</strong> {selectedActionPlan?.indicador}
          </p>
          <p>
            <strong>Descrição:</strong> {selectedActionPlan?.descricao}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant='danger' onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                ></span>
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {showEditModal && selectedActionPlan && (
        <ActionPlanFormModal
          show={showEditModal}
          onHide={handleCloseEditModal}
          actionPlan={selectedActionPlan}
          isEditing={true}
          onSubmit={handleActionPlanUpdate}
        />
      )}

      <ActionPlanFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        isEditing={false}
        onSubmit={handleCreateActionPlan}
      />

      <ToastDisplay />
    </Col>
  );
};

export default ActionPlanCards;
