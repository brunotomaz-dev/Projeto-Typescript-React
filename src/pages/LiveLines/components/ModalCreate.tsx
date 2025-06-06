import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import { apontamentosHierarquia } from '../../../helpers/apontamentosHierarquia';
import { useCreateStopModal } from '../../../hooks/useCreateStopModal';
import { useToast } from '../../../hooks/useToast';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';

const CreateStopModal: React.FC = () => {
  /* ------------------------------------------- HOOK's ------------------------------------------- */
  const { isVisible, isLoading, closeModal, saveRecord, selectedLine, selectedMachine, selectedDate } =
    useCreateStopModal();
  const { showToast, ToastDisplay } = useToast();

  /* --------------------------------------- Estados Locais --------------------------------------- */
  const [formData, setFormData] = useState<Partial<iMaquinaIHM>>({});

  // Estados para controlar as opções dependentes
  const [motivos, setMotivos] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [availableProblems, setAvailableProblems] = useState<string[]>([]);
  const [availableCauses, setAvailableCauses] = useState<string[]>([]);

  /* ----------------------------------------- AUXILIARES ----------------------------------------- */
  // Função para ajustar o equipamento para envio ao backend
  const denormalizeEquipamento = (equip: string | undefined): string => {
    if (equip === 'Linha') return '-';
    return equip || '-';
  };

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    if (isVisible) {
      // Inicializar os dados do formulário
      const currentTime = new Date();
      const currentHour = currentTime.getHours().toString().padStart(2, '0');
      const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');

      setFormData({
        linha: selectedLine,
        maquina_id: selectedMachine,
        data_registro: selectedDate,
        hora_registro: `${currentHour}:${currentMinute}`,
        afeta_eff: 0, // Valor padrão
        os_numero: '0', // Valor padrão
        operador_id: '',
      });

      // Inicializar os motivos disponíveis
      setMotivos(Object.keys(apontamentosHierarquia));
    }
  }, [isVisible, selectedLine, selectedMachine, selectedDate]);

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Manipular mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Validação especial para o campo operador_id
    if (name === 'operador_id') {
      // Permitir apenas números
      const numericValue = value.replace(/\D/g, '');

      // Limitar a 9 caracteres
      const truncatedValue = numericValue.slice(0, 9);

      // Atualizar o formulário
      setFormData((prev) => ({
        ...prev,
        [name]: truncatedValue,
      }));

      return;
    }

    if (name === 'equipamento') {
      // Atualizar o campo e limpar os campos dependentes
      setFormData((prev) => ({
        ...prev,
        equipamento: value,
        problema: '',
        causa: '',
      }));

      // Atualizar opções de problemas baseado no equipamento
      if (formData.motivo) {
        const motivoData = apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];

        if (motivoData && value in motivoData) {
          // Equipamento existente na hierarquia
          setAvailableProblems(Object.keys(motivoData[value as keyof typeof motivoData]));
        } else {
          // Equipamento não existe na hierarquia
          setAvailableProblems([]);
        }

        // Limpar as causas quando o equipamento é alterado
        setAvailableCauses([]);
      }
      return;
    }

    // Para outros campos, comportamento normal
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'afeta_eff' ? parseInt(value) : value,
    }));

    // Caso especial para campos com dependências
    if (name === 'motivo') {
      // Resetar campos dependentes
      setFormData((prev) => ({
        ...prev,
        equipamento: '',
        problema: '',
        causa: '',
        os_numero: value === 'Manutenção' ? prev.os_numero : '0',
        [name]: value,
      }));

      // Atualizar opções de equipamentos baseado no motivo
      const motivoData = apontamentosHierarquia[value as keyof typeof apontamentosHierarquia];

      if (motivoData) {
        setAvailableEquipment(Object.keys(motivoData));
        setAvailableProblems([]);
        setAvailableCauses([]);
      }
    } else if (name === 'problema') {
      // Resetar campo de causa
      setFormData((prev) => ({
        ...prev,
        causa: '',
        [name]: value,
      }));

      // Atualizar opções de causas baseado no problema
      if (formData.motivo && formData.equipamento) {
        const motivoData = apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];

        if (
          motivoData &&
          formData.equipamento in motivoData &&
          value in motivoData[formData.equipamento as keyof typeof motivoData]
        ) {
          const equipObj = motivoData[formData.equipamento as keyof typeof motivoData];
          setAvailableCauses((equipObj[value as keyof typeof equipObj] as string[]) || []);
        } else {
          setAvailableCauses([]);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.motivo ||
      !formData.equipamento ||
      !formData.problema ||
      !formData.causa ||
      !formData.operador_id // Adicionar validação para o operador_id
    ) {
      showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    // Validar número de OS se o motivo for Manutenção
    if (formData.motivo === 'Manutenção' && !formData.os_numero) {
      showToast('Informe o número da OS para manutenção', 'warning');
      return;
    }

    // Preparar os dados para envio
    const dataToSend = { ...formData };

    // Garantir que o campo equipamento seja um espaço em branco quando for "Linha"
    dataToSend.equipamento = denormalizeEquipamento(dataToSend.equipamento);

    // Garantir que o campo os_numero esteja preenchido
    if (dataToSend.motivo !== 'Manutenção') {
      dataToSend.os_numero = '0';
    } else if (!dataToSend.os_numero) {
      dataToSend.os_numero = '0';
    }

    await saveRecord(dataToSend);
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Modal show={isVisible} onHide={closeModal} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Apontamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className='mb-3'>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Linha</Form.Label>
                <Form.Control type='text' value={formData.linha || ''} disabled />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Máquina</Form.Label>
                <Form.Control type='text' value={formData.maquina_id || ''} disabled />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data</Form.Label>
                <Form.Control type='text' value={formData.data_registro || ''} disabled />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Hora</Form.Label>
                <Form.Control
                  type='time'
                  name='hora_registro'
                  value={formData.hora_registro || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className='mb-3'>
            <Col md={4}>
              <Form.Group>
                <Form.Label className='required-field'>Motivo</Form.Label>
                <Form.Select name='motivo' value={formData.motivo || ''} onChange={handleChange} required>
                  <option value=''>Selecione...</option>
                  {motivos.map((motivo) => (
                    <option key={motivo} value={motivo}>
                      {motivo}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className='required-field'>Equipamento</Form.Label>
                <Form.Select
                  name='equipamento'
                  value={formData.equipamento || ''}
                  onChange={handleChange}
                  disabled={!formData.motivo}
                  required
                >
                  <option value=''>Selecione...</option>
                  {availableEquipment.map((equip) => (
                    <option key={equip} value={equip}>
                      {equip}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className='required-field'>Problema</Form.Label>
                <Form.Select
                  name='problema'
                  value={formData.problema || ''}
                  onChange={handleChange}
                  disabled={!formData.equipamento}
                  required
                >
                  <option value=''>Selecione...</option>
                  {availableProblems.map((problema) => (
                    <option key={problema} value={problema}>
                      {problema}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className='mb-3'>
            <Col md={formData.motivo === 'Manutenção' ? 4 : 6}>
              <Form.Group>
                <Form.Label className='required-field'>Causa</Form.Label>
                <Form.Select
                  name='causa'
                  value={formData.causa || ''}
                  onChange={handleChange}
                  disabled={!formData.problema}
                  required
                >
                  <option value=''>Selecione...</option>
                  {availableCauses.map((causa) => (
                    <option key={causa} value={causa}>
                      {causa}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            {/* Campo OS_Numero apenas quando motivo for Manutenção */}
            {formData.motivo === 'Manutenção' && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label className='required-field'>Número da OS</Form.Label>
                  <Form.Control
                    type='text'
                    name='os_numero'
                    value={formData.os_numero || ''}
                    onChange={handleChange}
                    placeholder='Informe o número da OS'
                    required
                  />
                </Form.Group>
              </Col>
            )}
            <Col md={formData.motivo === 'Manutenção' ? 4 : 6}>
              <Form.Group>
                <Form.Label className='required-field'>Operador ID</Form.Label>
                <Form.Control
                  type='text'
                  name='operador_id'
                  value={formData.operador_id || ''}
                  onChange={handleChange}
                  placeholder='Digite o ID do operador (apenas números)'
                  required
                  maxLength={9}
                  inputMode='numeric'
                  pattern='[0-9]*'
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Stack direction='horizontal' gap={2} className='justify-content-end'>
          <Button variant='secondary' onClick={closeModal}>
            Cancelar
          </Button>
          <Button variant='primary' onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Stack>
      </Modal.Footer>
      {ToastDisplay && <ToastDisplay />}
    </Modal>
  );
};

export default CreateStopModal;
