import { format, parse, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import { Button, Row, Stack } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { getTurnoName, TurnoID } from '../../../helpers/constants';
import { useFilters } from '../../../hooks/useFilters';
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
  const { isDefault, turn, date, resetFilters } = useFilters('liveLines');

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

  const handleResetFilters = () => {
    resetFilters();
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
        {/* Exibir resumo dos filtros aplicados quando os filtros estão escondidos mas ativos */}
        <CSSTransition in={!showFilters && !isDefault} timeout={300} classNames='filter-alert' unmountOnExit>
          <div className='m-0 p-0'>
            <span className='badge bg-info text-dark ms-2 my-1'>Filtros ativos</span>
            <div className='alert alert-info d-flex align-items-center m-0'>
              <i className='bi bi-info-circle-fill me-2'></i>
              <span>
                Exibindo dados salvos de:{' '}
                <strong>{format(parse(date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}</strong>
                {turn !== 'ALL' && (
                  <>
                    {' '}
                    - Turno: <strong>{getTurnoName(turn as TurnoID)}</strong>
                  </>
                )}
              </span>
              <Button variant='outline-info' size='sm' className='ms-2' onClick={handleResetFilters}>
                <i className='bi bi-arrow-counterclockwise'></i> Resetar Filtros
              </Button>
            </div>
          </div>
        </CSSTransition>
      </Row>
      <ModalServiceHistory isOpened={isOpened} onHide={() => setIsOpened(false)} />
    </>
  );
};

export default LiveLinesHeader;
