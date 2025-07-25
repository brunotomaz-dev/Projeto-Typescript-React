// cSpell: words conclusao descricao contencao solucao responsavel

import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { createActionPlan, updateActionPlan } from '../api/apiRequests';
import { apontamentosHierarquia } from '../helpers/apontamentosHierarquia';
import { setoresNames, TurnoID } from '../helpers/constants';
import { iActionPlan, iActionPlanCards, iActionPlanFormData } from '../interfaces/ActionPlan.interface';
import { useAppSelector } from '../redux/store/hooks';

interface iActionPlanFormModalProps {
  show: boolean;
  onHide: () => void;
  actionPlan?: iActionPlan;
  isEditing?: boolean;
  onSubmit: (actionPlan: iActionPlanCards) => void;
}

const ActionPlanFormModal: React.FC<iActionPlanFormModalProps> = ({
  show,
  onHide,
  actionPlan,
  isEditing = false,
  onSubmit,
}) => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  const userLevel = useAppSelector((state) => state.user.functionalLevel);

  /* ------------------------------------------ CONSTANTS ----------------------------------------- */
  const MAX_DESCRIPTION_LENGTH = 512;
  const MAX_LENGTH = 256;
  // Array de linhas disponíveis (1-14)
  const LINES = Array.from({ length: 14 }, (_, i) => i + 1);

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [validated, setValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados locais para os selects
  const [selectedCause, setSelectedCause] = useState<string>('');
  const [availableCauses, setAvailableCauses] = useState<string[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [availableProblems, setAvailableProblems] = useState<string[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [availableEquipments, setAvailableEquipments] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [obs, setObs] = useState<string>('');

  // Helper para garantir que datas sejam objetos Date
  const ensureDate = (date: string | Date | null | undefined): Date => {
    if (!date) return new Date();
    return typeof date === 'string' ? startOfDay(parseISO(date)) : startOfDay(date);
  };

  // Estado inicial do formulário
  const emptyForm: Omit<iActionPlanFormData, 'recno'> = {
    indicador: 'Q',
    descricao: '',
    prioridade: 1,
    impacto: 0,
    turno: 'MAT' as TurnoID,
    contencao: '',
    causa_raiz: '',
    solucao: '',
    feedback: '',
    responsavel: '',
    data_registro: new Date(),
    data_conclusao: null,
    conclusao: 0,
    lvl: userLevel,
    prazo: null,
  };

  // Se for edição, usar os valores do plano fornecido, senão usar o form vazio
  const [formData, setFormData] = useState<Omit<iActionPlanFormData, 'recno'>>(
    isEditing && actionPlan
      ? {
          ...actionPlan,
          // Garantir que data_registro é um objeto Date
          data_registro: ensureDate(actionPlan.data_registro),
          // Garantir que data_conclusao é um objeto Date ou null
          data_conclusao: actionPlan.data_conclusao ? ensureDate(actionPlan.data_conclusao) : null,
        }
      : { ...emptyForm }
  );

  const OBSERVATION_LENGTH_LIMIT = MAX_DESCRIPTION_LENGTH - formData.descricao.length;

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Atualizar o formulário quando o actionPlan mudar
  useEffect(() => {
    if (isEditing && actionPlan) {
      setFormData({
        ...actionPlan,
        // Garantir que data_registro é um objeto Date
        data_registro: ensureDate(actionPlan.data_registro),
        // Garantir que data_conclusao é um objeto Date ou null
        data_conclusao: actionPlan.data_conclusao ? ensureDate(actionPlan.data_conclusao) : null,
      });

      const { hasCompleteFormat, observations } = parseDescription(actionPlan.descricao);
      // Se a descrição tem formato completo, extrair observações
      if (hasCompleteFormat && observations) {
        setObs(observations);
      }
    }
  }, [actionPlan, isEditing]);

  /* ------------------------------------------- HANDLERS ----------------------------------------- */
  // Handler para mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // Handler para mudança de data
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        data_registro: date,
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

  // Função auxiliar para converter Date para string ISO (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | string): string => {
    return format(date, 'yyyy-MM-dd');
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Validar o formulário
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsSaving(true);

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

      const apiData = {
        ...formData,
        data_registro: formatDateForAPI(formData.data_registro as Date),
        data_conclusao: formData.data_conclusao ? formatDateForAPI(formData.data_conclusao as Date) : null,
        descricao: finalDescription,
      };

      let result;

      if (isEditing && actionPlan?.recno) {
        // Atualizar plano existente
        result = await updateActionPlan({
          ...apiData,
          recno: actionPlan.recno,
        } as iActionPlan);
      } else {
        // Criar novo plano
        result = await createActionPlan(apiData as Omit<iActionPlan, 'recno'>);
      }

      // Converter as datas da resposta de volta para Date
      const responseWithDates = {
        ...result,
        data_registro: ensureDate(result.data_registro),
        data_conclusao: result.data_conclusao ? ensureDate(result.data_conclusao) : null,
      };

      // Calcular dias em aberto
      const hoje = new Date();
      const dataRegistro = responseWithDates.data_registro;
      const dias = Math.max(0, Math.floor((hoje.getTime() - dataRegistro.getTime()) / (1000 * 60 * 60 * 24)));

      // Chamar callback com o resultado
      onSubmit({
        ...result,
        dias_aberto: dias,
      });
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      // Você pode adicionar um toast/notificação aqui
    } finally {
      setFormData(emptyForm);
      setIsSaving(false);
      setValidated(false);
    }
  };

  const handleCancel = () => {
    handleHide();
  };

  const handleHide = () => {
    setFormData(emptyForm);
    setObs('');
    setSelectedCause('');
    setSelectedProblem('');
    setSelectedEquipment('');
    setSelectedMotive('');
    setSelectedLine('');
    setSelectedSector('');
    setValidated(false);
    onHide();
  };

  /* ------------------------------------------- Selects De Motivo ------------------------------------------- */
  //Effects para controlar e popular os selects

  useEffect(() => {
    // Resetar o setor se não houver linha selecionada
    if (selectedSector === '') {
      setSelectedLine('');
    }
  }, [selectedSector]);

  useEffect(() => {
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
    let descricao = formData.descricao;

    if (selectedLine) {
      descricao = `Linha ${selectedLine}`;
    }

    if (selectedSector) {
      descricao += ` - ${selectedSector}`;
    }

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
  }, [selectedMotive, selectedEquipment, selectedProblem, selectedCause, selectedSector, selectedLine]);

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

  // Determinar se os selects devem ser obrigatórios
  const isEditWithCompleteDescription = isEditing && parseDescription(formData.descricao).hasCompleteFormat;
  const motivoRequired = !isEditWithCompleteDescription;

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Modal show={show} onHide={handleHide} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}</Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className='mb-3'>
            <Form.Group controlId='turnoForm' className='col-md-3'>
              <Form.Label>Turno</Form.Label>
              <Form.Select
                id='turnoSelect'
                name='turno'
                value={formData.turno || 'MAT'}
                onChange={handleChange}
                required
              >
                <option value='MAT'>Matutino</option>
                <option value='VES'>Vespertino</option>
                <option value='NOT'>Noturno</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId='dataRegistro' className='col-md-3'>
              <Form.Label>Data de Registro</Form.Label>

              <DatePicker
                selected={formData.data_registro ? ensureDate(formData.data_registro) : null}
                onChange={handleDateChange}
                dateFormat='dd/MM/yyyy'
                className='form-control text-center'
                wrapperClassName='d-block'
                calendarIconClassName='me-2'
                icon={'bi bi-calendar'}
                showIcon={true}
                popperClassName='custom-popper'
                calendarClassName='custom-calendar'
                locale={ptBR}
                required
              />
            </Form.Group>
            <Form.Group controlId='prioridadeForm' className='col-md-3'>
              <Form.Label>Prioridade</Form.Label>
              <Form.Select
                id='prioridadeSelect'
                name='prioridade'
                value={formData.prioridade || 1}
                onChange={handleChange}
                required
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
                onChange={handleChange}
                min='0'
                max='100'
                required
              />
            </Form.Group>
          </Row>
          <Row className='mb-3'>
            <Stack direction='horizontal' className='justify-content-between'>
              <Form.Group>
                <Form.Label>Indicador</Form.Label>
                <Form.Select
                  name='indicador'
                  value={formData.indicador || 'Q'}
                  onChange={handleChange}
                  required
                >
                  <option value='S'>S - Segurança</option>
                  <option value='Q'>Q - Qualidade</option>
                  <option value='D'>D - Desempenho</option>
                  <option value='C'>C - Custo</option>
                </Form.Select>
              </Form.Group>
              {isEditing && (
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <div className='d-flex gap-2'>
                    <Button
                      variant={formData.conclusao === 0 ? 'primary' : 'outline-primary'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(0)}
                      type='button'
                    >
                      <i className='bi bi-hourglass-split'></i>
                      Em Andamento
                    </Button>
                    <Button
                      variant={formData.conclusao === 3 ? 'warning' : 'outline-warning'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(3)}
                      type='button'
                    >
                      <i className='bi bi-pause-circle-fill'></i>
                      PDCA
                    </Button>
                    <Button
                      variant={formData.conclusao === 1 ? 'success' : 'outline-success'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(1)}
                      type='button'
                    >
                      <i className='bi bi-check-circle-fill'></i>
                      Concluído
                    </Button>
                    <Button
                      variant={formData.conclusao === 2 ? 'danger' : 'outline-danger'}
                      className='flex-grow-1 d-flex align-items-center justify-content-center gap-2'
                      onClick={() => handleConclusaoChange(2)}
                      type='button'
                    >
                      <i className='bi bi-x-circle-fill'></i>
                      Cancelado
                    </Button>
                  </div>
                </Form.Group>
              )}
            </Stack>
          </Row>
          {formData.conclusao === 3 && (
            <div className='mb-3 d-flex justify-content-center'>
              <Form.Group>
                <Form.Label>Prazo PDCA</Form.Label>
                <Form.Control
                  type='date'
                  name='prazo'
                  value={formData.prazo || ''}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type='invalid'>Informe o prazo do plano PDCA.</Form.Control.Feedback>
              </Form.Group>
            </div>
          )}

          <Row className='mb-3'>
            <Form.Group controlId='setorForm' className='col-md-6'>
              <Form.Label>Setor</Form.Label>
              <Form.Select
                name='setor'
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                required={motivoRequired}
              >
                <option value=''>Selecione um Setor</option>
                {setoresNames.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId='linhaForm' className='col-md-6'>
              <Form.Label>Linha</Form.Label>
              <Form.Select
                name='linha'
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                disabled={!selectedSector}
                required={!!selectedSector}
              >
                <option value=''>Selecione uma Linha</option>
                {LINES.map((linha) => (
                  <option key={linha} value={linha}>
                    Linha {linha}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row className='mb-3'>
            <Form.Group controlId='motivoForm' className='col-md-6'>
              <Form.Label>Motivo</Form.Label>
              <Form.Select
                name='motivo'
                value={selectedMotive}
                onChange={(e) => setSelectedMotive(e.target.value)}
                required={!!selectedLine && !!selectedSector}
                disabled={!selectedLine || !selectedSector}
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
                disabled={!selectedMotive}
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
                disabled={!selectedEquipment || !selectedMotive}
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
                disabled={!selectedProblem || !selectedEquipment || !selectedMotive}
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
              onChange={handleChange}
              maxLength={MAX_LENGTH}
              required
            />
            <Form.Control.Feedback type='invalid'>Informe a contenção.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Causa Raiz</Form.Label>
            <Form.Control
              as='textarea'
              rows={1}
              name='causa_raiz'
              placeholder='Por que o problema ocorreu? (Aplique o 5 porquês)'
              value={formData.causa_raiz || ''}
              maxLength={MAX_LENGTH}
              onChange={handleChange}
              required
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
              onChange={handleChange}
              maxLength={MAX_LENGTH}
              required
            />
            <Form.Control.Feedback type='invalid'>Informe a solução proposta.</Form.Control.Feedback>
          </Form.Group>

          <Row className='mb-3'>
            <Form.Group as={Col} md='8'>
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                name='feedback'
                placeholder='O que espero de feedback? Quem vai dar o feedback?'
                value={formData.feedback || ''}
                onChange={handleChange}
                maxLength={MAX_LENGTH}
                required
              />
              <Form.Control.Feedback type='invalid'>
                Informe o feedback esperado e o nome de quem vai dar ele.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md='4'>
              <Form.Label>Responsável</Form.Label>
              <Form.Control
                type='text'
                name='responsavel'
                placeholder='Nome do responsável'
                value={formData.responsavel || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type='invalid'>Informe o responsável pelo plano.</Form.Control.Feedback>
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={handleCancel} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type='submit' variant='primary' disabled={isSaving}>
            {isSaving ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                ></span>
                {isEditing ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : isEditing ? (
              'Atualizar'
            ) : (
              'Salvar'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ActionPlanFormModal;
