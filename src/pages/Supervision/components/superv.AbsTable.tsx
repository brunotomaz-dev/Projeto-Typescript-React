import React, { useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { deleteAbsenceData } from '../../../api/apiRequests';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { iAbsence } from '../../../interfaces/Absence.interface';

interface iAbsenceTableProps {
  absenceData: iAbsence[];
  onDataChange: () => void;
}

const AbsenceTable: React.FC<iAbsenceTableProps> = ({ absenceData, onDataChange }) => {
  /* -------------------------------------------- ROOK -------------------------------------------- */
  const { hasResourcePermission } = usePermissions();

  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [selectedAbsence, setSelectedAbsence] = useState<iAbsence | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- EFFECTS ------------------------------------------ */

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

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!selectedAbsence?.recno) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAbsenceData(selectedAbsence.recno);

      // Atualiza estado local removendo o item
      onDataChange();

      // Mostrar mensagem de sucesso
      showToast?.('Registro excluído com sucesso', 'success');

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      showToast?.('Erro ao excluir registro', 'danger');
    } finally {
      setIsDeleting(false);
    }
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
              <th>Justificativa</th>
              {hasResourcePermission('absence', 'delete') && (
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
                <td>{absence.motivo}</td>
                {hasResourcePermission('absence', 'delete') && (
                  <td className='text-center'>
                    <Button
                      variant='link'
                      className='text-danger p-0'
                      size='lg'
                      onClick={() => handleDeleteClick(absence)}
                    >
                      <i className='bi bi-trash-fill'></i> {/* Bootstrap icon */}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {absenceData.length === 0 && (
              <tr>
                <td colSpan={6} className='text-center py-3 text-muted'>
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
