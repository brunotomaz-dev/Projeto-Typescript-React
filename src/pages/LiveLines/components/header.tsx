import { format, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import { Button, Row, Stack } from 'react-bootstrap';
import AnimatedFilterNotification from '../../../components/AnimatedFilterNotification';
import { useFiltersVisibility } from '../../../hooks/useFiltersVisibility';
import { usePermissions } from '../../../hooks/usePermissions';
import { setIsOpenedUpdateStops } from '../../../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';
import ModalServiceHistory from './liveLines.ModalHistoricService';

const LiveLinesHeader: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { hasResourcePermission, hasElementAccess } = usePermissions();
  const canView = hasResourcePermission('ihm_appointments', 'view');
  const hasBtnHistAccess = hasElementAccess('btn_OS_preventive_history');
  const dispatch = useAppDispatch();

  // Hook para gerenciar visibilidade de filtros
  const {
    isVisible: showFilters,
    toggle: toggleFilters,
    resetVisibility,
  } = useFiltersVisibility('liveLines');

  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const selectedDate = useAppSelector((state) => state.liveLines.selectedDate);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);
  const isOpenedUpdateStops = useAppSelector((state) => state.liveLines.isOpenedUpdateStops);

  /* ---------------------------------------------- Local State ---------------------------------------------- */
  const [isOpened, setIsOpened] = useState(false);

  /* ----------------------------------------------- Variáveis ----------------------------------------------- */
  const nowDate = format(startOfDay(new Date()), 'yyyy-MM-dd');

  /* ------------------------------------------------ Handlers ----------------------------------------------- */
  const handleToggleUpdateStops = () => {
    dispatch(setIsOpenedUpdateStops(!isOpenedUpdateStops));
  };

  /* ------------------------------------------------ Effects ------------------------------------------------ */
  // Resetar a visibilidade dos filtros quando o componente é desmontado
  React.useEffect(() => {
    return () => {
      resetVisibility();
    };
  }, [resetVisibility]);

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Row className='m-2'>
        <h1 className='text-center p-2'>
          {selectedDate === nowDate ? 'Linhas em Tempo Real' : 'Linhas Histórico'}
        </h1>
        <h5 className='text-center'>{`(${selectedMachine || '-'})`}</h5>
        <Stack direction='horizontal' gap={2}>
          {/* Botão para mostrar/ocultar filtros */}
          <Button variant={showFilters ? 'secondary' : 'outline-secondary'} size='sm' onClick={toggleFilters}>
            <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>

          {canView && (
            <Button
              variant={isOpenedUpdateStops ? 'secondary' : 'outline-secondary'}
              size='sm'
              onClick={handleToggleUpdateStops}
            >
              <i className='bi bi-bar-chart-steps me-2'></i>
              {isOpenedUpdateStops ? 'Ocultar Apontamentos' : 'Mostrar Apontamentos'}
            </Button>
          )}
          {hasBtnHistAccess && (
            <Button variant='outline-secondary' onClick={() => setIsOpened(true)} size='sm'>
              <i className='bi bi-clock-history me-2'></i>
              Ver Histórico
            </Button>
          )}
        </Stack>
        <AnimatedFilterNotification scope='liveLines' />
      </Row>
      <ModalServiceHistory isOpened={isOpened} onHide={() => setIsOpened(false)} />
    </>
  );
};

export default LiveLinesHeader;
