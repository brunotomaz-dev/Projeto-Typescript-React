// cSpell: words desnormalizar
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Stack } from 'react-bootstrap';
import {
  updateHistoricalAppointmentRecord,
  updateMaquinaIHM,
} from '../../../api/apiRequests';
import { apontamentosHierarquia } from '../../../helpers/apontamentosHierarquia';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useToast';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';

// Extended interface to include the _isHistorical property
interface iExtendedMaquinaIHM extends iMaquinaIHM {
  _isHistorical?: boolean;
}

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
  /* ------------------------------------------- HOOK's ------------------------------------------- */
  const { hasResourcePermission } = usePermissions();
  const { showToast, ToastDisplay } = useToast();

  /* --------------------------------------- Estados Locais --------------------------------------- */
  const canFlag = hasResourcePermission('ihm_appointments', 'flag');

  /* --------------------------------------- Estados Locais --------------------------------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<iExtendedMaquinaIHM>>({});
  // Estados para controlar as opções dependentes
  const [motivos, setMotivos] = useState<string[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [availableProblems, setAvailableProblems] = useState<string[]>([]);
  const [availableCauses, setAvailableCauses] = useState<string[]>([]);

  /* ----------------------------------------- AUXILIARES ----------------------------------------- */
  // Função para normalizar o equipamento entre exibição e armazenamento
  const normalizeEquipamento = (equip: string | undefined): string => {
    if (equip === ' ' || equip === '' || equip === '-') return 'Linha';
    return equip || ' ';
  };

  // Função para desnormalizar o equipamento para envio ao backend
  const denormalizeEquipamento = (equip: string | undefined): string => {
    if (equip === 'Linha') return '-';
    return equip || '-';
  };

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    if (stopData) {
      // Normalizar equipamento para exibição: ' ' ou '' -> 'Linha'
      const formattedStopData = {
        ...stopData,
        equipamento: normalizeEquipamento(stopData.equipamento),
      };

      setFormData(formattedStopData);

      // Inicializar os motivos disponíveis
      setMotivos(Object.keys(apontamentosHierarquia));

      // Se já tiver um motivo selecionado, carregar os equipamentos correspondentes
      if (stopData.motivo) {
        const motivoData =
          apontamentosHierarquia[stopData.motivo as keyof typeof apontamentosHierarquia];

        if (motivoData) {
          // Carregar lista de equipamentos para este motivo
          const equipmentList = Object.keys(motivoData);
          setAvailableEquipment(equipmentList);

          // Se já tiver um equipamento selecionado, carregar os problemas correspondentes
          const displayEquipamento = normalizeEquipamento(stopData.equipamento);

          // Se o equipamento existe na hierarquia, carregar seus problemas
          if (displayEquipamento in motivoData) {
            setAvailableProblems(
              Object.keys(motivoData[displayEquipamento as keyof typeof motivoData])
            );

            // Se já tiver um problema selecionado, carregar as causas correspondentes
            if (stopData.problema) {
              const equipObj = motivoData[displayEquipamento as keyof typeof motivoData];
              // Verificar se o equipamento e o problema existem na hierarquia
              if (equipObj && stopData.problema in equipObj) {
                // Acessar as causas de forma segura
                setAvailableCauses(
                  equipObj[stopData.problema as keyof typeof equipObj] || []
                );
              }
            }
          }
        }
      }
    }
  }, [stopData]);

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Manipular mudanças nos campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

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
        const motivoData =
          apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];

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
        os_numero: value === 'Manutenção' ? prev.os_numero : '',
        [name]: value,
      }));

      // Atualizar opções de equipamentos baseado no motivo
      const motivoData =
        apontamentosHierarquia[value as keyof typeof apontamentosHierarquia];

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
        const motivoData =
          apontamentosHierarquia[formData.motivo as keyof typeof apontamentosHierarquia];

        if (
          motivoData &&
          formData.equipamento in motivoData &&
          value in motivoData[formData.equipamento as keyof typeof motivoData]
        ) {
          const equipObj = motivoData[formData.equipamento as keyof typeof motivoData];
          setAvailableCauses(
            (equipObj[value as keyof typeof equipObj] as string[]) || []
          );
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

      // Garantir que o campo equipamento seja um espaço em branco quando for "Linha"
      dataToSend.equipamento = denormalizeEquipamento(dataToSend.equipamento);

      // Tratar o campo os_numero para evitar nulo quando não for Manutenção
      if (dataToSend.motivo !== 'Manutenção') {
        dataToSend.os_numero = '0';
      } else if (!dataToSend.os_numero) {
        dataToSend.os_numero = '0';
      }

      // Verificar se é um registro histórico ou atual
      if ('_isHistorical' in dataToSend) {
        // Remover propriedades auxiliares antes de enviar
        delete dataToSend._isHistorical;

        // Usar a API específica para registros históricos
        await updateHistoricalAppointmentRecord(dataToSend as iMaquinaIHM);
        showToast('Registro histórico atualizado com sucesso!', 'success');
      } else {
        // Usar a API normal para registros do dia atual
        await updateMaquinaIHM(dataToSend as iMaquinaIHM);
        showToast('Parada atualizada com sucesso!', 'success');
      }

      onSave();
      onHide();
    } catch (error) {
      console.error('Erro ao atualizar parada:', error);
      showToast('Erro ao atualizar parada', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header
        closeButton
        className={formData._isHistorical ? 'bg-info text-white' : ''}
      >
        <Modal.Title>
          {formData._isHistorical ? 'Editar Registro Histórico' : 'Editar Parada'}
          {formData._isHistorical && (
            <div className='small mt-1'>
              <i className='bi bi-info-circle me-1'></i>
              Editando registro de data anterior
            </div>
          )}
        </Modal.Title>
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
                <Form.Control
                  type='text'
                  value={
                    formData.data_registro
                      ? format(parseISO(formData.data_registro), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })
                      : ''
                  }
                  disabled
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Hora</Form.Label>
                <Form.Control type='text' value={formData.hora_registro || ''} disabled />
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
            {formData.motivo === 'Manutenção' && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className='required-field'>Número da OS</Form.Label>
                  <Form.Control
                    type='text'
                    name='os_numero'
                    value={formData.os_numero || ''}
                    onChange={handleChange}
                    placeholder='Número da OS'
                    required
                  />
                </Form.Group>
              </Col>
            )}
            {canFlag && (
              <Col md={formData.motivo === 'Manutenção' ? 3 : 6}>
                <Form.Group>
                  <Form.Label>Afeta Eficiência?</Form.Label>
                  <Form.Select
                    name='afeta_eff'
                    value={formData.afeta_eff === undefined ? 0 : formData.afeta_eff}
                    onChange={handleChange}
                  >
                    <option value={0}>Sim</option>
                    <option value={1}>Não</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
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
