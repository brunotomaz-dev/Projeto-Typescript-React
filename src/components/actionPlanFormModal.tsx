// cSpell: words conclusao descricao contencao solucao responsavel

import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { createActionPlan, updateActionPlan } from '../api/apiRequests';
import { TurnoID } from '../helpers/constants';
import {
  iActionPlan,
  iActionPlanCards,
  iActionPlanFormData,
} from '../interfaces/ActionPlan.interface';
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
  const userLevel = useAppSelector((state) => state.user.level);

  /* ------------------------------------------ CONSTANTS ----------------------------------------- */
  const MAX_DESCRIPTION_LENGTH = 256;

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [validated, setValidated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  };

  // Se for edição, usar os valores do plano fornecido, senão usar o form vazio
  const [formData, setFormData] = useState<Omit<iActionPlanFormData, 'recno'>>(
    isEditing && actionPlan
      ? {
          ...actionPlan,
          // Garantir que data_registro é um objeto Date
          data_registro: ensureDate(actionPlan.data_registro),
          // Garantir que data_conclusao é um objeto Date ou null
          data_conclusao: actionPlan.data_conclusao
            ? ensureDate(actionPlan.data_conclusao)
            : null,
        }
      : { ...emptyForm }
  );

  const [descriptionCharsLeft, setDescriptionCharsLeft] = useState(
    MAX_DESCRIPTION_LENGTH - (formData.descricao?.length || 0)
  );

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Atualizar o formulário quando o actionPlan mudar
  useEffect(() => {
    if (isEditing && actionPlan) {
      setFormData({
        ...actionPlan,
        // Garantir que data_registro é um objeto Date
        data_registro: ensureDate(actionPlan.data_registro),
        // Garantir que data_conclusao é um objeto Date ou null
        data_conclusao: actionPlan.data_conclusao
          ? ensureDate(actionPlan.data_conclusao)
          : null,
      });
    }
  }, [actionPlan, isEditing]);

  useEffect(() => {
    if (formData.descricao) {
      setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH - formData.descricao.length);
    } else {
      setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH);
    }
  }, [formData.descricao]);

  /* ------------------------------------------- HANDLERS ----------------------------------------- */
  // Handler para mudanças nos campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    // Tratamento especial para descrição (limitar caracteres)
    if (name === 'descricao') {
      // Limita o valor ao máximo permitido
      const limitedValue = value.slice(0, MAX_DESCRIPTION_LENGTH);
      setFormData({
        ...formData,
        [name]: limitedValue,
      });
      setDescriptionCharsLeft(MAX_DESCRIPTION_LENGTH - limitedValue.length);
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
    const statusFinal =
      formData.conclusao === novoStatus && novoStatus !== 0 ? 0 : novoStatus;

    // Define a data de conclusão quando o status for 1 ou 2, ou limpa quando for 0
    const novaDataConclusao = statusFinal > 0 ? new Date() : null;

    setFormData({
      ...formData,
      conclusao: statusFinal,
      data_conclusao: novaDataConclusao,
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
      const apiData = {
        ...formData,
        data_registro: formatDateForAPI(formData.data_registro as Date),
        data_conclusao: formData.data_conclusao
          ? formatDateForAPI(formData.data_conclusao as Date)
          : null,
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
      const dias = Math.max(
        0,
        Math.floor((hoje.getTime() - dataRegistro.getTime()) / (1000 * 60 * 60 * 24))
      );

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
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setValidated(false);
    onHide();
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className='mb-3'>
            <Form.Group as={Col} md='3'>
              <Form.Label>Turno</Form.Label>
              <Form.Select
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

            <Form.Group as={Col} md='3'>
              <Form.Label>Data de Registro</Form.Label>

              <DatePicker
                selected={
                  formData.data_registro ? ensureDate(formData.data_registro) : null
                }
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
            <Form.Group as={Col} md='3'>
              <Form.Label>Prioridade</Form.Label>
              <Form.Select
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
            <Form.Group as={Col} md='3'>
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
          <Form.Group className='mb-3'>
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as='textarea'
              rows={4}
              name='descricao'
              value={formData.descricao || ''}
              maxLength={MAX_DESCRIPTION_LENGTH}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type='invalid'>
              Informe a descrição do plano.
            </Form.Control.Feedback>
            <Row className='d-flex justify-content-between mt-1'>
              {descriptionCharsLeft < 256 && (
                <small
                  className={`text-muted ${descriptionCharsLeft < 20 ? 'text-danger' : ''}`}
                >
                  {descriptionCharsLeft} caracteres restantes
                </small>
              )}
            </Row>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Causa Raiz</Form.Label>
            <Form.Control
              as='textarea'
              rows={1}
              name='causa_raiz'
              value={formData.causa_raiz || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type='invalid'>
              Informe a causa raiz.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Contenção</Form.Label>
            <Form.Control
              as='textarea'
              rows={1}
              name='contencao'
              value={formData.contencao || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type='invalid'>
              Informe a contenção.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Label>Solução</Form.Label>
            <Form.Control
              as='textarea'
              rows={1}
              name='solucao'
              value={formData.solucao || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type='invalid'>
              Informe a solução proposta.
            </Form.Control.Feedback>
          </Form.Group>

          <Row className='mb-3'>
            <Form.Group as={Col} md='8'>
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as='textarea'
                rows={1}
                name='feedback'
                value={formData.feedback || ''}
                onChange={handleChange}
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
                value={formData.responsavel || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type='invalid'>
                Informe o responsável pelo plano.
              </Form.Control.Feedback>
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
