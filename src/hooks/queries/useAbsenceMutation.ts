import { useMutation } from '@tanstack/react-query';
import {
  createAbsenceData,
  createPresenceData,
  deleteAbsenceData,
  updateAbsenceData,
  updatePresenceData,
} from '../../api/apiRequests';
import { iAbsenceForm, iPresence } from '../../interfaces/Absence.interface';
import { queryClient } from '../../lib/react-query';
import { useAppSelector } from '../../redux/store/hooks';
import { useFilters } from '../useFilters';

export const useAbsenceMutation = (scope = 'home') => {
  const userName = useAppSelector((state) => state.user.fullName);
  const { date } = useFilters(scope);

  const createAbsence = useMutation({
    mutationFn: async (data: iAbsenceForm) => await createAbsenceData({ ...data, usuario: userName }),
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['absence', 'day', date],
      });
    },
  });

  const updateAbsence = useMutation({
    mutationFn: async (data: iAbsenceForm & { recno: number }) => {
      await updateAbsenceData({ ...data, usuario: userName });
    },
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['absence'],
      });
    },
  });

  const deleteAbsence = useMutation({
    mutationFn: async (recno: number) => {
      await deleteAbsenceData(recno);
      return recno;
    },
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['absence'],
      });
    },
  });

  const createPresence = useMutation({
    mutationFn: async (data: iPresence) => await createPresenceData(data),
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['presence'],
      });
    },
  });

  const updatePresence = useMutation({
    mutationFn: async (data: iPresence) => await updatePresenceData(data),
    onSuccess: () => {
      // Invalida a query para forçar uma nova busca
      queryClient.invalidateQueries({
        queryKey: ['presence'],
      });
    },
  });

  return {
    createAbsence: (data: iAbsenceForm, options?: { onSuccess?: () => void; onError?: () => void }) =>
      createAbsence.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    updateAbsence: (
      data: iAbsenceForm & { recno: number },
      options?: { onSuccess?: () => void; onError?: () => void }
    ) =>
      updateAbsence.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    deleteAbsence: (recno: number, options?: { onSuccess?: () => void; onError?: () => void }) =>
      deleteAbsence.mutate(recno, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    createPresence: (data: iPresence, options?: { onSuccess?: () => void; onError?: () => void }) =>
      createPresence.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    updatePresence: (data: iPresence, options?: { onSuccess?: () => void; onError?: () => void }) =>
      updatePresence.mutate(data, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: () => {
          options?.onError?.();
        },
      }),
    isSuccess:
      createAbsence.isSuccess ||
      updateAbsence.isSuccess ||
      deleteAbsence.isSuccess ||
      createPresence.isSuccess ||
      updatePresence.isSuccess,
    error:
      createAbsence.error ||
      updateAbsence.error ||
      deleteAbsence.error ||
      createPresence.error ||
      updatePresence.error,
  };
};
