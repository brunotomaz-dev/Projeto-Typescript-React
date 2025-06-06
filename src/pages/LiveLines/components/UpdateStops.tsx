import { useQueryClient } from '@tanstack/react-query'; // Importar useQueryClient
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Alert, Button, Card, Modal, Table } from 'react-bootstrap';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { useUpdateStops } from '../../../hooks/useUpdateStops';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';
import CreateStopModal from './ModalCreate';
import EditStopModal from './ModalUpdate';

const UpdateStops: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Acessar o queryClient para invalidar queries
  const queryClient = useQueryClient();

  // Usar o hook especializado
  const {
    maquinaIHM,
    loading,
    error,
    isToday,
    deleteStop,
    isDeleting: isDeletingMutation,
    selectedLine,
    selectedMachine,
    selectedDate,
    selectedShift,
    hasData,
  } = useUpdateStops();

  const { showToast, ToastDisplay } = useToast();

  const { hasResourcePermission } = usePermissions();
  const canEdit = hasResourcePermission('ihm_appointments', 'update');
  const canDelete = hasResourcePermission('ihm_appointments', 'delete');
  const canCreate = hasResourcePermission('ihm_appointments', 'create');
  /* ----------------------------------------------------------------------------- Local State ---- */
  const [selectedStop, setSelectedStop] = useState<iMaquinaIHM | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<number | null>(null);

  /* ------------------------------------------------------------------------------ Functions ---- */
  const handleEdit = (stop: iMaquinaIHM) => {
    if (!canEdit) {
      showToast('Você não tem permissão para editar registros', 'warning');
      return;
    }

    setSelectedStop(stop);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedStop(null);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleSaveChanges = () => {
    // Invalidar a query para recarregar os dados
    queryClient.invalidateQueries({
      queryKey: ['maquinaIHM', selectedDate, selectedShift, selectedLine, selectedMachine],
    });
    showToast('Registro atualizado com sucesso', 'success');
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      showToast('Você não tem permissão para criar registros', 'warning');
      return;
    }

    setShowCreateModal(true);
  };

  const handleCreateSave = () => {
    // Invalidar a query para recarregar os dados
    queryClient.invalidateQueries({
      queryKey: ['maquinaIHM', selectedDate, selectedShift, selectedLine, selectedMachine],
    });
    setShowCreateModal(false);
    showToast('Apontamento registrado com sucesso', 'success');
  };

  // Método para abrir o modal de confirmação
  const handleDeleteClick = (id: number) => {
    if (!canDelete) {
      showToast('Você não tem permissão para excluir registros', 'warning');
      return;
    }

    setStopToDelete(id);
    setShowDeleteModal(true);
  };

  // Método para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!stopToDelete || !canDelete) return;

    // Usar a função deleteStop do hook
    deleteStop(stopToDelete, {
      onSuccess: () => {
        showToast('Registro excluído com sucesso', 'success');
        setShowDeleteModal(false);
        setStopToDelete(null);
      },
      onError: () => {
        showToast('Erro ao excluir registro', 'danger');
      },
    });
  };

  // Método para cancelar a exclusão
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStopToDelete(null);
  };

  // Indicador de carregamento
  if (loading) {
    return (
      <div className='d-flex justify-content-center my-5'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  // Mensagem de erro
  if (error) {
    return (
      <Alert variant='danger' className='text-center w-75 mx-auto'>
        <i className='bi bi-exclamation-triangle-fill me-2'></i>
        <strong>Erro!</strong> {error}
      </Alert>
    );
  }

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {hasData ? (
        <Card className='p-2'>
          <Card.Title className='text-center my-3 d-flex justify-content-around align-items-center'>
            <div className='flex-grow-1 text-center'>Apontamentos de Paradas</div>
            {canCreate && isToday && (
              <Button
                variant='primary'
                size='sm'
                className='me-2'
                onClick={handleCreateClick}
                title='Adicionar novo apontamento'
              >
                <i className='bi bi-plus-lg me-1'></i>
                Adicionar
              </Button>
            )}
          </Card.Title>
          <Table striped hover size='sm' className='table-sm'>
            <thead>
              <tr>
                <th>Data</th>
                <th>Linha</th>
                <th>Máquina</th>
                <th>Motivo</th>
                <th>Equipamento</th>
                <th>Problema</th>
                <th>Causa</th>
                <th>Hora de Registro</th>
                {(canEdit || canDelete) && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {maquinaIHM.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>
                      {format(parseISO(item.data_registro), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </td>
                    <td>{item.linha}</td>
                    <td>{item.maquina_id}</td>
                    <td>{item.motivo}</td>
                    <td>{item.equipamento || '-'}</td>
                    <td>{item.problema}</td>
                    <td>{item.causa}</td>
                    <td>{item.hora_registro}</td>
                    {(canEdit || canDelete) && (
                      <td>
                        {canEdit && (
                          <Button
                            variant='outline-primary'
                            size='sm'
                            onClick={() => handleEdit(item)}
                            title='Editar registro'
                          >
                            <i className='bi bi-pencil-fill'></i>
                          </Button>
                        )}
                        {canDelete && isToday && (
                          <Button
                            variant='outline-danger'
                            size='sm'
                            className={canEdit ? 'ms-2' : ''}
                            onClick={() => handleDeleteClick(item.recno)}
                            title='Excluir registro'
                          >
                            <i className='bi bi-trash'></i>
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Alert variant='warning' className='text-center w-75 mx-auto'>
          <i className='bi bi-exclamation-triangle-fill me-2'></i>
          <strong>Atenção!</strong>
          <br />
          Nenhum apontamento encontrado para o turno e linha selecionados.
          <br />
          {isToday ? (
            <>
              Verifique se o turno e linha estão corretos ou se há apontamentos registrados.
              {canCreate && (
                <div className='mt-3'>
                  <Button variant='primary' size='sm' onClick={handleCreateClick}>
                    <i className='bi bi-plus-lg me-1'></i>
                    Adicionar apontamento
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>Não existem dados históricos para este dia, turno e linha.</>
          )}
        </Alert>
      )}

      {/* Modal de edição */}
      <EditStopModal
        show={showEditModal}
        onHide={handleCloseModal}
        stopData={selectedStop}
        onSave={handleSaveChanges}
      />

      {/* Modal de criação */}
      <CreateStopModal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        selectedLine={selectedLine}
        selectedMachine={selectedMachine || ''}
        selectedDate={selectedDate}
        onSave={handleCreateSave}
      />

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={handleCancelDelete} centered backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir este registro?</p>

          {stopToDelete && maquinaIHM.find((item) => item.recno === stopToDelete) && (
            <div className='mt-3 p-3 bg-light rounded border'>
              <p className='mb-2'>
                <strong>Motivo:</strong> {maquinaIHM.find((item) => item.recno === stopToDelete)?.motivo}
              </p>
              <p className='mb-2'>
                <strong>Data:</strong>{' '}
                {format(
                  parseISO(maquinaIHM.find((item) => item.recno === stopToDelete)?.data_registro || ''),
                  'dd/MM/yyyy',
                  { locale: ptBR }
                )}
              </p>
              <p className='mb-0'>
                <strong>Horário:</strong>{' '}
                {maquinaIHM.find((item) => item.recno === stopToDelete)?.hora_registro}
              </p>
            </div>
          )}

          <p className='mt-3 text-danger fw-bold'>Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCancelDelete} disabled={isDeletingMutation}>
            Cancelar
          </Button>
          <Button variant='danger' onClick={handleConfirmDelete} disabled={isDeletingMutation}>
            {isDeletingMutation ? (
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

      {/* Toast para mensagens */}
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default UpdateStops;
