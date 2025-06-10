import { useCallback, useEffect } from 'react';
import { getActionPlan } from '../../api/apiRequests';
import { levelAdjust } from '../../helpers/actionPlanLevels';
import { ActionPlanStatus, superTurns } from '../../helpers/constants';
import { iActionPlanCards } from '../../interfaces/ActionPlan.interface';
import {
  setErrorActionPlans,
  setLoadingActionPlans,
  setProcessedActionPlans,
  setRawActionPlans,
} from '../../redux/store/features/actionPlanSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import { usePermissions } from '../usePermissions';

export const useActionPlansQuery = (statusFilter?: ActionPlanStatus[]) => {
  const dispatch = useAppDispatch();

  // Selecionar os estados necessários
  const rawData = useAppSelector((state) => state.actionPlans.rawData);
  const processedData = useAppSelector((state) => state.actionPlans.processedData);
  const loading = useAppSelector((state) => state.actionPlans.loading);
  const error = useAppSelector((state) => state.actionPlans.error);
  const pinnedCards = useAppSelector((state) => state.pins.pinnedCards);
  const userName = useAppSelector((state) => state.user.fullName);
  const { isSuperUser, userFunctionalLevel } = usePermissions();

  // Função para processar os dados de planos de ação
  const processActionPlans = useCallback(
    (data: iActionPlanCards[]) => {
      // Primeiro passo: aplicar o ajuste de nível aos dados
      const adjustedData = levelAdjust(data, pinnedCards);

      // Segundo passo: filtrar por critérios de nível mínimo, pins e nível inicial máximo
      const filteredByRules = adjustedData.filter(
        (plan) =>
          // Superusuários veem todos os cards
          isSuperUser ||
          // Condições normais para outros usuários:
          plan.isPinned || // Sempre mostra os pinados
          (plan.lvl <= userFunctionalLevel && // Nível inicial do plano <= nível do usuário
            plan.nivelExibicao === userFunctionalLevel) // Nível de exibição === nível do usuário
      );

      // Terceiro passo: filtrar por turno se necessário (exceto para coordenadores e acima)
      let finalData = filteredByRules;

      // Apenas líderes (1) e supervisores (2) são filtrados por turno
      // Coordenadores (3+) e superUsers veem todos os turnos
      if (userFunctionalLevel < 3 && !isSuperUser) {
        // Líderes e supervisores têm turno fixo baseado em seu nome de usuário
        const userTurno = superTurns[userName];
        if (userTurno) {
          finalData = filteredByRules.filter((plan) => plan.turno === userTurno);
        }
      }
      // Para coordenadores e acima, não aplicamos filtro de turno aos dados processados

      dispatch(setProcessedActionPlans(finalData));
    },
    [dispatch, pinnedCards, isSuperUser, userFunctionalLevel, userName]
  );

  // Efeito para processar os dados quando mudam
  useEffect(() => {
    if (rawData.length > 0) {
      processActionPlans(rawData);
    }
  }, [rawData, processActionPlans]);

  // Função para carregar os dados quando o componente é montado
  const fetchActionPlans = useCallback(async () => {
    if (!statusFilter || statusFilter.length === 0) return;

    dispatch(setLoadingActionPlans(true));
    try {
      // Buscamos sempre TODOS os planos de ação sem filtrar por turno na API
      const response = await getActionPlan(undefined, statusFilter);

      // Armazenamos os dados completos, sem filtrar por turno aqui
      // A filtragem por turno vai acontecer apenas no processamento dos dados
      // e só para usuários de nível inferior a coordenador
      dispatch(setRawActionPlans(response));
      dispatch(setErrorActionPlans(null));
    } catch (error) {
      console.error('Erro ao buscar planos de ação:', error);
      dispatch(setErrorActionPlans(error instanceof Error ? error.message : 'Erro ao buscar planos de ação'));
    } finally {
      dispatch(setLoadingActionPlans(false));
    }
  }, [dispatch, statusFilter]);

  // Retornar os dados e funções necessárias
  return {
    actionPlanData: processedData,
    rawActionPlanData: rawData,
    isLoading: loading,
    error,
    fetchActionPlans,
    setActionPlanData: (data: iActionPlanCards[]) => dispatch(setRawActionPlans(data)),
  };
};
