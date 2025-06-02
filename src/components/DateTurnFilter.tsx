import { format } from 'date-fns';
import React from 'react';
import { Button, Col, Collapse, Form, Row } from 'react-bootstrap';
import { TurnoID } from '../helpers/constants';
import { resetHomeFilters, setHomeDate, setHomeTurn } from '../redux/store/features/homeSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import DatePickerComponent from './DatePickerComponent';
import SegmentedTurnBtn from './SegmentedTurnBtn';

interface DateTurnFilterProps {
  className?: string;
  show: boolean;
}

const DateTurnFilter: React.FC<DateTurnFilterProps> = ({ className = '', show }) => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const dispatch = useAppDispatch();
  const { date, turn } = useAppSelector((state) => state.home.filters);

  /* ----------------------------------------------- Handlers ----------------------------------------------- */
  const handleDateChange = (date: Date | null) => {
    if (date) {
      dispatch(setHomeDate(format(date, 'yyyy-MM-dd')));
    }
  };

  const handleTurnChange = (selectedTurn: TurnoID) => {
    dispatch(setHomeTurn(selectedTurn));
  };

  const handleReset = () => {
    dispatch(resetHomeFilters());
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
              all={true}
              fullWidth={true}
              id='home-filter-turn'
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
