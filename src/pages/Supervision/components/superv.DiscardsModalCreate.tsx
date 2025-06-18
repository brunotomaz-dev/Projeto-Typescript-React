import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup, Modal, Stack } from 'react-bootstrap';
import { useIndicatorsQuery } from '../../../hooks/queries/useIndicatorsQuery';
import { useQualityIhmMutation } from '../../../hooks/queries/useQualityIhmMutation';
import { useToast } from '../../../hooks/useToast';
import { iQualidadeIHMCreate } from '../../../interfaces/QualidadeIHM.interface';
import { setIsModalOpen } from '../../../redux/store/features/discardsSlice';
import { setLineMachine } from '../../../redux/store/features/homeSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

const DiscardsModalCreate: React.FC = () => {
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const dispatch = useAppDispatch();
  const { isModalOpen } = useAppSelector((state) => state.discards);
  const { lineMachine } = useAppSelector((state) => state.home);

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { createData } = useQualityIhmMutation('supervision');
  const { showToast, ToastDisplay } = useToast();

  // Obter os dados de linha/máquina caso não estejam disponíveis no Redux
  const { lineMachineMap } = useIndicatorsQuery('supervision', Object.keys(lineMachine).length === 0);

  /* ------------------------------------------------ Effects ------------------------------------------------ */
  // Sincronizar o mapa de máquinas/linhas com o Redux se não estiver disponível
  useEffect(() => {
    if (Object.keys(lineMachine).length === 0 && Object.keys(lineMachineMap).length > 0) {
      dispatch(setLineMachine(lineMachineMap));

      // Atualizar o formulário com a nova linha inicial após carregar os dados
      if (lineMachineMap) {
        const firstLine = Object.values(lineMachineMap)[0] || 1;
        const firstMachine = Object.keys(lineMachineMap)[0] || '';

        setFormData((prev) => ({
          ...prev,
          linha: firstLine,
          maquina_id: firstMachine,
        }));
      }
    }
  }, [lineMachineMap, lineMachine, dispatch]);

  /* ----------------------------------------------- Functions ----------------------------------------------- */
  // Função para identificar a máquina através da linha (Obj - { maquina: linha })
  const getMachineByLine = (line: number) => {
    const machine = Object.keys(lineMachine).find((key) => lineMachine[key] === line);
    return machine ? machine : '';
  };

  const formatInt = (value: string | number): number => {
    // Converte o valor para inteiro, garantindo que seja um número válido
    const parsedValue = parseInt(value as string, 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };

  const formatFloat = (value: string | number): number => {
    // Converte o valor para float, garantindo que seja um número válido
    const parsedValue = parseFloat(value as string);
    return isNaN(parsedValue) ? 0 : Math.round(parsedValue * 1000) / 1000;
  };

  /* ------------------------------------------------ Helpers ------------------------------------------------ */
  // Mapa de tipos de descarte
  const discardTypes = {
    'Descarte de Pães': 'descarte_paes',
    'Descarte de Pães c/ Pasta': 'descarte_paes_pasta',
    'Descarte de Pasta': 'descarte_pasta',
    'Descarte de Bandejas': 'bdj_vazias',
  };

  const reprocessTypes = {
    'Reprocesso de Pães': 'reprocesso_paes',
    'Rep. de Pães c/ Pasta': 'reprocesso_paes_pasta',
    'Reprocesso de Pasta': 'reprocesso_pasta',
  };

  const reprocessTypeUnits = {
    'Reprocesso de Bandejas': 'reprocesso_bdj',
  };

  const formInitialValues: iQualidadeIHMCreate = {
    data_registro: format(new Date(), 'yyyy-MM-dd'),
    hora_registro: format(new Date(), 'HH:mm:ss'),
    linha: 1,
    maquina_id: getMachineByLine(1),
    bdj_vazias: 0,
    bdj_retrabalho: 0,
    reprocesso_bdj: 0,
    descarte_pasta: 0,
    reprocesso_pasta: 0,
    descarte_paes: 0,
    reprocesso_paes: 0,
    descarte_paes_pasta: 0,
    reprocesso_paes_pasta: 0,
  };

  /* ---------------------------------------------- Estado Local --------------------------------------------- */
  // Estado local para o formulário
  const [formData, setFormData] = useState<iQualidadeIHMCreate>({
    ...formInitialValues,
  });

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  const handleClose = () => {
    // Reseta os dados do formulário ao fechar o modal
    setFormData({ ...formInitialValues });
    // Fecha o modal
    dispatch(setIsModalOpen(false));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Recebe o nome e o valor do campo do formulário
    const { name, value } = e.target;

    // Verifica se o valor é um número e converte para inteiro, caso contrário mantém como string
    const parsevalue = Object.values(reprocessTypeUnits).includes(name)
      ? formatInt(value)
      : Object.values(reprocessTypes).includes(name) || Object.values(discardTypes).includes(name)
        ? formatFloat(value)
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsevalue,
    }));
  };

  const handleLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLine = parseInt(e.target.value, 10);
    setFormData((prevData) => ({
      ...prevData,
      linha: selectedLine,
      maquina_id: getMachineByLine(selectedLine),
    }));
  };

  const handleSubmit = () => {
    createData(formData, {
      onSuccess: () => {
        // Exibe mensagem de sucesso
        showToast('Apontamento de descarte criado com sucesso!', 'success');

        // Fecha o modal
        handleClose();
      },
      onError: () => {
        showToast('Erro ao criar apontamento de descarte', 'danger');
      },
    });
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Modal show={isModalOpen} onHide={handleClose} backdrop='static' centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Criar Apontamento de Descarte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Stack direction='horizontal' gap={3} className='mb-3'>
              <Form.Group>
                <Form.Label>Data do Registro</Form.Label>
                <Form.Control
                  type='date'
                  name='data_registro'
                  value={formData.data_registro}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Hora do Registro</Form.Label>
                <Form.Control
                  type='time'
                  name='hora_registro'
                  value={formData.hora_registro}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Linha</Form.Label>
                <Form.Select name='linha' value={formData.linha} onChange={handleLineChange}>
                  {Object.entries(lineMachine).map(([machine, line]) => (
                    <option key={machine} value={line}>
                      Linha {line} - {machine}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Stack>
            <Stack direction='horizontal' gap={3}>
              {Object.entries(discardTypes).map(([label, name]) => (
                <Form.Group key={name}>
                  <Form.Label>{label}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type='number'
                      name={name}
                      value={formData[name as keyof iQualidadeIHMCreate]}
                      onChange={handleChange}
                      min='0'
                      step='0.001'
                    />
                    <InputGroup.Text className='input-group-text'>kg</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              ))}
            </Stack>
            <Stack direction='horizontal' gap={3} className='mt-3'>
              {Object.entries(reprocessTypes).map(([label, name]) => (
                <Form.Group key={name}>
                  <Form.Label>{label}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type='number'
                      name={name}
                      value={formData[name as keyof iQualidadeIHMCreate]}
                      onChange={handleChange}
                      min='0'
                      step='0.001'
                    />
                    <InputGroup.Text className='input-group-text'>kg</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              ))}
              {Object.entries(reprocessTypeUnits).map(([label, name]) => (
                <Form.Group key={name}>
                  <Form.Label>{label}</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type='number'
                      name={name}
                      value={formData[name as keyof iQualidadeIHMCreate]}
                      onChange={handleChange}
                      min={0}
                    />
                    <InputGroup.Text className='input-group-text'>un</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              ))}
            </Stack>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant='primary' onClick={handleSubmit}>
            Criar
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastDisplay />
    </>
  );
};

export default DiscardsModalCreate;
