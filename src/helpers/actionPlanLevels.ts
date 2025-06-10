import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { iActionPlanCards } from '../interfaces/ActionPlan.interface';
import { iActionToShow } from '../redux/store/features/actionPlanSlice';

export const levelAdjust = (data: iActionPlanCards[], pinnedCards: number[]): iActionToShow[] => {
  return data.map((plan) => {
    const diasAberto = plan.dias_aberto;
    const isPinned = pinnedCards.includes(plan.recno);

    // Verificar se é um plano em PDCA
    const isPDCA = plan.conclusao === 3;

    // Verificar se o plano PDCA está dentro do prazo
    const isPDCAComPrazo = isPDCA && plan.prazo;
    const estaDentroDoPrazo =
      isPDCAComPrazo && plan.prazo
        ? differenceInDays(parseISO(plan.prazo), startOfDay(new Date())) >= 0
        : false;

    // Ajuste para planos em PDCA
    if (isPDCA && estaDentroDoPrazo) {
      // Planos em PDCA dentro do prazo têm nível mínimo 3 (coordenação)
      // ou mantêm o nível inicial se for maior que 3
      const nivelPDCA = Math.max(3, plan.lvl);

      // Se estiver pinado, garantir nível mínimo 5
      const nivelFinal = isPinned ? Math.max(5, nivelPDCA) : nivelPDCA;

      return {
        ...plan,
        nivelExibicao: nivelFinal,
        isPinned,
      };
    }

    // Lógica original para outros casos
    const nivelBaseadoEmDias =
      diasAberto >= 15
        ? 5
        : diasAberto >= 12
          ? 4
          : diasAberto >= 9
            ? 3
            : diasAberto >= 6
              ? 2
              : diasAberto >= 3
                ? 1
                : 0;

    // Cartões pinados sempre têm nível de exibição 5 para garantir que sejam mostrados
    const nivelFinal = isPinned ? Math.max(5, plan.lvl + nivelBaseadoEmDias) : plan.lvl + nivelBaseadoEmDias;

    return {
      ...plan,
      nivelExibicao: nivelFinal,
      isPinned,
    };
  });
};
