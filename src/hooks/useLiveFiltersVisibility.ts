import { useCallback } from 'react';
import { setFiltersVisibility } from '../redux/store/features/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';

export const useFiltersVisibility = (scope = 'home') => {
  const dispatch = useAppDispatch();
  // Obter estado da visibilidade dos filtros do Redux
  const isVisible = useAppSelector((state) => state.uiState.filtersVisibility[scope] || false);

  // Toggle de visibilidade
  const toggle = useCallback(() => {
    dispatch(setFiltersVisibility({ scope, isVisible: !isVisible }));
  }, [dispatch, scope, isVisible]);

  // Definir visibilidade explicitamente
  const setVisible = useCallback(
    (visible: boolean) => {
      dispatch(setFiltersVisibility({ scope, isVisible: visible }));
    },
    [dispatch, scope]
  );

  return { isVisible, toggle, setVisible };
};
