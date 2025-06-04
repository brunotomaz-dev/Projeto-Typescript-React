import React from 'react';
import { Button, Col, Collapse, Form, Row } from 'react-bootstrap';
import { TurnoID } from '../helpers/constants';
import { useFilters } from '../hooks/useFilters';
import DatePickerComponent from './DatePickerComponent';
import SegmentedTurnBtn from './SegmentedTurnBtn';

interface DateTurnFilterProps {
  className?: string;
  show: boolean;
  scope?: string;
  all?: boolean;
  disabled?: Record<string, boolean>; // Adicionada essa propriedade
}

const DateTurnFilter: React.FC<DateTurnFilterProps> = ({
  className = '',
  show,
  scope = 'home',
  all = true,
  disabled = {}, // Valor default é objeto vazio (nenhum desabilitado)
}) => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { date, turn, setDateFilter, setTurnFilter, resetFilters } = useFilters(scope);

  /* ----------------------------------------------- Handlers ----------------------------------------------- */
  const handleDateChange = (newDate: Date | null) => {
    setDateFilter(newDate);
  };

  const handleTurnChange = (selectedTurn: TurnoID) => {
    setTurnFilter(selectedTurn);
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
        <Row className={`mb-3 px-2 py-3 bg-light rounded shadow gap-1 align-items-center ${className}`}>
          <Col xs={12} md className='mb-2 mb-md-0'>
            <Form.Group>
              <Form.Label className='me-1'>Data</Form.Label>
              <DatePickerComponent selectedDate={date} onDateChange={handleDateChange} />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} className='mb-2 mb-md-0'>
            <SegmentedTurnBtn
              turn={turn as TurnoID}
              onTurnChange={handleTurnChange}
              all={all}
              fullWidth={true}
              id={`${scope}-filter-turn`}
              disabled={disabled} // Passamos o objeto de turnos desabilitados
            />
          </Col>

          <Col xs={12} md className='mb-2 mb-md-0 d-flex justify-content-end'>
            <Button variant='outline-secondary' onClick={handleReset} className='w-50'>
              <i className='bi bi-arrow-counterclockwise me-1'></i>
              Resetar Filtros
            </Button>
          </Col>
        </Row>
      </div>
    </Collapse>
  );
};

export default DateTurnFilter;
