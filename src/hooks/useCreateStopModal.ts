import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { insertMaquinaIHM } from '../api/apiRequests';
import { iMaquinaIHM } from '../pages/LiveLines/interfaces/maquinaIhm.interface';
import { closeCreateModal } from '../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import { useFilters } from './useFilters';
import { useToast } from './useToast';

export const useCreateStopModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { date: selectedDate, turn: selectedShift } = useFilters('liveLines');

  // Obter estado do modal e outros dados do Redux
  const isVisible = useAppSelector((state) => state.liveLines.isCreateModalOpen);
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);

  const closeModal = () => {
    dispatch(closeCreateModal());
  };

  const saveRecord = async (dataToSave: Partial<iMaquinaIHM>): Promise<boolean> => {
    setIsLoading(true);

    try {
      await insertMaquinaIHM(dataToSave as iMaquinaIHM);

      // Invalidar a query para recarregar os dados
      queryClient.invalidateQueries({
        queryKey: ['maquinaIHM', selectedDate, selectedShift, selectedLine, selectedMachine],
      });

      showToast('Apontamento registrado com sucesso!', 'success');
      closeModal();
      return true;
    } catch (error) {
      console.error('Erro ao registrar apontamento:', error);
      showToast('Erro ao registrar apontamento', 'danger');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isVisible,
    isLoading,
    selectedLine,
    selectedMachine,
    selectedDate,
    closeModal,
    saveRecord,
  };
};
