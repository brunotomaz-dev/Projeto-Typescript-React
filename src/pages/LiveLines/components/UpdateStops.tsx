import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Modal, Table } from 'react-bootstrap';
import { deleteMaquinaIHM, getInfoIHM, getMaquinaIHM } from '../../../api/apiRequests';
import { getShiftByTime } from '../../../helpers/turn';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { iInfoIHM } from '../../../interfaces/InfoIHM.interface';
import { useAppSelector } from '../../../redux/store/hooks';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';
import CreateStopModal from './ModalCreate';
import EditStopModal from './ModalUpdate';

interface iUpdateStopsProps {
  nowDate: string;
  onUpdate: () => void;
}

const UpdateStops: React.FC<iUpdateStopsProps> = ({ nowDate, onUpdate }) => {
  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  const selectedDate = useAppSelector((state) => state.liveLines.selectedDate);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);
  const selectedShift = useAppSelector((state) => state.liveLines.selectedShift);

  /* ----------------------------------------- Constantes ----------------------------------------- */
  const isToday = nowDate === selectedDate; // Verifica se a data selecionada é hoje

  /* ----------------------------------------------------------------------------- Local State ---- */
  const [maquinaIHM, setMaquinaIHM] = useState<iMaquinaIHM[]>([]);
  const [selectedStop, setSelectedStop] = useState<iMaquinaIHM | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stopToDelete, setStopToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast, ToastDisplay } = useToast();

  /* ----------------------------------------------------------------------------- Permissions ---- */
  const { hasResourcePermission } = usePermissions();
  const canEdit = hasResourcePermission('ihm_appointments', 'update');
  const canDelete = hasResourcePermission('ihm_appointments', 'delete');
  const canCreate = hasResourcePermission('ihm_appointments', 'create');

  /* --------------------------------------------------------------------------------- Effects ---- */
  useEffect(() => {
    // Apaga os dados do estado
    setMaquinaIHM([]);

    fetchData();
  }, [selectedDate, selectedLine, selectedShift, isToday]);

  /* ------------------------------------------------------------------------------ Functions ---- */
  const fetchData = () => {
    // Para o dia atual, continuar usando getMaquinaIHM
    if (isToday) {
      void getMaquinaIHM({ data: selectedDate, linha: selectedLine })
        .then((res: iMaquinaIHM[]) => {
          // Verificar o turno do registro
          res = res.filter((item) => {
            const shift = getShiftByTime(item.hora_registro);
            return shift === selectedShift;
          });
          setMaquinaIHM(res);
        })
        .catch((err) => {
          console.error('err', err);
          showToast('Erro ao carregar dados', 'danger');
        });
    }
    // Para dias anteriores, usar getInfoIHM
    else {
      void getInfoIHM({
        data: selectedDate,
        linha: selectedLine,
        turno: selectedShift,
      })
        .then((res: iInfoIHM[]) => {
          // Converter dados de InfoIHM para o formato MaquinaIHM
          const convertedData = res
            .filter((item) => item.status !== 'rodando')
            .map(
              (item) =>
                ({
                  recno: item.recno,
                  data_registro: item.data_registro,
                  hora_registro: item.hora_registro,
                  fabrica: item.fabrica,
                  linha: item.linha,
                  maquina_id: item.maquina_id,
                  equipamento: item.equipamento,
                  motivo: item.motivo,
                  problema: item.problema,
                  causa: item.causa,
                  afeta_eff: item.afeta_eff,
                  operador_id: item.operador_id,
                  os_numero: item.os_numero,
                  s_backup: null,
                  // Incluir dados adicionais que podem ser necessários
                  _isHistorical: true, // Propriedade para identificar registros históricos
                }) as iMaquinaIHM & { _isHistorical: boolean }
            );

          setMaquinaIHM(convertedData);
        })
        .catch((err) => {
          console.error('err', err);
          showToast('Erro ao carregar dados históricos', 'danger');
        });
    }
  };

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
    fetchData(); // Recarregar dados após salvar
    onUpdate();
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
    fetchData(); // Recarregar dados após salvar
    setShowCreateModal(false);
    showToast('Apontamento registrado com sucesso', 'success');
  };

  // Novo método para abrir o modal de confirmação
  const handleDeleteClick = (id: number) => {
    if (!canDelete) {
      showToast('Você não tem permissão para excluir registros', 'warning');
      return;
    }

    setStopToDelete(id);
    setShowDeleteModal(true);
  };

  // Método para confirmar a exclusão
  const handleConfirmDelete = () => {
    if (!stopToDelete || !canDelete) return;

    setIsDeleting(true);

    deleteMaquinaIHM(stopToDelete)
      .then(() => {
        fetchData(); // Recarregar dados após deletar
        showToast('Registro excluído com sucesso', 'success');
      })
      .catch((err) => {
        console.error('err', err);
        showToast('Erro ao excluir registro', 'danger');
      })
      .finally(() => {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setStopToDelete(null);
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
      {maquinaIHM.length > 0 ? (
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
          <Button variant='secondary' onClick={handleCancelDelete} disabled={isDeleting}>
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

      {/* Toast para mensagens */}
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default UpdateStops;
