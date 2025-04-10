import { iInfoIHM } from '../interfaces/InfoIHM.interface';
import { iInfoIhmLive } from '../pages/LiveLines/interfaces/infoIhm.interface';
import { DESC_EFF, NOT_EFF } from './constants';

const impactFilter = (data: iInfoIHM[] | iInfoIhmLive[]) => {
  const filterData = data
    .filter((originalItem) => {
      // Se o status for 'rodando' não manter o item
      if (originalItem.status === 'rodando') return false;

      // Primeiro verifica se não é um item que não afeta eficiência
      const isNotEff = NOT_EFF.some(
        (notEff) =>
          originalItem.motivo?.includes(notEff) ||
          originalItem.causa?.includes(notEff) ||
          originalItem.problema?.includes(notEff) ||
          originalItem.afeta_eff === 1
      );

      if (isNotEff) return false;

      // Se for parada, verifica DESC_EFF
      if (originalItem.status === 'parada') {
        const descEffKey = Object.keys(DESC_EFF).find(
          (key) =>
            originalItem.motivo?.includes(key) ||
            originalItem.causa?.includes(key) ||
            originalItem.problema?.includes(key)
        );

        if (descEffKey) {
          const tempoRestante =
            originalItem.tempo - DESC_EFF[descEffKey as keyof typeof DESC_EFF];

          // Se tempo restante for <= 0, remove o item
          if (tempoRestante <= 0) return false;

          // Se houver tempo restante, retorna true para manter o item
          return true;
        }
      }

      // Mantém o item se não foi filtrado anteriormente
      return true;
    })
    .map((item) => {
      // Se for parada, aplica o desconto no tempo
      if (item.status === 'parada') {
        const descEffKey = Object.keys(DESC_EFF).find(
          (key) =>
            item.motivo?.includes(key) ||
            item.causa?.includes(key) ||
            item.problema?.includes(key)
        );

        if (descEffKey) {
          const tempoRestante =
            item.tempo - DESC_EFF[descEffKey as keyof typeof DESC_EFF];
          return { ...item, tempo: tempoRestante };
        }
      }
      return item;
    });

  return filterData;
};

const notImpactFilter = (data: iInfoIHM[] | iInfoIhmLive[]) => {
  // Mantém apenas os items que possuem um desconto
  const filterDataByDiscounts = data
    .filter((originalItem) => {
      // Se o status for 'rodando' não manter o item
      if (originalItem.status === 'rodando') return false;

      // Verifica se é item que possui desconto
      const descEffKey = Object.keys(DESC_EFF).find(
        (key) =>
          originalItem.motivo?.includes(key) ||
          originalItem.causa?.includes(key) ||
          originalItem.problema?.includes(key)
      );

      // Remove intens que não possuem desconto
      if (!descEffKey) return false;

      return true;
    })
    .map((item) => {
      // Verifica se é item que possui desconto
      const descEffKey = Object.keys(DESC_EFF).find(
        (key) =>
          item.motivo?.includes(key) ||
          item.causa?.includes(key) ||
          item.problema?.includes(key)
      );

      // Se houver desconto, altera o tempo para o desconto
      if (descEffKey) {
        const tempo = DESC_EFF[descEffKey as keyof typeof DESC_EFF];
        return { ...item, tempo: tempo };
      }

      return item;
    });

  // Mantém os itens que não afetam a eficiência
  const filterNotAfetaData = data.filter((originalItem) => {
    // Se o status for 'rodando' não manter o item
    if (originalItem.status === 'rodando') return false;

    // Filtra os itens que não afetam a eficiência
    const isNotEff = NOT_EFF.some(
      (notEff) =>
        originalItem.motivo?.includes(notEff) ||
        originalItem.causa?.includes(notEff) ||
        originalItem.problema?.includes(notEff) ||
        originalItem.afeta_eff === 1
    );

    // Remove os items que afetam a eficiência
    if (!isNotEff) return false;

    return true;
  });

  // Une os dois filtros
  const finalFilterData = filterDataByDiscounts.concat(filterNotAfetaData);

  return finalFilterData;
};

export { impactFilter, notImpactFilter };

