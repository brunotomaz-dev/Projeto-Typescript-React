// cSpell: words superv
import { useCallback, useEffect, useRef, useState } from 'react';

// Um event bus para comunicação entre instâncias do hook
const pinnedCardsEventBus = {
  listeners: [] as ((pins: number[]) => void)[],
  subscribe(callback: (pins: number[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  },
  emit(pins: number[]) {
    this.listeners.forEach((listener) => listener(pins));
  },
};

interface CleanupOptions {
  enabled: boolean;
  validRecnos?: number[];
}

export const usePinnedCards = (
  maxPins = 3,
  storageKey = 'pinnedCards',
  cleanupOptions: CleanupOptions = { enabled: false }
) => {
  // Referência para evitar chamadas duplicadas
  const isInitialized = useRef(false);

  // Estado para controlar os pins (carregando do localStorage com validação)
  const [pinnedCards, setPinnedCards] = useState<number[]>(() => {
    try {
      const savedPins = localStorage.getItem(storageKey);
      // Garantir que temos um array de números válido
      const parsed = savedPins ? JSON.parse(savedPins) : [];
      return Array.isArray(parsed) ? parsed.filter((pin) => typeof pin === 'number') : [];
    } catch (error) {
      console.error('Erro ao carregar pins salvos:', error);
      return [];
    }
  });

  // Flag para evitar atualizações incorretas durante uma operação de toggle
  const isTogglingRef = useRef(false);

  // Função para atualizar os pins de forma segura
  const updatePinnedCards = useCallback(
    (newPins: number[]) => {
      // Se estiver no meio de um toggle, usar o setState com callback para garantir valor mais recente
      if (isTogglingRef.current) {
        setPinnedCards(() => newPins);
      } else {
        setPinnedCards(newPins);
      }
      localStorage.setItem(storageKey, JSON.stringify(newPins));
      pinnedCardsEventBus.emit(newPins);
    },
    [storageKey]
  );

  // Efeito para limpeza inicial se tivermos recnos válidos na inicialização
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Se temos dados válidos e limpeza habilitada, executar limpeza inicial
    if (
      cleanupOptions.enabled &&
      cleanupOptions.validRecnos &&
      cleanupOptions.validRecnos.length > 0 &&
      pinnedCards.length > 0
    ) {
      const validRecnos = cleanupOptions.validRecnos;
      const validPins = pinnedCards.filter((pin) => validRecnos.includes(pin));

      // Se a limpeza vai remover algum pin, atualizar state
      if (validPins.length !== pinnedCards.length) {
        updatePinnedCards(validPins);
      }
    }
  }, [pinnedCards, cleanupOptions.enabled, cleanupOptions.validRecnos, updatePinnedCards]);

  // Sincronizar com mudanças de outras instâncias
  useEffect(() => {
    // Só sincronizar se não estiver no meio de um toggle
    if (isTogglingRef.current) return;

    const unsubscribe = pinnedCardsEventBus.subscribe((pins) => {
      // Evitar loops infinitos verificando se o estado é realmente diferente
      if (JSON.stringify(pins) !== JSON.stringify(pinnedCards)) {
        setPinnedCards(pins);
      }
    });

    return unsubscribe;
  }, [pinnedCards]);

  // Limpar pins de cards que não existem mais
  useEffect(() => {
    // Só limpar se não estiver no meio de um toggle
    if (isTogglingRef.current) return;

    if (!cleanupOptions.enabled || !cleanupOptions.validRecnos || cleanupOptions.validRecnos.length === 0) {
      return;
    }

    const validRecnos = cleanupOptions.validRecnos;
    // Verificar se há pins que não correspondem a nenhum recno válido
    const invalidPins = pinnedCards.filter((pin) => !validRecnos.includes(pin));

    // Se encontramos pins inválidos, removê-los
    if (invalidPins.length > 0) {
      updatePinnedCards(pinnedCards.filter((pin) => validRecnos.includes(pin)));
    }
  }, [cleanupOptions.validRecnos, pinnedCards, cleanupOptions.enabled, updatePinnedCards]);

  // Função para lidar com o pin/unpin
  const togglePin = useCallback(
    (recno: number) => {
      // Ativar a flag para evitar conflitos durante a operação
      isTogglingRef.current = true;

      try {
        // Usar uma função de callback para garantir o estado mais recente
        setPinnedCards((currentPins) => {
          const isPinned = currentPins.includes(recno);
          let newPins: number[];

          if (isPinned) {
            // Desafixar o card
            newPins = currentPins.filter((id) => id !== recno);
          } else {
            // Verificar limite de pins
            if (currentPins.length >= maxPins) {
              return currentPins; // Não modifica se exceder o limite
            }
            // Fixar o card
            newPins = [...currentPins, recno];
          }

          // Atualizar localStorage e emitir evento
          localStorage.setItem(storageKey, JSON.stringify(newPins));
          pinnedCardsEventBus.emit(newPins);

          return newPins;
        });
      } finally {
        // Garantir que a flag é desativada mesmo se ocorrer um erro
        setTimeout(() => {
          isTogglingRef.current = false;
        }, 0);
      }
    },
    [maxPins, storageKey]
  );

  // Função para limpar pins manualmente
  const cleanupInvalidPins = useCallback(
    (validRecnos: number[]) => {
      // Só limpar se tivermos recnos válidos
      if (validRecnos && validRecnos.length > 0) {
        updatePinnedCards(pinnedCards.filter((pin) => validRecnos.includes(pin)));
      }
    },
    [pinnedCards, updatePinnedCards]
  );

  // Checar se um card está pinado
  const isPinned = useCallback((recno: number) => pinnedCards.includes(recno), [pinnedCards]);

  return {
    pinnedCards,
    setPinnedCards: updatePinnedCards,
    togglePin,
    isPinned,
    cleanupInvalidPins,
  };
};
