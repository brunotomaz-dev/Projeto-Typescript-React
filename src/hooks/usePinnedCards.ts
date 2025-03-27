// cSpell: words superv
import { useEffect, useState } from 'react';

// Um event bus para comunicação entre instâncias do hook
const pinnedCardsEventBus = {
  listeners: [] as ((pins: number[]) => void)[],
  subscribe(callback: (pins: number[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },
  emit(pins: number[]) {
    this.listeners.forEach(listener => listener(pins));
  }
};

export const usePinnedCards = (maxPins = 3, storageKey = 'supervActionPinnedCards') => {
  
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
  
  // Função para lidar com o pin/unpin
  const togglePin = (recno: number) => {
    if (pinnedCards.includes(recno)) {
      // Desafixar o card
      setPinnedCards(prev => prev.filter(id => id !== recno));
    } else {
      // Verificar limite de pins
      if (pinnedCards.length >= maxPins) {
        return;
      }
      // Fixar o card
      setPinnedCards(prev => [...prev, recno]);
    }
  };
  
  // Checar se um card está pinado
  const isPinned = (recno: number) => pinnedCards.includes(recno);
  
  return {
    pinnedCards,
    setPinnedCards,
    togglePin,
    isPinned
  };
};