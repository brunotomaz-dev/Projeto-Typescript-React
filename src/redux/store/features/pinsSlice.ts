import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PinnedCardsState {
  pinnedCards: number[];
  maxPins: number;
}

// Carregar pinos salvos do localStorage na inicialização
const loadPinnedCardsFromStorage = (): number[] => {
  try {
    const savedPins = localStorage.getItem('supervActionPinnedCards');
    const parsed = savedPins ? JSON.parse(savedPins) : [];
    return Array.isArray(parsed) ? parsed.filter((pin) => typeof pin === 'number') : [];
  } catch (error) {
    console.error('Erro ao carregar pins salvos:', error);
    return [];
  }
};

const initialState: PinnedCardsState = {
  pinnedCards: loadPinnedCardsFromStorage(),
  maxPins: 3
};

export const pinnedCardsSlice = createSlice({
  name: 'pinnedCards',
  initialState,
  reducers: {
    togglePin: (state, action: PayloadAction<number>) => {
      const recno = action.payload;
      const index = state.pinnedCards.indexOf(recno);
      
      if (index !== -1) {
        // Remover o pin
        state.pinnedCards.splice(index, 1);
      } else if (state.pinnedCards.length < state.maxPins) {
        // Adicionar o pin se não exceder o limite
        state.pinnedCards.push(recno);
      }
      
      // Persistir no localStorage
      localStorage.setItem('supervActionPinnedCards', JSON.stringify(state.pinnedCards));
    },
    
    cleanupPins: (state, action: PayloadAction<number[]>) => {
      // Manter apenas pinos que correspondem a recnos válidos
      state.pinnedCards = state.pinnedCards.filter(pin => 
        action.payload.includes(pin)
      );
      
      localStorage.setItem('supervActionPinnedCards', JSON.stringify(state.pinnedCards));
    },
    
    // Caso precise setar os pins manualmente
    setPins: (state, action: PayloadAction<number[]>) => {
      state.pinnedCards = action.payload.slice(0, state.maxPins);
      localStorage.setItem('supervActionPinnedCards', JSON.stringify(state.pinnedCards));
    }
  }
});

export const { togglePin, cleanupPins, setPins } = pinnedCardsSlice.actions;
export default pinnedCardsSlice.reducer;