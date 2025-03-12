// cSpell:words usuario preposicoes

import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Button, Form, FormGroup, Modal, ModalBody, Stack } from 'react-bootstrap';
import { Highlighter } from 'react-bootstrap-typeahead';
import DatePicker from 'react-datepicker';
import { getAbsenceNames } from '../../../api/apiRequests';
import { TurnosObj } from '../../../helpers/constants';
import { iAbsenceForm } from '../interface/AbsenceForm.interface';

// Normalizador de nomes
// const normalizarNome = (nome: string): string => {
//   // Remove aspas e espaços extras no início e fim
//   let nomeNormalizado = nome.replace(/["']/g, '').trim();

//   // Divide o nome em partes e capitaliza cada uma
//   return nomeNormalizado
//     .split(' ')
//     .filter((parte) => parte.length > 0) // Remove espaços extras entre nomes
//     .map((parte) => {
//       // Lista de preposições e artigos que devem ficar em minúsculas
//       const preposicoes = ['de', 'da', 'do', 'dos', 'das', 'e'];

//       if (preposicoes.includes(parte.toLowerCase())) {
//         return parte.toLowerCase();
//       }

//       // Capitaliza (primeira letra maiúscula, resto minúsculo)
//       return parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase();
//     })
//     .join(' ');
// };

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
          .map(
            (subParte) =>
              subParte.charAt(0).toUpperCase() + subParte.slice(1).toLowerCase()
          )
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
const absenceTypes = [
  'Falta',
  'Atraso',
  'Afastamento',
  'Saída Antecipada',
  'Remanejamento',
];
const absenceSetores = [
  'Recheio',
  'Panificação',
  'Embalagem',
  'Pasta',
  'Forno',
  'Farofa',
  'Liderança',
];

// Interface de Props
interface iModalAbsProps {
  show: boolean;
  onHide: () => void;
  inicialDate: string;
  inicialTurno: string;
  inicialType: string;
  onSubmit: (FormData: iAbsenceForm) => void;
}

const AbsenceFormModal: React.FC<iModalAbsProps> = ({
  show,
  onHide,
  inicialDate,
  inicialTurno,
  inicialType,
  onSubmit,
}) => {
  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [formData, setFormData] = useState<iAbsenceForm>({
    data_occ: inicialDate,
    turno: inicialTurno,
    tipo: inicialType,
    nome: '',
    motivo: '',
    setor: 'Recheio',
  });
  const [nomesSuggestions, setNomesSuggestions] = useState<string[]>([]);
  const [showSuggestion, setShowSuggestion] = useState<boolean>(true);

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Valores iniciais conforme card selecionado
  useEffect(() => {
    setFormData({
      ...formData,
      data_occ: inicialDate,
      turno: inicialTurno,
      tipo: inicialType,
    });
  }, [inicialDate, inicialTurno, inicialType]);

  useEffect(() => {
    // Se não for para mostrar sugestões, não fazer nada
    if (!showSuggestion) return;

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
            return nomeNormalizado.find(
              (item: { nome: string }) => item.nome === uniqueName
            );
          });
          const uniqueNamesArray = uniqueNames.map((item: { nome: string }) => item.nome);

          setNomesSuggestions(uniqueNamesArray);
        });
      } else {
        setNomesSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.nome, showSuggestion]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */

  // Ajuste da data
  const selectedDate = formData.data_occ
    ? parse(formData.data_occ, 'yyyy-MM-dd', new Date())
    : new Date();

  // Reset do formulário e estados
  const resetModalState = () => {
    setFormData({
      data_occ: inicialDate,
      turno: inicialTurno,
      tipo: inicialType,
      nome: '',
      motivo: '',
      setor: 'Recheio',
    });
    setShowSuggestion(true);
    setNomesSuggestions([]);
  };

  // Lidar com mudança de data
  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      data_occ: date ? format(date, 'yyyy-MM-dd') : '',
    });
  };

  // Lidar com inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Lidar com Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetModalState();
    onHide();
  };

  // Lidar com fechamento do modal
  const handleClose = () => {
    resetModalState();
    onHide();
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Registro de {inicialType}</Modal.Title>
      </Modal.Header>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
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
              <Form.Select
                name='tipo'
                value={formData.tipo}
                onChange={handleInputChange}
                required
              >
                {absenceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </FormGroup>
            <FormGroup className='mb-3 w-25'>
              <Form.Label>Setor</Form.Label>
              <Form.Select
                name='setor'
                value={formData.setor}
                onChange={handleInputChange}
                required
              >
                {absenceSetores.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
              </Form.Select>
            </FormGroup>
            <FormGroup className='mb-3 w-25'>
              <Form.Label>Turno</Form.Label>
              <Form.Control
                as='select'
                name='turno'
                value={formData.turno}
                onChange={handleInputChange}
              >
                {TurnosObj.map((turno) => (
                  <option key={turno.id + turno.name} value={turno.turno}>
                    {turno.name}
                  </option>
                ))}
              </Form.Control>
            </FormGroup>
          </Stack>
          <Stack direction='horizontal' className='p-2'></Stack>
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
              />
              {nomesSuggestions.length > 0 && (
                <div className='suggestion-container border rounded mt-1 shadow p-2'>
                  <div className='small text-muted mb-2'>
                    Nomes registrados anteriormente:
                  </div>
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
            {/* Sugestão com Chips */}
            {/* {nomesSuggestions.length > 0 && (
                <div className='suggestions-chips mt-2 pb-1'>
                  <div className='small text-muted mb-1'>Sugestões:</div>
                  <div className='d-flex flex-wrap gap-1'>
                    {nomesSuggestions.slice(0, 20).map((nome) => (
                      <span
                        key={nome}
                        className='badge rounded-pill bg-light text-dark border p-2'
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowSuggestion(false);
                          setFormData({ ...formData, nome });
                          setNomesSuggestions([]);
                        }}
                      >
                        <i className='bi bi-person-fill me-1'></i>
                        {nome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div> */}
          </Form.Group>
          <FormGroup className='mb-3'>
            <Form.Label>Motivo</Form.Label>
            <Form.Control
              as='textarea'
              placeholder='Motivo'
              name='motivo'
              value={formData.motivo}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant='primary' type='submit' onClick={handleSubmit}>
          Salvar Registro
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AbsenceFormModal;
