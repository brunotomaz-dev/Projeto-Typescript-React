import React, { useState } from 'react';
import { Button, Form, Modal, Stack } from 'react-bootstrap';
import { useAbsenceMutation } from '../../../hooks/queries/useAbsenceMutation';
import { useFilters } from '../../../hooks/useFilters';
import { useToast } from '../../../hooks/useToast';
import { iPresence, iPresenceSectors } from '../../../interfaces/Absence.interface';
import { setPresenceModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

//cSpell: words lideranca panificacao usuario

const PresenceAddModal: React.FC = () => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  const userName = useAppSelector((state) => state.user.fullName);
  const show = useAppSelector((state) => state.supervision.presenceModal.presenceModalVisible);
  const dispatch = useAppDispatch();

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { date: inicialDate, turn: inicialTurno } = useFilters('supervision');
  const { createPresence, isSuccess, error } = useAbsenceMutation('supervision');
  const { showToast, ToastDisplay } = useToast();

  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [formData, setFormData] = useState<iPresenceSectors>({
    embalagem: 0,
    forno: 0,
    lideranca: 0,
    panificacao: 0,
    pasta: 0,
    recheio: 0,
  });

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  const handleClose = () => {
    setFormData({
      embalagem: 0,
      forno: 0,
      lideranca: 0,
      panificacao: 0,
      pasta: 0,
      recheio: 0,
    });

    dispatch(setPresenceModal({ presenceModalVisible: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: iPresence = {
      ...formData,
      data_registro: inicialDate,
      turno: inicialTurno,
      hora_registro: new Date().toLocaleTimeString(),
      usuario: userName,
    };

    // Envia os dados para a mutação de criação de presença
    createPresence(data);

    // Retorno visual em caso de sucesso ou erro
    if (isSuccess) {
      showToast('Dados salvos com sucesso!', 'success');
    } else if (error) {
      showToast(`Erro ao salvar dados: ${error.message}`, 'danger');
    }

    handleClose();
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Presença</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack gap={2} direction='horizontal'>
            <Form.Group>
              <Form.Label>Panificação</Form.Label>
              <Form.Control
                type='number'
                value={formData.panificacao}
                onChange={(e) => setFormData({ ...formData, panificacao: +e.target.value })}
                placeholder='Panificação'
                min={0}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pasta</Form.Label>
              <Form.Control
                type='number'
                value={formData.pasta}
                onChange={(e) => setFormData({ ...formData, pasta: +e.target.value })}
                placeholder='Pasta'
                min={0}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Forno</Form.Label>
              <Form.Control
                type='number'
                value={formData.forno}
                onChange={(e) => setFormData({ ...formData, forno: +e.target.value })}
                placeholder='Forno'
                min={0}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Recheio</Form.Label>
              <Form.Control
                type='number'
                value={formData.recheio}
                onChange={(e) => setFormData({ ...formData, recheio: +e.target.value })}
                placeholder='Recheio'
                min={0}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Embalagem</Form.Label>
              <Form.Control
                type='number'
                value={formData.embalagem}
                onChange={(e) => setFormData({ ...formData, embalagem: +e.target.value })}
                placeholder='Embalagem'
                min={0}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Liderança</Form.Label>
              <Form.Control
                type='number'
                value={formData.lideranca}
                onChange={(e) => setFormData({ ...formData, lideranca: +e.target.value })}
                placeholder='Liderança'
                min={0}
              />
            </Form.Group>
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant='primary' type='submit' onClick={handleSubmit}>
            Salvar Registro
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastDisplay />
    </>
  );
};

export default PresenceAddModal;
