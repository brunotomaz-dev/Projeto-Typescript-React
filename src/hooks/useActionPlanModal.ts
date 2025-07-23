import { useDispatch } from 'react-redux';
import { TurnoID } from '../helpers/constants';
import { iActionPlan, iActionPlanFormData } from '../interfaces/ActionPlan.interface';
import { closeActionPlanModal, openActionPlanModal } from '../redux/store/features/actionPlanSlice';
import { useAppSelector } from '../redux/store/hooks';
import { RootState } from '../redux/store/store';
import { useFilters } from './useFilters';

/**
 * Hook personalizado para gerenciar o estado do modal de Action Plan
 */
export const useActionPlanModal = (scope: string) => {
  const dispatch = useDispatch();
  const { formModalOperators: formModal } = useAppSelector((state: RootState) => state.actionPlans);
  const { sectors } = useAppSelector((state: RootState) => state.user);

  // Acessar filtros do escopo operators para pegar o turno atual e linha selecionada
  const { selectedLines, turn } = useFilters(scope);

  const openModal = (options: {
    mode: 'create' | 'edit';
    editData?: iActionPlan;
    preFilledData?: Partial<iActionPlanFormData>;
  }) => {
    dispatch(openActionPlanModal(options));
  };

  const closeModal = () => {
    dispatch(closeActionPlanModal());
  };

  const createFromStopData = (stopData: {
    motivo: string;
    problema: string;
    equipamento?: string;
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
      if (turn && turn !== 'ALL') {
        return turn as TurnoID;
      }
      return 'MAT'; // Padrão se não houver filtro específico
    };

    // Obter a linha selecionada
    const getSelectedLine = (): string => {
      if (selectedLines && selectedLines.length > 0) {
        return `Linha ${selectedLines[0]}`;
      }
      return 'Linha 1'; // Padrão se não houver linha selecionada
    };

    // Obter o setor atual
    const getCurrentSector = (): string => {
      if (sectors && sectors.length > 0) {
        return sectors[0]; // Retorna o primeiro setor como padrão
      }
      return 'Produção'; // Padrão se não houver setores definidos
    };

    const preFilledData: Partial<iActionPlanFormData> = {
      // Indicador nunca é preenchido automaticamente
      prioridade: getPriorityFromImpact(stopData.impacto),
      impacto: Math.floor(stopData.impacto),
      turno: getCurrentTurn(),
      descricao: stopData.equipamento
        ? `${getSelectedLine()} - ${getCurrentSector()} - ${stopData.equipamento} - ${stopData.motivo} - ${stopData.problema} - ${stopData.causa}`
        : `${getSelectedLine()} - ${getCurrentSector()} - ${stopData.motivo} - ${stopData.problema} - ${stopData.causa}`,
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
