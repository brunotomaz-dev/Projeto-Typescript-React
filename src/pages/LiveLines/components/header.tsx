import { format, parse, startOfDay } from 'date-fns';
import React, { useState } from 'react';
import { Button, Row, Stack } from 'react-bootstrap';
import { getTurnoName, TurnoID } from '../../../helpers/constants';
import { useFilters } from '../../../hooks/useFilters';
import { useFiltersVisibility } from '../../../hooks/useLiveFiltersVisibility';
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
  const { isDefault, turn, date } = useFilters('liveLines');

  // Hook para gerenciar visibilidade de filtros
  const { isVisible: showFilters, toggle: toggleFilters } = useFiltersVisibility('liveLines');

  /* ------------------------------------------------ REDUX ----------------------------------------------- */
  const selectedDate = useAppSelector((state) => state.liveLines.selectedDate);
  const selectedMachine = useAppSelector((state) => state.liveLines.selectedMachine);
  const isOpenedUpdateStops = useAppSelector((state) => state.liveLines.isOpenedUpdateStops);

  /* --------------------------------------------- Local State -------------------------------------------- */
  const [isOpened, setIsOpened] = useState(false);

  // Variáveis
  const nowDate = format(startOfDay(new Date()), 'yyyy-MM-dd');

  /* -------------------------------------------- Handlers ----------------------------------------------- */
  const handleToggleUpdateStops = () => {
    dispatch(setIsOpenedUpdateStops(!isOpenedUpdateStops));
  };

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
              {isOpenedUpdateStops ? 'Fechar Apontamentos' : 'Ver Apontamentos'}
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
        {!showFilters && !isDefault && (
          <div className='alert alert-info d-flex align-items-center mt-3'>
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
          </div>
        )}
      </Row>
      <ModalServiceHistory isOpened={isOpened} onHide={() => setIsOpened(false)} />
    </>
  );
};

export default LiveLinesHeader;
