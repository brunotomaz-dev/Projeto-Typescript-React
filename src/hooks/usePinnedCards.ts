// cSpell: words superv
import { useEffect, useRef, useState } from 'react';

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
  storageKey = 'supervActionPinnedCards',
  cleanupOptions: CleanupOptions = { enabled: false }
) => {
  // Acompanha se os dados já foram carregados pelo menos uma vez
  const dataLoaded = useRef(false);

  // Estado para controlar os pins (carregando do localStorage)
  const [pinnedCards, setPinnedCards] = useState<number[]>(() => {
    const savedPins = localStorage.getItem(storageKey);
    return savedPins ? JSON.parse(savedPins) : [];
  });

  // Salvar os pins no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(pinnedCards));
    pinnedCardsEventBus.emit(pinnedCards);
  }, [pinnedCards, storageKey]);

  // Sincronizar com mudanças de outras instâncias
  useEffect(() => {
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
    // Só executar limpeza quando temos dados válidos E já carregamos dados pelo menos uma vez
    if (
      cleanupOptions.enabled &&
      cleanupOptions.validRecnos &&
      cleanupOptions.validRecnos.length > 0
    ) {
      // Marcar que já carregamos dados válidos pelo menos uma vez
      dataLoaded.current = true;

      const validRecnos = cleanupOptions.validRecnos;

      // Verificar se há pins que não correspondem a nenhum recno válido
      const invalidPins = pinnedCards.filter((pin) => !validRecnos.includes(pin));

      // Se encontramos pins inválidos, removê-los
      if (invalidPins.length > 0) {
        setPinnedCards((prev) => prev.filter((pin) => validRecnos.includes(pin)));
      }
    }
  }, [cleanupOptions.validRecnos, pinnedCards, cleanupOptions.enabled]);

  // Função para lidar com o pin/unpin
  const togglePin = (recno: number) => {
    if (pinnedCards.includes(recno)) {
      // Desafixar o card
      setPinnedCards((prev) => prev.filter((id) => id !== recno));
    } else {
      // Verificar limite de pins
      if (pinnedCards.length >= maxPins) {
        return;
      }
      // Fixar o card
      setPinnedCards((prev) => [...prev, recno]);
    }
  };

  // Função para limpar pins manualmente
  const cleanupInvalidPins = (validRecnos: number[]) => {
    // Só limpar se tivermos recnos válidos
    if (validRecnos && validRecnos.length > 0) {
      setPinnedCards((prev) => prev.filter((pin) => validRecnos.includes(pin)));
    }
  };

  // Checar se um card está pinado
  const isPinned = (recno: number) => pinnedCards.includes(recno);

  return {
    pinnedCards,
    setPinnedCards,
    togglePin,
    isPinned,
    cleanupInvalidPins,
  };
};
