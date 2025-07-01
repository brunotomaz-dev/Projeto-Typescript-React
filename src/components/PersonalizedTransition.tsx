import { format, parse } from 'date-fns';
import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';
import { getTurnoName, TurnoID } from '../helpers/constants';
import { useFilters } from '../hooks/useFilters';
import { useFiltersVisibility } from '../hooks/useFiltersVisibility';
import { useFiltersWithLines } from '../hooks/useFiltersWithLines';

interface iProps {
  scope: string;
  filtersWithLines?: boolean;
}

const PersonalizedTransition: React.FC<iProps> = ({ scope, filtersWithLines }) => {
  const { isDefault, resetFilters, turn } = filtersWithLines ? useFiltersWithLines(scope) : useFilters(scope);
  const date = filtersWithLines ? useFiltersWithLines(scope).selectedDate : useFilters(scope).date;

  const { isVisible, resetVisibility } = useFiltersVisibility(scope);

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
          Exibindo dados de: <strong>{format(parse(date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}</strong>
          {turn !== 'ALL' && (
            <>
              {' '}
              - Turno: <strong>{getTurnoName(turn as TurnoID)}</strong>
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

export default PersonalizedTransition;
