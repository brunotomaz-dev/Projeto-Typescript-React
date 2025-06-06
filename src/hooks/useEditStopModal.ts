import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { updateHistoricalAppointmentRecord, updateMaquinaIHM } from '../api/apiRequests';
import { iMaquinaIHM } from '../pages/LiveLines/interfaces/maquinaIhm.interface';
import { closeEditModal } from '../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import { useFilters } from './useFilters';
import { useToast } from './useToast';

export const useEditStopModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { date: selectedDate, turn: selectedShift } = useFilters('liveLines');

  // Obter estado do modal do Redux
  const isVisible = useAppSelector((state) => state.liveLines.isEditModalOpen);
  const selectedStop = useAppSelector((state) => state.liveLines.stopToEdit);

  const closeModal = () => {
    dispatch(closeEditModal());
  };

  const saveChanges = async (dataToSave: iMaquinaIHM): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Verificar se é um registro histórico ou atual
      if ('_isHistorical' in dataToSave) {
        // Remover propriedades auxiliares antes de enviar
        const { _isHistorical, ...cleanData } = dataToSave;
        await updateHistoricalAppointmentRecord(cleanData);
        showToast('Registro histórico atualizado com sucesso!', 'success');
      } else {
        // Usar a API normal para registros do dia atual
        await updateMaquinaIHM(dataToSave);
        showToast('Parada atualizada com sucesso!', 'success');
      }

      // Invalidar a query para recarregar os dados
      queryClient.invalidateQueries({
        queryKey: ['maquinaIHM', selectedDate, selectedShift],
      });

      closeModal();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar parada:', error);
      showToast('Erro ao atualizar parada', 'danger');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isVisible,
    isLoading,
    selectedStop,
    closeModal,
    saveChanges,
  };
};
