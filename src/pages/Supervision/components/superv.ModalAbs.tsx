// cSpell:words usuario preposicoes

import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, FormGroup, Modal, ModalBody, Stack } from 'react-bootstrap';
import { Highlighter } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import { getAbsenceNames } from '../../../api/apiRequests';
import { TurnosObj } from '../../../helpers/constants';
import { useAbsenceMutation } from '../../../hooks/queries/useAbsenceMutation';
import { useFilters } from '../../../hooks/useFilters';
import { useToast } from '../../../hooks/useToast';
import { AbsenceTypesArray, iAbsenceForm } from '../../../interfaces/Absence.interface';
import { setAbsenceModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

// Tipos que precisam de data de retorno
const typesRequiringReturnDate = ['Férias', 'Afastamento'];

const normalizarNomeCompleto = (nome: string): string => {
  // Remove aspas e espaços extras no início e fim
  let nomeNormalizado = nome.replace(/["']/g, '').trim();

  // Divide o nome em partes e capitaliza cada uma
  return nomeNormalizado
    .split(' ')
    .filter((parte) => parte.length > 0)
    .map((parte) => {
      // Lista de exceções que devem ficar em minúsculas
      const manterMinusculo = ['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'por'];

      // Lista de sufixos que devem ser tratados especificamente
      const sufixosEspeciais = {
        filho: 'Filho',
        junior: 'Junior',
        jr: 'Jr',
        neto: 'Neto',
        sobrinho: 'Sobrinho',
      };

      // Verificar se é um sufixo especial
      const parteLower = parte.toLowerCase();
      if (parteLower in sufixosEspeciais) {
        return sufixosEspeciais[parteLower as keyof typeof sufixosEspeciais];
      }

      // Verificar se é uma preposição ou artigo
      if (manterMinusculo.includes(parteLower)) {
        return parteLower;
      }

      // Tratar nomes com hífen (ex: Maria-Eduarda)
      if (parte.includes('-')) {
        return parte
          .split('-')
          .map((subParte) => subParte.charAt(0).toUpperCase() + subParte.slice(1).toLowerCase())
          .join('-');
      }

      // Tratar iniciais (ex: J. R. Santos)
      if (parte.length === 2 && parte.endsWith('.')) {
        return parte.charAt(0).toUpperCase() + '.';
      }

      // Capitaliza normalmente
      return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
    })
    .join(' ');
};

// Tipos de Absenteísmo
const absenceSetores = ['Recheio', 'Panificação', 'Embalagem', 'Pasta', 'Forno', 'Farofa', 'Liderança'];

const AbsenceFormModal: React.FC = () => {
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const {
    absenceModalVisible,
    absenceModalEdit,
    absenceModalType,
    absenceModalData: absenceData,
  } = useAppSelector((state) => state.supervision.absenceModal);
  const dispatch = useAppDispatch();

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { createAbsence, updateAbsence, error } = useAbsenceMutation('supervision');
  const { showToast, ToastDisplay } = useToast();
  const { date, turn } = useFilters('supervision');

  const inicialDate = useMemo(
    () => (absenceModalEdit ? absenceData.data_occ : date),
    [absenceModalEdit, absenceData.data_occ, date]
  );
  const inicialTurno = useMemo(
    () => (absenceModalEdit ? absenceData.turno : turn),
    [absenceModalEdit, absenceData.turno, turn]
  );

  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [formData, setFormData] = useState<iAbsenceForm>({
    data_occ: inicialDate,
    turno: inicialTurno,
    tipo: absenceModalType,
    nome: absenceData.nome || '',
    motivo: absenceData.motivo || '',
    setor: absenceData.setor || 'Recheio',
    data_retorno: absenceData.data_retorno || '', // Adicionando o campo de data de retorno
  });
  const [nomesSuggestions, setNomesSuggestions] = useState<string[]>([]);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(!absenceModalEdit);
  const [validated, setValidated] = useState<boolean>(false);

  // Estado para controlar se o campo de data de retorno é necessário
  const [needReturnDate, setNeedReturnDate] = useState<boolean>(
    typesRequiringReturnDate.includes(absenceModalType)
  );

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Valores iniciais conforme card selecionado ou dados de edição
  useEffect(() => {
    if (absenceModalEdit) {
      // Se estivermos editando, use os dados fornecidos
      setFormData({
        data_occ: absenceData.data_occ || inicialDate,
        turno: absenceData.turno || inicialTurno,
        tipo: absenceData.tipo || absenceModalType,
        nome: absenceData.nome || '',
        motivo: absenceData.motivo || '',
        setor: absenceData.setor || 'Recheio',
        data_retorno: absenceData.data_retorno || '',
      });
    } else {
      // Se estivermos criando, use os dados iniciais
      setFormData({
        data_occ: inicialDate,
        turno: inicialTurno,
        tipo: absenceModalType,
        nome: '',
        motivo: '',
        setor: 'Recheio',
        data_retorno: '',
      });
    }

    // Verifica se o tipo selecionado requer data de retorno
    setNeedReturnDate(typesRequiringReturnDate.includes(absenceModalType));
  }, [inicialDate, inicialTurno, absenceModalType, absenceModalEdit, absenceData]);

  // Effect para monitorar mudanças no tipo e atualizar a necessidade de data de retorno
  useEffect(() => {
    setNeedReturnDate(typesRequiringReturnDate.includes(formData.tipo));

    // Se mudou para um tipo que não precisa de data de retorno, limpar o campo
    if (!typesRequiringReturnDate.includes(formData.tipo)) {
      setFormData((prev) => ({ ...prev, data_retorno: '' }));
    }
  }, [formData.tipo]);

  // Effect para sugestões de nome (apenas ao criar, não ao editar)
  useEffect(() => {
    // Se estiver editando ou não for para mostrar sugestões, não fazer nada
    if (absenceModalEdit || !showSuggestion) return;

    const timeoutId = setTimeout(() => {
      if (formData.nome.length > 2) {
        getAbsenceNames(formData.nome, ['nome']).then((nomes) => {
          const nomeNormalizado = nomes.map((item: { nome: string }) => ({
            ...item,
            nome: normalizarNomeCompleto(item.nome),
          }));
          const uniqueNames = Array.from(
            new Set(nomeNormalizado.map((item: { nome: string }) => item.nome))
          ).map((uniqueName) => {
            return nomeNormalizado.find((item: { nome: string }) => item.nome === uniqueName);
          });
          const uniqueNamesArray = uniqueNames.map((item: { nome: string }) => item.nome);

          setNomesSuggestions(uniqueNamesArray);
        });
      } else {
        setNomesSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.nome, showSuggestion, absenceModalEdit]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */

  // Ajuste da data
  const selectedDate = formData.data_occ ? parse(formData.data_occ, 'yyyy-MM-dd', new Date()) : new Date();

  // Reset do formulário e estados
  const resetModalState = () => {
    if (!absenceModalEdit) {
      setFormData({
        data_occ: inicialDate,
        turno: inicialTurno,
        tipo: absenceModalType || 'Falta',
        nome: '',
        motivo: '',
        setor: 'Recheio',
        data_retorno: '',
      });
      setShowSuggestion(true);
    }
    setNomesSuggestions([]);
    setNeedReturnDate(typesRequiringReturnDate.includes(absenceModalType));
  };

  // Lidar com mudança de data
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      data_occ: date ? format(date, 'yyyy-MM-dd') : '',
    });
  };

  // Função de tratamento de inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Se for o campo de data de retorno, garantir que esteja no formato correto
    if (name === 'data_retorno') {
      // Se estiver vazio, use undefined internamente (mas o componente mostra '')
      setFormData({
        ...formData,
        [name]: value.trim() === '' ? undefined : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Lidar com Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Se o tipo requer data de retorno, valide se está preenchida
    if (needReturnDate && !formData.data_retorno) {
      setValidated(true);
      return;
    }

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Prepare os dados para envio
    const formDataToSubmit = {
      ...formData,
      // Se não precisar de data_retorno ou estiver vazia, enviar undefined
      data_retorno: needReturnDate && formData.data_retorno ? formData.data_retorno : undefined,
    };

    // Faz a criação ou atualização do registro
    if (absenceModalEdit && absenceData.recno) {
      // Atualizar registro existente
      updateAbsence(
        { ...formDataToSubmit, recno: absenceData.recno },
        {
          onSuccess: () => {
            showToast('Registro atualizado com sucesso!', 'success');
          },
          onError: () => {
            showToast(`Erro ao atualizar registro: ${error?.message || 'Erro desconhecido'}`, 'danger');
          },
        }
      );
    } else {
      // Criar novo registro
      createAbsence(formDataToSubmit, {
        onSuccess: () => {
          showToast('Registro criado com sucesso!', 'success');
        },
        onError: () => {
          showToast(`Erro ao criar registro: ${error?.message || 'Erro desconhecido'}`, 'danger');
        },
      });
    }

    resetModalState();

    dispatch(setAbsenceModal({ absenceModalVisible: false }));
  };

  // Lidar com fechamento do modal
  const handleClose = () => {
    resetModalState();

    setValidated(false);

    dispatch(setAbsenceModal({ absenceModalVisible: false }));
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Modal show={absenceModalVisible} onHide={handleClose} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {absenceModalEdit ? 'Editar' : 'Registro de'} {formData.tipo}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} validated={validated} noValidate>
          <ModalBody>
            <Stack direction='horizontal' className='p-2' gap={3}>
              <FormGroup className='mb-3 w-25'>
                <Form.Label>Data</Form.Label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat='dd/MM/yyyy'
                  className='form-control text-center'
                  calendarIconClassName='mr-2'
                  icon={'bi bi-calendar'}
                  showIcon={true}
                  popperClassName='custom-popper'
                  calendarClassName='custom-calendar'
                  locale={ptBR}
                />
              </FormGroup>
              <FormGroup className='mb-3 w-25'>
                <Form.Label>Tipo</Form.Label>
                <Form.Select name='tipo' value={formData.tipo} onChange={handleInputChange} required>
                  {AbsenceTypesArray.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>
              <FormGroup className='mb-3 w-25'>
                <Form.Label>Setor</Form.Label>
                <Form.Select name='setor' value={formData.setor} onChange={handleInputChange} required>
                  {absenceSetores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </Form.Select>
              </FormGroup>
              <FormGroup className='mb-3 w-25'>
                <Form.Label>Turno</Form.Label>
                <Form.Control as='select' name='turno' value={formData.turno} onChange={handleInputChange}>
                  {TurnosObj.map((turno) => (
                    <option key={turno.id + turno.name} value={turno.turno}>
                      {turno.name}
                    </option>
                  ))}
                </Form.Control>
              </FormGroup>
            </Stack>
            {/* Campo de data de retorno (mostrado apenas para Férias e Afastamento) */}
            {needReturnDate && (
              <FormGroup className='mb-3'>
                <Form.Label>
                  Data de Retorno <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Control
                  type='date'
                  name='data_retorno'
                  value={formData.data_retorno || ''} // Use '' como fallback para null
                  onChange={handleInputChange}
                  min={formData.data_occ} // Não permitir data anterior à data de início
                  required
                  isInvalid={validated && !formData.data_retorno}
                  className='text-center w-25'
                />
                <Form.Control.Feedback type='invalid'>
                  A data de retorno é obrigatória para {formData.tipo}.
                </Form.Control.Feedback>
                <Form.Text className='text-muted'>
                  A data de retorno deve ser igual ou posterior à data de início.
                </Form.Text>
              </FormGroup>
            )}
            <Form.Group className='mb-3'>
              <Form.Label>Nome</Form.Label>
              <div className='position-relative'>
                <Form.Control
                  type='text'
                  placeholder='Nome Completo'
                  name='nome'
                  value={formData.nome}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    setTimeout(() => {
                      const nomeNormalizado = normalizarNomeCompleto(e.target.value);
                      setFormData({
                        ...formData,
                        nome: nomeNormalizado,
                      });
                    }, 200);
                  }}
                  required
                  isInvalid={validated && !formData.nome}
                  readOnly={absenceModalEdit} // Nome não editável durante edição
                />
                <Form.Control.Feedback type='invalid'>O nome é obrigatório.</Form.Control.Feedback>
                {!absenceModalEdit && nomesSuggestions.length > 0 && (
                  <div className='suggestion-container border rounded mt-1 shadow p-2'>
                    <div className='small text-muted mb-2'>Nomes registrados anteriormente:</div>
                    <div className='row g-2'>
                      {nomesSuggestions.slice(0, 9).map((nome) => (
                        <div className='col-md-4' key={nome}>
                          <div
                            className='card h-100 p-2 hover-overlay'
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setShowSuggestion(false);
                              setFormData({ ...formData, nome });
                              setNomesSuggestions([]);
                            }}
                          >
                            <div className='d-flex align-items-center'>
                              <div className='me-2 text-primary'>
                                <i className='bi bi-person-circle'></i>
                              </div>
                              <div>
                                <Highlighter search={formData.nome}>{nome}</Highlighter>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Form.Group>
            <FormGroup className='mb-3'>
              <Form.Label>Motivo</Form.Label>
              <Form.Control
                as='textarea'
                placeholder={
                  needReturnDate ? 'Descreva o motivo (férias programadas, atestado médico, etc.)' : 'Motivo'
                }
                name='motivo'
                value={formData.motivo}
                onChange={handleInputChange}
                required
                isInvalid={validated && !formData.motivo}
              />
              <Form.Control.Feedback type='invalid'>O motivo é obrigatório.</Form.Control.Feedback>
            </FormGroup>
          </ModalBody>
          <Modal.Footer>
            <Button variant='secondary' onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant='primary' type='submit'>
              {absenceModalEdit ? 'Atualizar' : 'Salvar'} Registro
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ToastDisplay />
    </>
  );
};

export default AbsenceFormModal;
