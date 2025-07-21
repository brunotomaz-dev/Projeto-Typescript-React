import { useDispatch, useSelector } from 'react-redux';
import { TurnoID } from '../helpers/constants';
import { iActionPlanCards, iActionPlanFormData } from '../interfaces/ActionPlan.interface';
import { closeActionPlanModal, openActionPlanModal } from '../redux/store/features/actionPlanSlice';
import { RootState } from '../redux/store/store';

/**
 * Hook personalizado para gerenciar o estado do modal de Action Plan
 */
export const useActionPlanModal = () => {
  const dispatch = useDispatch();
  const { formModal } = useSelector((state: RootState) => state.actionPlans);

  // Acessar filtros do escopo operators para pegar o turno atual e linha selecionada
  const operatorsFilters = useSelector(
    (state: RootState) => state.filters.dateTurn['operators'] || { turn: 'ALL', selectedLines: [] }
  );

  const openModal = (options: {
    mode: 'create' | 'edit';
    editData?: iActionPlanCards;
    preFilledData?: Partial<iActionPlanFormData>;
  }) => {
    dispatch(openActionPlanModal(options));
  };

  const closeModal = () => {
    dispatch(closeActionPlanModal());
  };

  const createFromStopData = (stopData: {
    motivo: string;
    problema?: string;
    causa: string;
    impacto: number;
    tempo: number;
  }) => {
    // Determinar prioridade baseada no impacto (agora de 1 a 3)
    const getPriorityFromImpact = (impact: number) => {
      if (impact > 15) return 3; // Alta
      if (impact > 8) return 2; // Média
      return 1; // Baixa
    };

    // Determinar turno baseado no filtro atual
    const getCurrentTurn = (): TurnoID => {
      if (operatorsFilters.turn && operatorsFilters.turn !== 'ALL') {
        return operatorsFilters.turn as TurnoID;
      }
      return 'MAT'; // Padrão se não houver filtro específico
    };

    // Obter a linha selecionada
    const getSelectedLine = (): string => {
      if (operatorsFilters.selectedLines && operatorsFilters.selectedLines.length > 0) {
        return `Linha ${operatorsFilters.selectedLines[0]}`;
      }
      return 'Linha 1'; // Padrão se não houver linha selecionada
    };

    const preFilledData: Partial<iActionPlanFormData> = {
      // Indicador nunca é preenchido automaticamente
      prioridade: getPriorityFromImpact(stopData.impacto),
      impacto: Math.floor(stopData.impacto), // Arredonda para baixo o valor do gráfico
      turno: getCurrentTurn(), // Preenche automaticamente baseado no filtro
      descricao: stopData.problema
        ? `${getSelectedLine()} - ${stopData.motivo} - ${stopData.problema} - ${stopData.causa}`
        : `${getSelectedLine()} - ${stopData.motivo} - ${stopData.causa}`,
      // causa_raiz fica vazia para preenchimento manual
      lvl: 1,
      // Sugestão inicial de contenção baseada no tipo de parada
      contencao:
        stopData.motivo === 'Manutenção'
          ? 'Análise técnica da falha e ação corretiva imediata'
          : stopData.motivo === 'Ajustes'
            ? 'Reajuste dos parâmetros e verificação do processo'
            : 'Análise da causa e implementação de correção',
    };

    openModal({
      mode: 'create',
      preFilledData,
    });
  };

  return {
    // Estado
    isOpen: formModal.isOpen,
    mode: formModal.mode,
    editData: formModal.editData,
    preFilledData: formModal.preFilledData,

    // Ações
    openModal,
    closeModal,
    createFromStopData,
  };
};
