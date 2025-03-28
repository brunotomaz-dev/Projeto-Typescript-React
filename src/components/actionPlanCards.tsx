// #cSpell: words descricao contencao solucao responsavel pontuacao superv

import { differenceInDays, format, parseISO, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal } from 'react-bootstrap';
import { deleteActionPlan, getActionPlan } from '../api/apiRequests';
import { ActionPlanStatus, getTurnoName, TurnoID } from '../helpers/constants';
import { usePermissions } from '../hooks/usePermissions';
import { usePinnedCards } from '../hooks/usePinnedCards';
import { useToast } from '../hooks/useToast';
import { iActionPlan, iActionPlanCards } from '../interfaces/ActionPlan.interface';
import ActionPlanFormModal from './actionPlanFormModal';

interface iActionPlanTableProps {
  status: ActionPlanStatus;
  shift: TurnoID;
  onDataChange: (actionPlan: iActionPlanCards[]) => void;
}

const ActionPlanCards: React.FC<iActionPlanTableProps> = ({
  status,
  shift,
  onDataChange,
}) => {
  /* --------------------------------------------- ROOK -------------------------------------------- */
  const { hasActionPlanPermission, userLvl, hasMinLevel } = usePermissions();
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
        dias_aberto: calcularDiasEmAberto(item.data_registro),
      }));

      onDataChange(adjustedData);

      const sortedData = sortActionPlans(
        adjustedData.filter(
          (item: iActionPlanCards) => item.turno === shift && item.lvl <= userLvl
        )
      );
      setActionPlanFiltered(sortedData);
    });
  }, [dayStartString, shift]);

  /* ------------------------------------------- FUNÇÕES ------------------------------------------ */
  const sortActionPlans = (planos: iActionPlanCards[]): iActionPlanCards[] => {
    return [...planos].sort((a, b) => {
      // Definir pesos para cada fator
      const PESO_PRIORIDADE = 5; // Peso da prioridade na pontuação final
      const PESO_DIAS = 1; // Peso dos dias em aberto na pontuação final

      // Calcular pontuação de cada plano (prioridade * peso + dias * peso)
      const pontuacaoA = a.prioridade * PESO_PRIORIDADE + a.dias_aberto * PESO_DIAS;
      const pontuacaoB = b.prioridade * PESO_PRIORIDADE + b.dias_aberto * PESO_DIAS;

      // Ordenar por pontuação (maior primeiro)
      if (pontuacaoA !== pontuacaoB) {
        return pontuacaoB - pontuacaoA;
      }

      // Em caso de empate na pontuação, ordenar pelo mais antigo primeiro
      const dateA = new Date(a.data_registro).getTime();
      const dateB = new Date(b.data_registro).getTime();
      return dateA - dateB;
    });
  };

  const calcularDiasEmAberto = (dataRegistro: Date | string) => {
    const dataInicial =
      dataRegistro instanceof Date ? dataRegistro : parseISO(dataRegistro);

    const hoje = startOfDay(new Date());
    const dias = differenceInDays(hoje, dataInicial);

    return dias >= 0 ? dias : 0; // Evita números negativos
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
    if (!selectedActionPlan || !hasActionPlanPermission('delete')) return;

    try {
      setIsDeleting(true);
      await deleteActionPlan(selectedActionPlan.recno);

      // Atualizar a lista sem o item excluído
      const updatedList = actionPlanFiltered.filter(
        (item) => item.recno !== selectedActionPlan.recno
      );

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

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Col>
      <Card className='bg-transparent border-0 shadow mb-3 pt-2 px-2'>
        <Card.Header className='d-flex justify-content-between align-items-center'>
          <h5 className='text-center fs-5'>Planos de Ação</h5>
          {hasActionPlanPermission('create') && (
            <Button variant='primary' size='sm' onClick={() => setShowCreateModal(true)}>
              <i className='bi bi-plus-lg me-1'></i>
              Novo Plano
            </Button>
          )}
        </Card.Header>
        <Card.Body className='d-flex flex-row flex-wrap justify-content-around gap-2'>
          {actionPlanFiltered.map((actionPlan) => {
            const headerColor =
              actionPlan.dias_aberto > 2
                ? 'bg-danger text-light'
                : actionPlan.dias_aberto > 1
                  ? 'bg-warning'
                  : 'bg-light';
            const borderStyle =
              actionPlan.dias_aberto > 2
                ? 'border-danger border border-1'
                : actionPlan.dias_aberto > 1
                  ? 'border-warning border border-1'
                  : 'border-0';
            const btnVariant =
              isPinned(actionPlan.recno) && actionPlan.dias_aberto > 2
                ? 'light'
                : isPinned(actionPlan.recno)
                  ? 'secondary'
                  : actionPlan.dias_aberto > 2
                    ? 'outline-light'
                    : 'outline-secondary';
            const pinIcon = isPinned(actionPlan.recno)
              ? 'bi-pin-fill'
              : 'bi-pin-angle-fill';

            return (
              <Card
                className={`shadow ${borderStyle} mb-2 ${isPinned(actionPlan.recno) ? 'card-pinned' : ''} action-card`}
                style={{ width: '24vw', height: '670px' }}
                key={actionPlan.recno}
              >
                {/* Indicador visual de card pinado */}
                {isPinned(actionPlan.recno) && (
                  <div className='pin-indicator pin-indicator-pulse'>
                    <i className='bi bi-star-fill'></i>
                  </div>
                )}
                <Card.Header
                  className={`d-flex justify-content-between align-items-center ${headerColor}`}
                >
                  <span className='fw-bold'>
                    Dias em Aberto: {actionPlan.dias_aberto}
                  </span>
                  <div>
                    {hasMinLevel(3) && (
                      <Button
                        variant={btnVariant}
                        size='sm'
                        className='me-2'
                        onClick={() => handleTogglePin(actionPlan.recno)}
                      >
                        <i className={pinIcon}></i>
                      </Button>
                    )}
                    {hasActionPlanPermission('update') && (
                      <Button
                        variant={`${actionPlan.dias_aberto > 2 ? 'outline-light' : 'outline-secondary'}`}
                        size='sm'
                        className='me-2'
                        onClick={() => handleEditClick(actionPlan)}
                      >
                        <i className='bi bi-pencil-fill'></i>
                      </Button>
                    )}
                    {hasActionPlanPermission('delete') && (
                      <Button
                        variant={`${actionPlan.dias_aberto > 2 ? 'outline-light' : 'outline-secondary'}`}
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
          <Button
            variant='secondary'
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
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
