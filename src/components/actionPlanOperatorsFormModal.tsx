import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, Form, FormGroup, Modal, ModalFooter, Row } from 'react-bootstrap';
import { apontamentosHierarquia } from '../helpers/apontamentosHierarquia';
import { useActionPlanOperators } from '../hooks/queries/useActionPlanOperators';
import { useActionPlanModal } from '../hooks/useActionPlanModal';
import { useFilters } from '../hooks/useFilters';
import { useToast } from '../hooks/useToast';
import { iActionPlanFormData } from '../interfaces/ActionPlan.interface';
import { useAppSelector } from '../redux/store/hooks';

const ActionPlanOperatorsFormModal: React.FC = () => {
  const SCOPE = 'operators';
  const MAX_DESCRIPTION_LENGTH = 512;
  const MAX_LENGTH = 256;
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const { functionalLevel: userLevel, sectors } = useAppSelector((state) => state.user);
  const normalizedUserLevel = userLevel < 1 ? 0 : userLevel;

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { showToast, ToastDisplay } = useToast();
  const { isOpen, closeModal, editData, preFilledData } = useActionPlanModal(SCOPE);
  const { turn, date, selectedLines } = useFilters(SCOPE);
  const { createActionPlan, updateActionPlan, isCreating, isUpdating } = useActionPlanOperators();

  const isLoading = isCreating || isUpdating;

  /* ---------------------------------------------- Local State ---------------------------------------------- */
  const emptyFormData: Omit<iActionPlanFormData, 'recno'> = {
    indicador: 'D',
    prioridade: 1,
    impacto: 0,
    data_registro: new Date(parseISO(date)),
    turno: turn,
    descricao: '',
    causa_raiz: '',
    contencao: '',
    solucao: '',
    feedback: '',
    responsavel: '',
    data_conclusao: null,
    conclusao: 0,
    lvl: normalizedUserLevel,
    prazo: null,
  };

  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<Omit<iActionPlanFormData, 'recno'>>(emptyFormData);
  const [obs, setObs] = useState<string>('');

  const OBSERVATION_LENGTH_LIMIT = MAX_DESCRIPTION_LENGTH - formData.descricao.length;

  // Estados locais para os selects
  const [selectedCause, setSelectedCause] = useState<string>('');
  const [availableCauses, setAvailableCauses] = useState<string[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [availableProblems, setAvailableProblems] = useState<string[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [availableEquipments, setAvailableEquipments] = useState<string[]>([]);

  // Função para verificar se a descrição tem formato completo e extrair observações
  const parseDescription = (description: string) => {
    const parts = description.split(' - ');
    const hasCompleteFormat = parts.length >= 6; // Linha, Setor, Equipamento, Motivo, Problema, Causa (+ Observações opcional)

    let observations = '';
    if (hasCompleteFormat) {
      // Procurar por "Observações:" na string
      const obsIndex = description.indexOf('Observações:');
      if (obsIndex !== -1) {
        observations = description.substring(obsIndex + 'Observações:'.length).trim();
      }
    }

    return { hasCompleteFormat, observations };
  };

  /* ------------------------------------------------ Effects ------------------------------------------------ */
  // Efeito para inicializar o formaulário em caso de edição ou autocomplete
  useEffect(() => {
    if (editData) {
      // Modo de Edição
      const { hasCompleteFormat, observations } = parseDescription(editData.descricao);

      setFormData({
        ...editData,
        data_registro: new Date(editData.data_registro),
        data_conclusao: editData.data_conclusao ? new Date(editData.data_conclusao) : null,
      });

      // Se a descrição tem formato completo, extrair observações
      if (hasCompleteFormat && observations) {
        setObs(observations);
      }
    } else {
      // Pré Preenchimento do formulário
      setFormData({
        ...emptyFormData,
        ...preFilledData,
      });
    }
  }, [editData, preFilledData, isOpen]);

  //Effects para controlar e popular os selects
  useEffect(() => {
    if (preFilledData) return;

    // Popular equipamento de acordo com o Motivo
    if (selectedMotive) {
      const equipment = Object.keys(apontamentosHierarquia[selectedMotive] || {});
      setAvailableEquipments(equipment);
    } else {
      setAvailableEquipments([]);
      setSelectedEquipment('');
    }
  }, [selectedMotive]);

  useEffect(() => {
    if (preFilledData) return;

    // Popular problemas de acordo com o equipamento selecionado
    if (selectedEquipment && selectedMotive) {
      const problems = Object.keys(apontamentosHierarquia[selectedMotive]?.[selectedEquipment] || {});
      setAvailableProblems(problems);
    } else {
      setAvailableProblems([]);
      setSelectedProblem('');
    }
  }, [selectedEquipment]);

  useEffect(() => {
    if (preFilledData) return;

    // Popular causas de acordo com o problema selecionado
    if (selectedProblem && selectedMotive && selectedEquipment) {
      const causes = apontamentosHierarquia[selectedMotive]?.[selectedEquipment]?.[selectedProblem] || [];
      setAvailableCauses(causes);
    } else {
      setAvailableCauses([]);
      setSelectedCause('');
    }
  }, [selectedProblem, selectedMotive, selectedEquipment]);

  // Efeito para preencher descrição com base nos selects
  useEffect(() => {
    if (preFilledData) return;

    let descricao = `Linha ${selectedLines[0]} - ${sectors[0]}`;

    if (selectedEquipment) {
      descricao += ` - ${selectedEquipment}`;
    }

    if (selectedMotive) {
      descricao += ` - ${selectedMotive}`;
    }

    if (selectedProblem) {
      descricao += ` - ${selectedProblem}`;
    }

    if (selectedCause) {
      descricao += ` - ${selectedCause}`;
    }

    setFormData((prev) => ({
      ...prev,
      descricao,
    }));
  }, [selectedMotive, selectedEquipment, selectedProblem, selectedCause, preFilledData]);

  // Determinar se os selects devem ser obrigatórios
  const isEditWithCompleteDescription = editData && parseDescription(editData.descricao).hasCompleteFormat;
  const motivoRequired = !isEditWithCompleteDescription;

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  // Fechar modal
  const handleHide = () => {
    setValidated(false);
    setObs('');
    setSelectedCause('');
    setSelectedProblem('');
    setSelectedEquipment('');
    setSelectedMotive('');
    closeModal();
  };

  // Cancelar edição
  const handleCancel = () => {
    handleHide();
  };

  // Lida com o envio do formulário
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Lógica para lidar com a validação do formulário
    const formElement = event.currentTarget;
    if (formElement.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      // Ajustar o formato da data de registro e adicionar observações
      let finalDescription = formData.descricao;

      // Se não for edição com descrição completa, adicionar observações
      if (!isEditWithCompleteDescription) {
        finalDescription = `${formData.descricao} - Observações: ${obs}`;
      } else {
        // Se for edição com descrição completa, reconstruir com novas observações
        const baseDescription = formData.descricao.split(' - Observações:')[0];
        finalDescription = `${baseDescription} - Observações: ${obs}`;
      }

      const adjustedData = {
        ...formData,
        data_registro: format(formData.data_registro, 'yyyy-MM-dd'),
        data_conclusao: formData?.data_conclusao ? format(formData.data_conclusao, 'yyyy-MM-dd') : null,
        descricao: finalDescription,
      };

      if (editData) {
        // Atualizar plano de ação existente
        updateActionPlan({ ...adjustedData, recno: editData.recno });
        showToast('Plano de ação atualizado com sucesso!', 'success');
      } else {
        // Criar novo plano de ação
        createActionPlan(adjustedData);
        showToast('Plano de ação criado com sucesso!', 'success');
      }

      // Fechar o modal após salvar
      handleHide();
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      showToast('Erro ao salvar plano de ação. Tente novamente.', 'danger');
      return;
    }

    handleHide();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Tratamento especial para o campo numérico (converter para número)
    if (name === 'impacto' || name === 'prioridade') {
      const numValue = parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handler para alteração do status (conclusão)
  const handleConclusaoChange = (novoStatus: number) => {
    // Se o status atual já é o mesmo que o clicado, volte para "Em Andamento" (0)
    // exceto se já for "Em Andamento", nesse caso mantém
    const statusFinal = formData.conclusao === novoStatus && novoStatus !== 0 ? 0 : novoStatus;

    // Define a data de conclusão quando o status for 1 ou 2, ou limpa quando for 0
    const novaDataConclusao = statusFinal > 0 && statusFinal !== 3 ? new Date() : null;

    // Se estamos saindo de PDCA (3) para qualquer outro status, limpa o prazo PDCA
    const novoPrazo = formData.conclusao === 3 && statusFinal !== 3 ? null : formData.prazo;

    setFormData({
      ...formData,
      conclusao: statusFinal,
      data_conclusao: novaDataConclusao,
      prazo: novoPrazo, // Atualiza o prazo conforme a lógica acima
    });
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Modal show={isOpen} onHide={handleHide} size='lg' centered>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? 'Editar' : 'Criar'} Plano de Ação</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className='mb-3'>
              <Form.Group controlId='turnoForm' className='col-md-3'>
                <Form.Label>Turno</Form.Label>
                <Form.Select
                  id='turnoSelect'
                  value={formData.turno}
                  name='turno'
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value='MAT'>Matutino</option>
                  <option value='VES'>Vespertino</option>
                  <option value='NOT'>Noturno</option>
                </Form.Select>
              </Form.Group>
              <FormGroup controlId='dataRegistro' className='col-md-3'>
                <Form.Label>Data da Ocorrência</Form.Label>
                <Form.Control
                  type='date'
                  name='data_registro'
                  value={format(formData.data_registro, 'yyyy-MM-dd')}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </FormGroup>
              <Form.Group controlId='prioridadeForm' className='col-md-3'>
                <Form.Label>Prioridade</Form.Label>
                <Form.Select
                  name='prioridade'
                  value={formData.prioridade || 1}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value={1}>Baixa</option>
                  <option value={2}>Média</option>
                  <option value={3}>Alta</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId='impactoForm' className='col-md-3'>
                <Form.Label>Impacto (%)</Form.Label>
                <Form.Control
                  type='number'
                  name='impacto'
                  value={formData.impacto || 0}
                  onChange={handleInputChange}
                  min='0'
                  max='100'
                  required
                  disabled={isLoading}
                />
              </Form.Group>
            </Row>
            <Row className='mb-3'>
              <Form.Group controlId='IndicadorForm' className='col-md-3'>
                <Form.Label>Indicador</Form.Label>
                <Form.Select
                  name='indicador'
                  value={formData.indicador || 'Q'}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                >
                  <option value='S'>S - Segurança</option>
                  <option value='Q'>Q - Qualidade</option>
                  <option value='D'>D - Desempenho</option>
                  <option value='C'>C - Custo</option>
                </Form.Select>
              </Form.Group>
              {editData && (
                <Form.Group controlId='statusForm' className='col-md-9'>
                  <Form.Label>Status</Form.Label>
                  <div className='d-flex gap-2'>
                    <Button
                      variant={formData.conclusao === 0 ? 'primary' : 'outline-primary'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(0)}
                      type='button'
                      disabled={isLoading}
                    >
                      <i className='bi bi-hourglass-split'></i>
                      Em Andamento
                    </Button>
                    <Button
                      variant={formData.conclusao === 3 ? 'warning' : 'outline-warning'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(3)}
                      type='button'
                      disabled={isLoading}
                    >
                      <i className='bi bi-pause-circle-fill'></i>
                      PDCA
                    </Button>
                    <Button
                      variant={formData.conclusao === 1 ? 'success' : 'outline-success'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(1)}
                      type='button'
                      disabled={isLoading}
                    >
                      <i className='bi bi-check-circle-fill'></i>
                      Concluído
                    </Button>
                    <Button
                      variant={formData.conclusao === 2 ? 'danger' : 'outline-danger'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(2)}
                      type='button'
                      disabled={isLoading}
                    >
                      <i className='bi bi-x-circle-fill'></i>
                      Cancelado
                    </Button>
                  </div>
                </Form.Group>
              )}
            </Row>
            {formData.conclusao === 3 && (
              <Row className='mb-3 d-flex justify-content-center'>
                <Form.Group className='col-md-3'>
                  <Form.Label>Prazo PDCA</Form.Label>
                  <Form.Control
                    type='date'
                    name='prazo'
                    value={formData.prazo || ''}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type='invalid'>Informe o prazo do plano PDCA.</Form.Control.Feedback>
                </Form.Group>
              </Row>
            )}
            {!preFilledData && (
              <div>
                <Row className='mb-3'>
                  <Form.Group controlId='motivoForm' className='col-md-6'>
                    <Form.Label>Motivo</Form.Label>
                    <Form.Select
                      name='motivo'
                      value={selectedMotive}
                      onChange={(e) => setSelectedMotive(e.target.value)}
                      required={motivoRequired}
                      disabled={isLoading}
                    >
                      <option value=''>Selecione um motivo</option>
                      {Object.keys(apontamentosHierarquia).map((motivo) => (
                        <option key={motivo} value={motivo}>
                          {motivo}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId='equipamentoForm' className='col-md-6'>
                    <Form.Label>Equipamento</Form.Label>
                    <Form.Select
                      name='equipamento'
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      disabled={!selectedMotive || isLoading}
                      required={!!selectedMotive}
                    >
                      <option value=''>Selecione um equipamento</option>
                      {availableEquipments.map((equipamento) => (
                        <option key={equipamento} value={equipamento}>
                          {equipamento}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Row>
                <Row className='mb-3'>
                  <Form.Group controlId='problemaForm' className='col-md-6'>
                    <Form.Label>Problema</Form.Label>
                    <Form.Select
                      name='problema'
                      value={selectedProblem}
                      onChange={(e) => setSelectedProblem(e.target.value)}
                      disabled={!selectedEquipment || !selectedMotive || isLoading}
                      required={!!selectedMotive && !!selectedEquipment}
                    >
                      <option value=''>Selecione um problema</option>
                      {availableProblems.map((problema) => (
                        <option key={problema} value={problema}>
                          {problema}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId='causaForm' className='col-md-6'>
                    <Form.Label>Causa</Form.Label>
                    <Form.Select
                      name='causa'
                      value={selectedCause}
                      onChange={(e) => setSelectedCause(e.target.value)}
                      disabled={!selectedProblem || !selectedEquipment || !selectedMotive || isLoading}
                      required={!!selectedMotive && !!selectedEquipment && !!selectedProblem}
                    >
                      <option value=''>Selecione uma causa</option>
                      {availableCauses.map((causa) => (
                        <option key={causa} value={causa}>
                          {causa}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Row>
              </div>
            )}
            <Row className='mb-3'>
              <Form.Group controlId='descricaoForm' className='col-md-12'>
                <Form.Label>Descrição</Form.Label>
                <br />
                <Form.Text className='text-muted mb-2'>{formData.descricao}</Form.Text>
              </Form.Group>
            </Row>
            <Row className='mb-3'>
              <Form.Group controlId='observacoesForm' className='col-md-12'>
                <Form.Label>Observações</Form.Label>
                <Form.Control
                  as='textarea'
                  name='observacoes'
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  maxLength={OBSERVATION_LENGTH_LIMIT}
                  rows={3}
                  required
                  disabled={isLoading}
                />
                <Form.Text
                  className={`${OBSERVATION_LENGTH_LIMIT - obs.length < 50 ? 'text-danger' : 'text-muted'}`}
                >
                  <small>
                    {OBSERVATION_LENGTH_LIMIT - obs.length < 50 && (
                      <i className='bi bi-exclamation-triangle-fill me-1'></i>
                    )}
                    {obs.length === 0
                      ? `Máximo ${OBSERVATION_LENGTH_LIMIT} caracteres.`
                      : `Restam ${OBSERVATION_LENGTH_LIMIT - obs.length} caracteres.`}
                  </small>
                </Form.Text>
                <Form.Control.Feedback type='invalid'>Informe as observações.</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group className='mb-3'>
              <Form.Label>Contenção</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                name='contencao'
                placeholder='Descreva a ação imediata para conter o problema.'
                value={formData.contencao || ''}
                onChange={handleInputChange}
                maxLength={MAX_LENGTH}
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type='invalid'>Informe a contenção.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Causa Raiz</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                name='causa_raiz'
                placeholder='Por que o problema ocorreu? - Aplique o 5 Porquês.'
                value={formData.causa_raiz || ''}
                maxLength={MAX_LENGTH}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type='invalid'>Informe a causa raiz.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Solução</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                name='solucao'
                placeholder='Solução para causa raiz'
                value={formData.solucao || ''}
                onChange={handleInputChange}
                maxLength={MAX_LENGTH}
                required
                disabled={isLoading}
              />
              <Form.Control.Feedback type='invalid'>Informe a solução proposta.</Form.Control.Feedback>
            </Form.Group>
            <Row className='mb-3'>
              <Form.Group className='col-md-8'>
                <Form.Label>Feedback</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='feedback'
                  placeholder='O que espero de feedback? Quem vai dar o feedback?'
                  value={formData.feedback || ''}
                  onChange={handleInputChange}
                  maxLength={MAX_LENGTH}
                  required
                  disabled={isLoading}
                />
                <Form.Control.Feedback type='invalid'>
                  Informe o feedback esperado e o nome de quem vai dar ele.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className='col-md-4'>
                <Form.Label>Responsável</Form.Label>
                <Form.Control
                  type='text'
                  name='responsavel'
                  placeholder='Nome do responsável'
                  value={formData.responsavel || ''}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Form.Control.Feedback type='invalid'>
                  Informe o responsável pelo plano.
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
          </Modal.Body>
          <ModalFooter>
            <Button variant='secondary' onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type='submit' variant='primary' disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                    aria-hidden='true'
                  ></span>
                  {editData ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : editData ? (
                'Atualizar'
              ) : (
                'Salvar'
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <ToastDisplay />
    </>
  );
};

export default ActionPlanOperatorsFormModal;
