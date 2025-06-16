import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { useAbsenceMutation } from '../../../hooks/queries/useAbsenceMutation';
import { useAbsenceQuery } from '../../../hooks/queries/useAbsenceQuery';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { iAbsence } from '../../../interfaces/Absence.interface';
import { setAbsenceModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch } from '../../../redux/store/hooks';

const AbsenceTable: React.FC = () => {
  /* -------------------------------------------- ROOK -------------------------------------------- */
  const { hasResourcePermission } = usePermissions();
  const dispatch = useAppDispatch();
  const { absenceData } = useAbsenceQuery('supervision');
  const { deleteAbsence, error, isSuccess } = useAbsenceMutation('supervision');

  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [selectedAbsence, setSelectedAbsence] = useState<iAbsence | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- HELPERS ------------------------------------------ */
  // Formatar data de retorno
  const formatReturnDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  // Verificar se o tipo requer exibição da data de retorno
  const needsReturnDate = (tipo: string) => {
    return ['Férias', 'Afastamento'].includes(tipo);
  };

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Abrir modal de confirmação
  const handleDeleteClick = (absence: iAbsence) => {
    setSelectedAbsence(absence);
    setShowConfirmModal(true);
  };

  // Fechar modal de confirmação
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedAbsence(null);
  };

  // Abrir modal de edição - Agora apenas repassa para o componente pai
  const handleEditClick = (absence: iAbsence) => {
    const editData = {
      recno: absence.recno,
      data_occ: absence.data_occ,
      turno: absence.turno,
      tipo: absence.tipo,
      nome: absence.nome,
      setor: absence.setor,
      motivo: absence.motivo,
      data_retorno: absence.data_retorno,
    };
    dispatch(
      setAbsenceModal({
        absenceModalEdit: true,
        absenceModalType: absence.tipo,
        absenceModalVisible: true,
        absenceModalData: editData,
      })
    );
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!selectedAbsence?.recno) {
      return;
    }

    setIsDeleting(true);

    deleteAbsence(selectedAbsence.recno);

    if (isSuccess) {
      // Mostrar mensagem de sucesso
      showToast?.('Registro excluído com sucesso', 'success');
    }
    // Se houver erro, exibir mensagem de erro
    if (error) {
      console.error('Erro ao excluir registro:', error);
      showToast?.('Erro ao excluir registro', 'danger');
    }
    handleCloseModal();
    setIsDeleting(false);
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Card className='border-0 bg-transparent py-2 h-100'>
      <h5 className='text-center fs-5'>Ocorrências de Absenteísmo</h5>
      <Card className='p-2 shadow border-0 h-100'>
        <table className='table table-hover table-striped table-responsive'>
          <thead>
            <tr>
              <th>Setor</th>
              <th>Nome</th>
              <th>Turno</th>
              <th>Ocorrência</th>
              <th>Data</th>
              <th>Retorno</th>
              <th>Justificativa</th>
              {(hasResourcePermission('absence', 'delete') || hasResourcePermission('absence', 'update')) && (
                <th className='text-center'>Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {absenceData.map((absence) => (
              <tr key={absence.recno}>
                <td>{absence.setor}</td>
                <td>{absence.nome}</td>
                <td>{absence.turno}</td>
                <td>{absence.tipo}</td>
                <td>{formatReturnDate(absence.data_occ)}</td>
                <td>
                  {/* Exibir data de retorno somente para tipos relevantes */}
                  {needsReturnDate(absence.tipo) ? formatReturnDate(absence.data_retorno) : ''}
                </td>
                <td>{absence.motivo}</td>
                {(hasResourcePermission('absence', 'delete') ||
                  hasResourcePermission('absence', 'update')) && (
                  <td className='text-center'>
                    <div className='d-flex justify-content-center gap-2'>
                      {hasResourcePermission('absence', 'update') && (
                        <Button
                          variant='link'
                          className='text-primary p-0'
                          size='lg'
                          onClick={() => handleEditClick(absence)}
                        >
                          <i className='bi bi-pencil-square'></i>
                        </Button>
                      )}
                      {hasResourcePermission('absence', 'delete') && (
                        <Button
                          variant='link'
                          className='text-danger p-0'
                          size='lg'
                          onClick={() => handleDeleteClick(absence)}
                        >
                          <i className='bi bi-trash-fill'></i>
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {absenceData.length === 0 && (
              <tr>
                <td
                  colSpan={
                    hasResourcePermission('absence', 'delete') || hasResourcePermission('absence', 'update')
                      ? 8
                      : 7
                  }
                  className='text-center py-3 text-muted'
                >
                  Nenhum registro encontrado para este turno.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Modal de Confirmação de Exclusão */}
        <Modal show={showConfirmModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Exclusão</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Você tem certeza que deseja excluir o registro de ausência de{' '}
              <strong>{selectedAbsence?.nome}</strong>?
            </p>
            <p className='text-muted'>Esta ação não pode ser desfeita.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleCloseModal} disabled={isDeleting}>
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
                'Confirmar Exclusão'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {ToastDisplay && <ToastDisplay />}
      </Card>
    </Card>
  );
};

export default AbsenceTable;
