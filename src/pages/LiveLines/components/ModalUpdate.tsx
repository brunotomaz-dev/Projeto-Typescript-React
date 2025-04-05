import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import { updateMaquinaIHM } from '../../../api/apiRequests';
import {
  afetaEficiencia,
  apontamentosHierarquia,
} from '../../../helpers/apontamentosHierarquia';
import { useToast } from '../../../hooks/useToast';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';

interface EditStopModalProps {
  show: boolean;
  onHide: () => void;
  stopData: iMaquinaIHM | null;
  onSave: () => void;
}

const EditStopModal: React.FC<EditStopModalProps> = ({
  show,
  onHide,
  stopData,
  onSave,
}) => {
  const { showToast, ToastDisplay } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<iMaquinaIHM>>({});

  // Estados para controlar as opções dependentes
  const [motivos, setMotivos] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [availableProblems, setAvailableProblems] = useState<string[]>([]);
  const [availableCauses, setAvailableCauses] = useState<string[]>([]);

  useEffect(() => {
    if (stopData) {
      // Converter string vazia para "Linha" na interface
      const formattedStopData = {
        ...stopData,
        equipamento: stopData.equipamento === '' ? 'Linha' : stopData.equipamento,
      };

      setFormData(formattedStopData);

      // Inicializar os motivos disponíveis
      setMotivos(Object.keys(apontamentosHierarquia));

      // Se já tiver um motivo selecionado, carregar os equipamentos correspondentes
      if (stopData.motivo) {
        const motivoData =
          apontamentosHierarquia[stopData.motivo as keyof typeof apontamentosHierarquia];
        if (motivoData) {
          // Adicionar "Linha" à lista de equipamentos se não estiver presente
          const equipmentList = Object.keys(motivoData);
          if (!equipmentList.includes('Linha')) {
            // Modificar array local para incluir "Linha" sem alterar a constante original
            setAvailableEquipment(['Linha', ...equipmentList]);
          } else {
            setAvailableEquipment(equipmentList);
          }

          // Se já tiver um equipamento selecionado, carregar os problemas correspondentes
          // Importante: para o equipamento "Linha" (string vazia), tentamos usar "Linha" no lookup primeiro
          // Se não existir, usamos "_geral" como fallback
          const equipForLookup =
            stopData.equipamento === '' ? 'Linha' : stopData.equipamento;

          // Verificar se o equipamento existe na hierarquia, caso contrário usar "_geral"
          const lookupKey = motivoData[equipForLookup as keyof typeof motivoData]
            ? equipForLookup
            : stopData.equipamento === ''
              ? '_geral'
              : stopData.equipamento;

          if (lookupKey && motivoData[lookupKey as keyof typeof motivoData]) {
            const equipamentoData = motivoData[lookupKey as keyof typeof motivoData];
            setAvailableProblems(Object.keys(equipamentoData));

            // Se já tiver um problema selecionado, carregar as causas correspondentes
            if (
              stopData.problema &&
              equipamentoData[stopData.problema as keyof typeof equipamentoData]
            ) {
              setAvailableCauses(
                equipamentoData[stopData.problema as keyof typeof equipamentoData]
              );
            }
          }
        }
      }
    }
  }, [stopData]);

  // Manipular mudanças nos campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'equipamento') {
      // Se o valor selecionado for "Linha", armazenar como string vazia
      const equipmentValue = value === 'Linha' ? '' : value;

      // Atualizar o campo
      setFormData((prev) => ({
        ...prev,
        equipamento: equipmentValue,
        problema: '',
        causa: '',
      }));

      // Atualizar opções de problemas baseado no equipamento
      if (formData.motivo) {
        const motivoData =
          apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];
        if (motivoData) {
          // Se selecionou "Linha", tentar usar "Linha" para buscar problemas
          // Se "Linha" não existir no motivo, usar "_geral" como fallback
          const tryLookup = value === 'Linha' ? 'Linha' : value;
          const equipForLookup = motivoData[tryLookup as keyof typeof motivoData]
            ? tryLookup
            : value === 'Linha'
              ? '_geral'
              : value;

          if (motivoData[equipForLookup as keyof typeof motivoData]) {
            setAvailableProblems(
              Object.keys(motivoData[equipForLookup as keyof typeof motivoData])
            );
            setAvailableCauses([]);
          }
        }
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
        os_numero: prev.motivo === 'Manutenção' ? prev.os_numero : '',
        [name]: value,
      }));

      // Atualizar opções de equipamentos baseado no motivo
      const motivoData =
        apontamentosHierarquia[value as keyof typeof apontamentosHierarquia];
      if (motivoData) {
        // Garantir que "Linha" esteja incluída nas opções de equipamento
        const equipmentList = Object.keys(motivoData);
        if (!equipmentList.includes('Linha')) {
          setAvailableEquipment(['Linha', ...equipmentList]);
        } else {
          setAvailableEquipment(equipmentList);
        }

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
      if (formData.motivo) {
        const motivoData =
          apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];
        if (motivoData) {
          // Se o equipamento for vazio (Linha), tentar usar "Linha" para lookup
          // Se "Linha" não existir no motivo, usar "_geral" como fallback
          const tryLookup = formData.equipamento === '' ? 'Linha' : formData.equipamento;
          const equipForLookup = motivoData[tryLookup as keyof typeof motivoData]
            ? tryLookup
            : formData.equipamento === ''
              ? '_geral'
              : formData.equipamento;

          const equipamentoData = motivoData[equipForLookup as keyof typeof motivoData];
          if (equipamentoData && equipamentoData[value as keyof typeof equipamentoData]) {
            setAvailableCauses(equipamentoData[value as keyof typeof equipamentoData]);
          }
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.motivo ||
      formData.equipamento === undefined || // Permitir string vazia (para "Linha")
      !formData.problema ||
      !formData.causa
    ) {
      showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    // Validar número de OS se o motivo for Manutenção
    if (formData.motivo === 'Manutenção' && !formData.os_numero) {
      showToast('Informe o número da OS para manutenção', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      // Criar uma cópia do formData para não modificar o estado diretamente
      const dataToSend = { ...formData };

      // Remover o campo s_backup antes de enviar para a API
      if ('s_backup' in dataToSend) {
        delete dataToSend.s_backup;
      }

      // Garantir que o equipamento seja string vazia quando for "Linha"
      // Verificação extra para garantir que não está enviando literalmente "Linha"
      if (dataToSend.equipamento === 'Linha') {
        dataToSend.equipamento = '-';
      }

      // Tratar o campo os_numero para evitar nulo quando não for Manutenção
      if (dataToSend.motivo !== 'Manutenção') {
        // Em vez de enviar vazio, definir como string "0" ou outro valor que seu backend aceite
        dataToSend.os_numero = '0'; // Ou outro valor que seja aceito pelo seu backend
      } else if (!dataToSend.os_numero) {
        // Garante que o campo tenha um valor padrão mesmo para manutenção
        dataToSend.os_numero = '0';
      }

      await updateMaquinaIHM(dataToSend as iMaquinaIHM);
      showToast('Parada atualizada com sucesso!', 'success');
      onSave();
      onHide();
    } catch (error) {
      console.error('Erro ao atualizar parada:', error);
      showToast('Erro ao atualizar parada', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para exibir o valor do equipamento no formulário
  const getDisplayEquipamento = () => {
    // Se for string vazia, exibir como "Linha"
    return formData.equipamento === '' ? 'Linha' : formData.equipamento;
  };

  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Parada</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className='mb-3'>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Linha</Form.Label>
                <Form.Control type='text' value={formData.linha || ''} disabled />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Máquina</Form.Label>
                <Form.Control type='text' value={formData.maquina_id || ''} disabled />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Data</Form.Label>
                <Form.Control type='text' value={formData.data_registro || ''} disabled />
              </Form.Group>
            </Col>
          </Row>

          <Row className='mb-3'>
            <Col md={4}>
              <Form.Group>
                <Form.Label className='required-field'>Motivo</Form.Label>
                <Form.Select
                  name='motivo'
                  value={formData.motivo || ''}
                  onChange={handleChange}
                  required
                >
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
                  value={getDisplayEquipamento() || ''}
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
                  disabled={!formData.motivo || formData.equipamento === undefined}
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
            <Col md={6}>
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
            <Col md={formData.motivo === 'Manutenção' ? 2 : 6}>
              <Form.Group>
                <Form.Label>Afeta Eficiência</Form.Label>
                <Form.Select
                  name='afeta_eff'
                  value={formData.afeta_eff?.toString() || '0'}
                  onChange={handleChange}
                >
                  {afetaEficiencia.map((item) => (
                    <option key={item.valor} value={item.valor.toString()}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Stack direction='horizontal' gap={2} className='justify-content-end'>
          <Button variant='secondary' onClick={onHide}>
            Cancelar
          </Button>
          <Button variant='primary' onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Stack>
      </Modal.Footer>
      {ToastDisplay && <ToastDisplay />}
    </Modal>
  );
};

export default EditStopModal;
