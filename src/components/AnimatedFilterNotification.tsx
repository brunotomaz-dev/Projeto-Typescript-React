import { format, parseISO } from 'date-fns';
import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { getTurnoName, TurnoID } from '../helpers/constants';
import { useFilters } from '../hooks/useFilters';
import { useFiltersVisibility } from '../hooks/useFiltersVisibility';

interface iProps {
  scope: string;
}

const AnimatedFilterNotification: React.FC<iProps> = ({ scope }) => {
  const { isDefault, resetFilters, turn, date, selectedLines, type, selectedRange } = useFilters(scope);

  const { isVisible, resetVisibility } = useFiltersVisibility(scope);

  const labelDate =
    type === 'single'
      ? format(parseISO(date), 'dd/MM/yyyy')
      : `${format(parseISO(selectedRange.startDate), 'dd/MM/yyyy')} à ${format(parseISO(selectedRange.endDate), 'dd/MM/yyyy')}`;

  const linesLabel = selectedLines.map((line) => line.toString()).join(', ');

  const renderLines = selectedLines.length < 14 && selectedLines.length > 0;

  // Criar uma ref para o elemento que será animado
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleResetFilters = () => {
    resetFilters();
    resetVisibility();
  };

  return (
    <CSSTransition
      in={!isVisible && !isDefault}
      timeout={300}
      classNames='filter-alert'
      unmountOnExit
      nodeRef={nodeRef} // Passar a ref para o CSSTransition
    >
      <div ref={nodeRef} className='alert alert-info d-flex align-items-center my-1'>
        <i className='bi bi-info-circle-fill me-2'></i>
        <span>
          Exibindo dados de: <strong>{labelDate}</strong>
          {turn !== 'ALL' && (
            <>
              {' '}
              - Turno: <strong>{getTurnoName(turn as TurnoID)}</strong>
            </>
          )}
          {renderLines && (
            <>
              {' '}
              - {selectedLines.length > 1 ? 'Linhas: ' : 'Linha: '} <strong>{linesLabel}</strong>
            </>
          )}
        </span>
        <Button variant='outline-info' size='sm' className='ms-2' onClick={handleResetFilters}>
          <i className='bi bi-arrow-clockwise me-2'></i>
          Limpar Filtros
        </Button>
      </div>
    </CSSTransition>
  );
};

export default AnimatedFilterNotification;
