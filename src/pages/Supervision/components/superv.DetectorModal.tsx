import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Button, Form, FormSelect, Modal, Stack } from 'react-bootstrap';
import { DETECTORES_ID } from '../../../helpers/constants';
import { getShift } from '../../../helpers/turn';
import { useDetectorQuery } from '../../../hooks/queries/useDetectorQuery';
import { useProductionQuery } from '../../../hooks/queries/useProductionQuery';
import { useToast } from '../../../hooks/useToast';
import { iDetectorData } from '../../../interfaces/Detector.interface';
import { setDetectorModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

const DetectorModal: React.FC = () => {
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const dispatch = useAppDispatch();
  const { detectorModalVisible } = useAppSelector((state) => state.supervision.detectorModal);

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { productionDetails } = useProductionQuery('supervision');
  const { showToast, ToastDisplay } = useToast();
  const { createData, error } = useDetectorQuery('supervision');

  /* ---------------------------------------------- Local State ---------------------------------------------- */
  const initialDate = format(new Date(), 'yyyy-MM-dd');
  const initialTime = format(new Date(), 'HH:mm');
  const turnActual = getShift();

  const formDefault: iDetectorData = {
    detector_id: 0,
    data_registro: initialDate,
    hora_registro: initialTime,
    turno: turnActual,
    peso_alto_bandejas: 0,
    peso_ok_bandejas: 0,
    peso_baixo_bandejas: 0,
    peso_alto_media: 0,
    peso_ok_media: 0,
    peso_baixo_media: 0,
    peso_alto_porcentagem: 0,
    peso_ok_porcentagem: 0,
    peso_baixo_porcentagem: 0,
    metal_detectado: 0,
    produto: '',
  };

  const [form, setForm] = useState<iDetectorData>(formDefault);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({
    produto: false,
    detector_id: false,
  });

  const productOptions = useMemo(() => {
    if (!productionDetails) return [];
    return productionDetails.map((prod) => ({
      value: prod.produto,
      label: prod.produto,
    }));
  }, [productionDetails]);

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  const handleClose = () => {
    dispatch(setDetectorModal({ detectorModalVisible: false }));
    setForm(formDefault); // Reseta o formulário ao fechar o modal
    setValidated(false); // Reseta a validação
    setErrors({ produto: false, detector_id: false }); // Reseta os erros
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumberField = name.includes('peso_') || name === 'detector_id' || name === 'metal_detectado';

    // Atualiza o formulário
    setForm((prev) => ({
      ...prev,
      [name]: isNumberField ? parseInt(value, 10) || 0 : value,
    }));

    // Limpa o erro específico se o campo for preenchido
    if (name === 'produto' && value) {
      setErrors((prev) => ({ ...prev, produto: false }));
    }
    if (name === 'detector_id' && parseInt(value, 10) > 0) {
      setErrors((prev) => ({ ...prev, detector_id: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      produto: !form.produto,
      detector_id: form.detector_id <= 0,
    };

    setErrors(newErrors);
    setValidated(true);

    // Retorna true se não houver erros
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSaveBtn = () => {
    // Valida o formulário antes de mostrar o modal de confirmação
    if (!validateForm()) {
      // Exibe mensagem para campos obrigatórios
      if (errors.produto || errors.detector_id) {
        showToast('Por favor, preencha todos os campos obrigatórios (Produto e Detector ID).', 'warning');
      }
      return;
    }

    // Se passar na validação, abre o modal de confirmação
    setShowConfirmModal(true);
  };

  const handleSave = () => {
    setShowConfirmModal(false);

    createData(form, {
      onSuccess: () => {
        showToast('Dados do detector salvos com sucesso!', 'success');
        handleClose(); // Fecha o modal após salvar
      },
      onError: () => {
        showToast(`Erro ao salvar dados do detector: ${error?.message}`, 'danger');
      },
    });
  };

  // Modal de confirmação
  const ModalConfirmSave = () => {
    return (
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
        backdrop='static'
        size='sm'
      >
        <Modal.Header closeButton className='bg-warning text-dark'>
          <Modal.Title>Confirmar Salvar</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-dark bg-warning-subtle'>
          <p>Você tem certeza que deseja salvar os dados do detector?</p>
          <ul>
            <li>Data: {format(form.data_registro, 'dd/MM/yyyy')}</li>
            <li>Produto: {form.produto}</li>
            <li>Detector ID: {form.detector_id}</li>
            <li>Turno: {form.turno}</li>
            <hr />
            <li>Peso Alto Bandejas: {form.peso_alto_bandejas} gr</li>
            <li>Peso ok Bandejas: {form.peso_ok_bandejas} gr</li>
            <li>Peso Baixo Bandejas: {form.peso_baixo_bandejas} gr</li>
            <hr />
            <li>Peso Alto Média: {form.peso_alto_media} gr</li>
            <li>Peso ok Média: {form.peso_ok_media} gr</li>
            <li>Peso Baixo Média: {form.peso_baixo_media} gr</li>
            <hr />
            <li>Peso Alto %: {form.peso_alto_porcentagem}%</li>
            <li>Peso ok %: {form.peso_ok_porcentagem}%</li>
            <li>Peso Baixo %: {form.peso_baixo_porcentagem}%</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className='bg-warning-subtle'>
          <Button variant='secondary' onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant='primary' onClick={handleSave}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Modal show={detectorModalVisible} centered backdrop='static' onHide={handleClose} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Detector de Metais</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Stack gap={3} className='mb-3' direction='horizontal'>
              <Form.Group className='mb-3'>
                <Form.Label>Data Registro</Form.Label>
                <Form.Control
                  type='date'
                  name='data_registro'
                  value={form.data_registro}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Hora Registro</Form.Label>
                <Form.Control
                  type='time'
                  name='hora_registro'
                  value={form.hora_registro}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>
                  Produto<span className='text-danger'>*</span>
                </Form.Label>
                <Form.Select
                  name='produto'
                  value={form.produto}
                  onChange={handleChange}
                  isInvalid={validated && errors.produto}
                  required
                >
                  <option value=''>Selecione o Produto</option>
                  {productOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type='invalid'>Por favor, selecione um produto.</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>
                  Detector ID<span className='text-danger'>*</span>
                </Form.Label>
                <FormSelect
                  name='detector_id'
                  value={form.detector_id}
                  onChange={handleChange}
                  isInvalid={validated && errors.detector_id}
                  required
                >
                  <option value={''}>Selecione o Detector</option>
                  {DETECTORES_ID.map((detector) => (
                    <option key={detector.id} value={detector.id}>
                      {detector.name}
                    </option>
                  ))}
                </FormSelect>
                <Form.Control.Feedback type='invalid'>
                  Por favor, selecione um detector.
                </Form.Control.Feedback>
              </Form.Group>
            </Stack>

            <Form.Group className='mb-3 w-25'>
              <Form.Label>Turno</Form.Label>
              <Form.Select name='turno' value={form.turno} onChange={handleChange}>
                <option value='MAT'>Matutino</option>
                <option value='VES'>Vespertino</option>
                <option value='NOT'>Noturno</option>
              </Form.Select>
            </Form.Group>

            {/* Campos de peso */}
            {['alto', 'ok', 'baixo'].map((status) => (
              <React.Fragment key={status}>
                <h6>{`Peso ${status.charAt(0).toUpperCase() + status.slice(1)}`}</h6>
                <Stack gap={3} className='mb-3' direction='horizontal'>
                  {['bandejas', 'media', 'porcentagem'].map((type) => (
                    <Form.Group className='mb-3' key={`${status}-${type}`}>
                      <Form.Label>{`Peso ${status} ${type}`}</Form.Label>
                      <Form.Control
                        type='number'
                        name={`peso_${status}_${type}`}
                        value={(form as any)[`peso_${status}_${type}`]}
                        onChange={handleChange}
                        placeholder={`Peso ${status} ${type}`}
                      />
                    </Form.Group>
                  ))}
                </Stack>
              </React.Fragment>
            ))}

            <Form.Group className='mb-3 col-md-2'>
              <Form.Label>Metal Detectado</Form.Label>
              <Form.Control
                type='number'
                name='metal_detectado'
                value={form.metal_detectado}
                onChange={handleChange}
                placeholder='Quantidade de metal detectado'
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Fechar
          </Button>
          <Button variant='primary' onClick={handleSaveBtn}>
            Salvar
          </Button>
        </Modal.Footer>
        <ModalConfirmSave />
      </Modal>
      <ToastDisplay />
    </>
  );
};

export default DetectorModal;
