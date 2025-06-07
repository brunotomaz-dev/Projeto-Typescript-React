import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Alert, Button, Card, Modal, Table } from 'react-bootstrap';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { useUpdateStops } from '../../../hooks/useUpdateStops';
import { openCreateModal, openEditModal } from '../../../redux/store/features/liveLinesSlice';
import { useAppDispatch } from '../../../redux/store/hooks';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';
import CreateStopModal from './ModalCreate';
import EditStopModal from './ModalUpdate';

const UpdateStops: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const dispatch = useAppDispatch();

  // Usar os hooks especializados
  const { maquinaIHM, isToday, deleteStop, isDeleting: isDeletingMutation, hasData } = useUpdateStops();

  const { showToast, ToastDisplay } = useToast();
  const { hasResourcePermission } = usePermissions();

  const canEdit = hasResourcePermission('ihm_appointments', 'update');
  const canDelete = hasResourcePermission('ihm_appointments', 'delete');
  const canCreate = hasResourcePermission('ihm_appointments', 'create');

  /* ----------------------------------------------------------------------------- Local State ---- */
  // Estado apenas para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<number | null>(null);

  /* ------------------------------------------------------------------------------ Functions ---- */
  const handleEdit = (stop: iMaquinaIHM) => {
    if (!canEdit) {
      showToast('Você não tem permissão para editar registros', 'warning');
      return;
    }

    // Usar a action do Redux para abrir o modal e passar os dados
    dispatch(openEditModal(stop));
  };

  const handleCreateClick = () => {
    if (!canCreate) {
      showToast('Você não tem permissão para criar registros', 'warning');
      return;
    }

    // Usar a action do Redux para abrir o modal
    dispatch(openCreateModal());
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

      <EditStopModal />

      <CreateStopModal />

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
