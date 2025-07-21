import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apontamentosHierarquia } from '../helpers/apontamentosHierarquia';
import { TurnoID } from '../helpers/constants';
import { useActionPlanOperators } from '../hooks/queries/useActionPlanOperators';
import { useFilters } from '../hooks/useFilters';
import { useToast } from '../hooks/useToast';
import { iActionPlan, iActionPlanFormData } from '../interfaces/ActionPlan.interface';
// import './actionPlanOperatorsFormModal.scss';

interface ActionPlanOperatorsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: iActionPlan | null;
  preFilledData?: Partial<iActionPlanFormData>;
}

export const ActionPlanOperatorsFormModal: React.FC<ActionPlanOperatorsFormModalProps> = ({
  isOpen,
  onClose,
  editData,
  preFilledData,
}) => {
  const { showToast, ToastDisplay } = useToast();

  // Redux state para pré-preenchimento
  const currentUser = useSelector((state: any) => state.user);

  // Hook para obter filtros do escopo de operators
  const { selectedLines } = useFilters('operators');

  // Função helper para obter nome da linha
  const getLineName = (lineId: number): string => {
    return `Linha ${lineId}`;
  };

  const { createActionPlan, updateActionPlan, isCreating, isUpdating } = useActionPlanOperators();

  // Estado do formulário
  const [formData, setFormData] = useState<iActionPlanFormData>({
    recno: 0,
    indicador: '',
    prioridade: 1,
    impacto: 1,
    data_registro: new Date(),
    turno: 'MAT' as TurnoID,
    descricao: '',
    causa_raiz: '',
    contencao: '',
    solucao: '',
    feedback: '',
    responsavel: '',
    data_conclusao: null,
    conclusao: 0,
    lvl: 1,
    prazo: null,
  });

  // Estados para selects hierárquicos
  const [selectedMotivo, setSelectedMotivo] = useState<string>('');
  const [selectedEquipamento, setSelectedEquipamento] = useState<string>('');
  const [selectedDescricao, setSelectedDescricao] = useState<string>('');
  const [selectedCausa, setSelectedCausa] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [availableEquipamentos, setAvailableEquipamentos] = useState<string[]>([]);
  const [availableDescricoes, setAvailableDescricoes] = useState<string[]>([]);
  const [availableCausas, setAvailableCausas] = useState<string[]>([]);

  // Validação de erro
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados do formulário
  useEffect(() => {
    if (editData) {
      // Modo edição
      setFormData({
        ...editData,
        data_registro: new Date(editData.data_registro),
        data_conclusao: editData.data_conclusao ? new Date(editData.data_conclusao) : null,
      });
    } else {
      // Modo criação - aplicar pré-preenchimento
      const initialData: iActionPlanFormData = {
        recno: 0,
        indicador: preFilledData?.indicador || '',
        prioridade: preFilledData?.prioridade || 1,
        impacto: preFilledData?.impacto || 1,
        data_registro: preFilledData?.data_registro || new Date(),
        turno: preFilledData?.turno || 'MAT',
        descricao: preFilledData?.descricao || '',
        causa_raiz: preFilledData?.causa_raiz || '',
        contencao: preFilledData?.contencao || '',
        solucao: preFilledData?.solucao || '',
        feedback: preFilledData?.feedback || '',
        responsavel: preFilledData?.responsavel || currentUser?.fullName || '',
        data_conclusao: preFilledData?.data_conclusao || null,
        conclusao: preFilledData?.conclusao || 0,
        lvl: preFilledData?.lvl || 1,
        prazo: preFilledData?.prazo || null,
      };
      setFormData(initialData);
    }
  }, [editData, preFilledData, isOpen]);

  // Configurar selects hierárquicos baseados na hierarquia
  useEffect(() => {
    if (selectedMotivo) {
      const equipamentos = Object.keys(
        apontamentosHierarquia[selectedMotivo as keyof typeof apontamentosHierarquia] || {}
      );
      setAvailableEquipamentos(equipamentos);
    } else {
      setAvailableEquipamentos([]);
      setSelectedEquipamento('');
    }
  }, [selectedMotivo]);

  useEffect(() => {
    if (selectedMotivo && selectedEquipamento) {
      const motivoData = apontamentosHierarquia[selectedMotivo as keyof typeof apontamentosHierarquia];
      if (motivoData) {
        const descricoes = Object.keys(motivoData[selectedEquipamento as keyof typeof motivoData] || {});
        setAvailableDescricoes(descricoes);
      }
    } else {
      setAvailableDescricoes([]);
      setSelectedDescricao('');
    }
  }, [selectedMotivo, selectedEquipamento]);

  // useEffect para popular causas baseado na descrição selecionada
  useEffect(() => {
    if (selectedMotivo && selectedEquipamento && selectedDescricao) {
      const motivoData = apontamentosHierarquia[selectedMotivo as keyof typeof apontamentosHierarquia];
      if (motivoData) {
        const equipamentoData = motivoData[selectedEquipamento as keyof typeof motivoData];
        if (equipamentoData) {
          const causas = equipamentoData[selectedDescricao as keyof typeof equipamentoData] || [];
          setAvailableCausas(Array.isArray(causas) ? causas : []);
        }
      }
    } else {
      setAvailableCausas([]);
      setSelectedCausa('');
    }
  }, [selectedMotivo, selectedEquipamento, selectedDescricao]);

  // Atualizar campo descrição quando a seleção hierárquica mudar
  useEffect(() => {
    if (selectedMotivo && selectedEquipamento && selectedDescricao) {
      // Obter a linha selecionada (primeira linha se houver seleções)
      const selectedLine = selectedLines.length > 0 ? selectedLines[0] : 1;
      const lineName = getLineName(selectedLine);

      let descricaoCompleta = `${lineName} - ${selectedMotivo} - ${selectedEquipamento} - ${selectedDescricao}`;
      if (selectedCausa) {
        descricaoCompleta += ` - ${selectedCausa}`;
      }
      if (observacoes.trim()) {
        descricaoCompleta += ` - ${observacoes.trim()}`;
      }
      setFormData((prev) => ({ ...prev, descricao: descricaoCompleta }));
    }
  }, [selectedMotivo, selectedEquipamento, selectedDescricao, selectedCausa, selectedLines, observacoes]);

  // useEffect separado para casos onde a descrição já existe (preenchimento automático do gráfico)
  useEffect(() => {
    // Só executar se há uma descrição e observações, mas não há selects preenchidos
    if (formData.descricao && !selectedMotivo && !selectedEquipamento && !selectedDescricao) {
      const descricaoAtual = formData.descricao;

      if (observacoes.trim()) {
        // Verificar se as observações já estão na descrição
        if (!descricaoAtual.endsWith(` - ${observacoes.trim()}`)) {
          // Remover observações antigas se existirem (último item após " - ")
          const partes = descricaoAtual.split(' - ');

          // Se a última parte não parece ser parte da estrutura padrão, remove
          let descricaoLimpa = descricaoAtual;
          if (partes.length > 4) {
            // Linha - Motivo - Equipamento - Descrição já são 4 partes
            descricaoLimpa = partes.slice(0, -1).join(' - ');
          }

          setFormData((prev) => ({ ...prev, descricao: `${descricaoLimpa} - ${observacoes.trim()}` }));
        }
      } else {
        // Se observações foram removidas, limpar da descrição
        const partes = descricaoAtual.split(' - ');
        if (partes.length > 4) {
          // Mais que a estrutura básica
          const descricaoLimpa = partes.slice(0, 4).join(' - '); // Manter só Linha - Motivo - Equipamento - Descrição
          setFormData((prev) => ({ ...prev, descricao: descricaoLimpa }));
        }
      }
    }
  }, [observacoes, formData.descricao, selectedMotivo, selectedEquipamento, selectedDescricao]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.indicador.trim()) {
      newErrors.indicador = 'Indicador é obrigatório';
    }

    if (formData.impacto < 0 || formData.impacto > 100) {
      newErrors.impacto = 'Impacto deve estar entre 0 e 100%';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.causa_raiz.trim()) {
      newErrors.causa_raiz = 'Causa raiz é obrigatória';
    } else if (formData.causa_raiz.length > 256) {
      newErrors.causa_raiz = 'Causa raiz deve ter no máximo 256 caracteres';
    }

    if (!formData.contencao.trim()) {
      newErrors.contencao = 'Contenção é obrigatória';
    } else if (formData.contencao.length > 256) {
      newErrors.contencao = 'Contenção deve ter no máximo 256 caracteres';
    }

    if (!formData.solucao.trim()) {
      newErrors.solucao = 'Solução é obrigatória';
    } else if (formData.solucao.length > 256) {
      newErrors.solucao = 'Solução deve ter no máximo 256 caracteres';
    }

    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório';
    }

    if (formData.feedback && formData.feedback.length > 256) {
      newErrors.feedback = 'Feedback deve ter no máximo 256 caracteres';
    }

    if (observacoes && observacoes.length > 256) {
      newErrors.observacoes = 'Observações deve ter no máximo 256 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field: keyof iActionPlanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Corrija os erros antes de continuar', 'danger');
      return;
    }

    try {
      // Converter datas para string no formato da API
      const submitData: Omit<iActionPlan, 'recno'> = {
        ...formData,
        data_registro: formData.data_registro.toISOString().split('T')[0],
        data_conclusao: formData.data_conclusao ? formData.data_conclusao.toISOString().split('T')[0] : null,
      };

      if (editData) {
        await updateActionPlan({ ...submitData, recno: editData.recno } as iActionPlan);
        showToast('Plano de ação atualizado com sucesso!', 'success');
      } else {
        await createActionPlan(submitData);
        showToast('Plano de ação criado com sucesso!', 'success');
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      showToast('Erro ao salvar plano de ação. Tente novamente.', 'danger');
    }
  };

  const handleClose = () => {
    setFormData({
      recno: 0,
      indicador: '',
      prioridade: 1,
      impacto: 1,
      data_registro: new Date(),
      turno: 'MAT' as TurnoID,
      descricao: '',
      causa_raiz: '',
      contencao: '',
      solucao: '',
      feedback: '',
      responsavel: '',
      data_conclusao: null,
      conclusao: 0,
      lvl: 1,
      prazo: null,
    });
    setErrors({});
    setSelectedMotivo('');
    setSelectedEquipamento('');
    setSelectedDescricao('');
    setSelectedCausa('');
    setObservacoes('');
    setAvailableEquipamentos([]);
    setAvailableDescricoes([]);
    setAvailableCausas([]);
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = isCreating || isUpdating;

  return (
    <div className='action-plan-operators-modal-overlay'>
      <div className='action-plan-operators-modal'>
        <div className='modal-header'>
          <h2>{editData ? 'Editar' : 'Criar'} Plano de Ação</h2>
          <button type='button' className='close-btn' onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className='action-plan-operators-form'>
          <div className='form-grid'>
            {/* Indicador */}
            <div className='form-group'>
              <label htmlFor='indicador'>Indicador *</label>
              <select
                id='indicador'
                value={formData.indicador}
                onChange={(e) => handleInputChange('indicador', e.target.value)}
                className={errors.indicador ? 'error' : ''}
                disabled={isLoading}
              >
                <option value=''>Selecione o indicador</option>
                <option value='S'>S - Segurança</option>
                <option value='Q'>Q - Qualidade</option>
                <option value='D'>D - Desempenho</option>
                <option value='C'>C - Custo</option>
              </select>
              {errors.indicador && <span className='error-text'>{errors.indicador}</span>}
            </div>

            {/* Prioridade */}
            <div className='form-group'>
              <label htmlFor='prioridade'>Prioridade *</label>
              <select
                id='prioridade'
                value={formData.prioridade}
                onChange={(e) => handleInputChange('prioridade', Number(e.target.value))}
                disabled={isLoading}
              >
                <option value={1}>1 - Baixa</option>
                <option value={2}>2 - Média</option>
                <option value={3}>3 - Alta</option>
              </select>
            </div>

            {/* Impacto */}
            <div className='form-group'>
              <label htmlFor='impacto'>Impacto (%) *</label>
              <input
                id='impacto'
                type='number'
                min='0'
                max='100'
                step='0.1'
                value={formData.impacto}
                onChange={(e) => handleInputChange('impacto', Math.floor(Number(e.target.value)))}
                className={errors.impacto ? 'error' : ''}
                disabled={isLoading}
                placeholder='Ex: 15.7 → 15'
              />
              {errors.impacto && <span className='error-text'>{errors.impacto}</span>}
            </div>

            {/* Turno */}
            <div className='form-group'>
              <label htmlFor='turno'>Turno *</label>
              <select
                id='turno'
                value={formData.turno}
                onChange={(e) => handleInputChange('turno', e.target.value as TurnoID)}
                disabled={isLoading}
              >
                <option value='MAT'>Matutino</option>
                <option value='VES'>Vespertino</option>
                <option value='NOT'>Noturno</option>
              </select>
            </div>
          </div>

          {/* Selects Hierárquicos para Descrição */}
          <div className='form-section'>
            <h3>Descrição do Problema</h3>
            <div className='form-grid'>
              <div className='form-group'>
                <label htmlFor='motivo'>Motivo</label>
                <select
                  id='motivo'
                  value={selectedMotivo}
                  onChange={(e) => setSelectedMotivo(e.target.value)}
                  disabled={isLoading}
                >
                  <option value=''>Selecione o motivo</option>
                  {Object.keys(apontamentosHierarquia).map((motivo) => (
                    <option key={motivo} value={motivo}>
                      {motivo}
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='equipamento'>Equipamento</label>
                <select
                  id='equipamento'
                  value={selectedEquipamento}
                  onChange={(e) => setSelectedEquipamento(e.target.value)}
                  disabled={isLoading || !selectedMotivo}
                >
                  <option value=''>Selecione o equipamento</option>
                  {availableEquipamentos.map((equipamento) => (
                    <option key={equipamento} value={equipamento}>
                      {equipamento}
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='descricao-select'>Descrição</label>
                <select
                  id='descricao-select'
                  value={selectedDescricao}
                  onChange={(e) => setSelectedDescricao(e.target.value)}
                  disabled={isLoading || !selectedEquipamento}
                >
                  <option value=''>Selecione a descrição</option>
                  {availableDescricoes.map((descricao) => (
                    <option key={descricao} value={descricao}>
                      {descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div className='form-group'>
                <label htmlFor='causa-select'>Causa</label>
                <select
                  id='causa-select'
                  value={selectedCausa}
                  onChange={(e) => setSelectedCausa(e.target.value)}
                  disabled={isLoading || !selectedDescricao}
                >
                  <option value=''>Selecione a causa</option>
                  {availableCausas.map((causa) => (
                    <option key={causa} value={causa}>
                      {causa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de Observações */}
            <div className='form-group'>
              <label htmlFor='observacoes'>Observações (máx. 256 caracteres)</label>
              <textarea
                id='observacoes'
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className={errors.observacoes ? 'error' : ''}
                disabled={isLoading}
                maxLength={256}
                rows={2}
                placeholder='Adicione observações que serão incluídas na descrição...'
              />
              <div className='char-count'>{observacoes.length}/256</div>
              {errors.observacoes && <span className='error-text'>{errors.observacoes}</span>}
            </div>

            {/* Campo de descrição final */}
            <div className='form-group'>
              <label htmlFor='descricao'>Descrição Completa *</label>
              <input
                id='descricao'
                type='text'
                value={formData.descricao}
                className={errors.descricao ? 'error' : ''}
                disabled={true}
                readOnly={true}
                placeholder='A descrição será montada automaticamente com base nas seleções acima'
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              {errors.descricao && <span className='error-text'>{errors.descricao}</span>}
            </div>
          </div>

          {/* Causa Raiz */}
          <div className='form-group'>
            <label htmlFor='causa_raiz'>Causa Raiz * (máx. 256 caracteres)</label>
            <textarea
              id='causa_raiz'
              value={formData.causa_raiz}
              onChange={(e) => handleInputChange('causa_raiz', e.target.value)}
              className={errors.causa_raiz ? 'error' : ''}
              disabled={isLoading}
              maxLength={256}
              rows={2}
              placeholder='Descreva a causa raiz do problema...'
            />
            <div className='char-count'>{formData.causa_raiz.length}/256</div>
            {errors.causa_raiz && <span className='error-text'>{errors.causa_raiz}</span>}
          </div>

          {/* Contenção */}
          <div className='form-group'>
            <label htmlFor='contencao'>Contenção * (máx. 256 caracteres)</label>
            <textarea
              id='contencao'
              value={formData.contencao}
              onChange={(e) => handleInputChange('contencao', e.target.value)}
              className={errors.contencao ? 'error' : ''}
              disabled={isLoading}
              maxLength={256}
              rows={3}
              placeholder='Descreva as ações de contenção...'
            />
            <div className='char-count'>{formData.contencao.length}/256</div>
            {errors.contencao && <span className='error-text'>{errors.contencao}</span>}
          </div>

          {/* Solução */}
          <div className='form-group'>
            <label htmlFor='solucao'>Solução * (máx. 256 caracteres)</label>
            <textarea
              id='solucao'
              value={formData.solucao}
              onChange={(e) => handleInputChange('solucao', e.target.value)}
              className={errors.solucao ? 'error' : ''}
              disabled={isLoading}
              maxLength={256}
              rows={3}
              placeholder='Descreva a solução proposta...'
            />
            <div className='char-count'>{formData.solucao.length}/256</div>
            {errors.solucao && <span className='error-text'>{errors.solucao}</span>}
          </div>

          {/* Responsável */}
          <div className='form-group'>
            <label htmlFor='responsavel'>Responsável *</label>
            <input
              id='responsavel'
              type='text'
              value={formData.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              className={errors.responsavel ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.responsavel && <span className='error-text'>{errors.responsavel}</span>}
          </div>

          {/* Prazo (edição) ou Data de Registro (criação) */}
          <div className='form-group'>
            <label htmlFor={editData ? 'prazo' : 'data_registro'}>{editData ? 'Prazo' : 'Data *'}</label>
            <input
              id={editData ? 'prazo' : 'data_registro'}
              type='date'
              value={editData ? formData.prazo || '' : formData.data_registro.toISOString().split('T')[0]}
              onChange={(e) =>
                editData
                  ? handleInputChange('prazo', e.target.value || null)
                  : handleInputChange('data_registro', new Date(e.target.value))
              }
              disabled={isLoading}
            />
          </div>

          {/* Feedback */}
          <div className='form-group'>
            <label htmlFor='feedback'>Feedback (máx. 256 caracteres)</label>
            <textarea
              id='feedback'
              value={formData.feedback}
              onChange={(e) => handleInputChange('feedback', e.target.value)}
              className={errors.feedback ? 'error' : ''}
              disabled={isLoading}
              maxLength={256}
              rows={2}
              placeholder='Feedback adicional...'
            />
            <div className='char-count'>{formData.feedback.length}/256</div>
            {errors.feedback && <span className='error-text'>{errors.feedback}</span>}
          </div>

          {/* Se for edição, mostrar campos de conclusão */}
          {editData && (
            <div className='form-grid'>
              <div className='form-group'>
                <label htmlFor='conclusao'>Status</label>
                <select
                  id='conclusao'
                  value={formData.conclusao}
                  onChange={(e) => handleInputChange('conclusao', Number(e.target.value))}
                  disabled={isLoading}
                >
                  <option value={0}>Aberto</option>
                  <option value={1}>Concluído</option>
                </select>
              </div>

              {formData.conclusao === 1 && (
                <div className='form-group'>
                  <label htmlFor='data_conclusao'>Data de Conclusão</label>
                  <input
                    id='data_conclusao'
                    type='date'
                    value={formData.data_conclusao ? formData.data_conclusao.toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      handleInputChange('data_conclusao', e.target.value ? new Date(e.target.value) : null)
                    }
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className='form-actions'>
            <button type='button' onClick={handleClose} disabled={isLoading} className='btn-cancel'>
              Cancelar
            </button>
            <button type='submit' disabled={isLoading} className='btn-submit'>
              {isLoading ? 'Salvando...' : editData ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
      <ToastDisplay />
    </div>
  );
};
