import React from 'react';
import { Button, Collapse, Row, Stack } from 'react-bootstrap';
import { TurnoID } from '../helpers/constants';
import { useFiltersWithLines } from '../hooks/useFiltersWithLines';
import DashboardDatePicker from '../pages/Management/components/management.d.datepicker';
import ManagementLinePicker from '../pages/Management/components/management.d.linepicker';
import SegmentedTurnBtn from './SegmentedTurnBtn';

interface iFilterProps {
  className?: string;
  show: boolean;
  scope?: string;
  all?: boolean;
}

const DateTurnLineFilter: React.FC<iFilterProps> = ({
  className,
  show,
  scope = 'management',
  all = true,
}) => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { turn, updateTurn, updateSelectedLines, resetFilters } = useFiltersWithLines(scope);

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  const handleTurnChange = (selectedTurn: string) => {
    // Lógica para lidar com a mudança de turno
    updateTurn(selectedTurn as TurnoID);
  };

  const handleReset = () => {
    resetFilters();
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Collapse in={show}>
      <div>
        <Row className={`mb-3 px-1 mx-1 py-3 bg-light rounded shadow bg-light ${className}`}>
          <Stack direction='horizontal' gap={1} className='justify-content-around'>
            <DashboardDatePicker scope={scope} />
            <span style={{ width: 'fit-content' }}>
              <SegmentedTurnBtn
                all={all}
                onTurnChange={handleTurnChange}
                turn={turn}
                id={`${scope}-management`}
                small
                width={100}
              />
            </span>
            <ManagementLinePicker onChange={updateSelectedLines} scope='management' />
            <Button variant='outline-secondary' onClick={handleReset}>
              <i className='bi bi-arrow-counterclockwise me-1'></i>
              Resetar Filtros
            </Button>
          </Stack>
        </Row>
      </div>
    </Collapse>
  );
};

export default DateTurnLineFilter;
