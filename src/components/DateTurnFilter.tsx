import React from 'react';
import { Button, Col, Collapse, Form, Row, Stack } from 'react-bootstrap';
import { TurnoID } from '../helpers/constants';
import { useFilters } from '../hooks/useFilters';
import DashboardDatePicker from '../pages/Management/components/management.d.datepicker';
import ManagementLinePicker from '../pages/Management/components/management.d.linepicker';
import DatePickerComponent from './DatePickerComponent';
import SegmentedTurnBtn from './SegmentedTurnBtn';

interface DateTurnFilterProps {
  className?: string;
  show: boolean;
  scope?: string;
  all?: boolean;
  disabled?: Record<string, boolean>;
  // Novas props para controlar funcionalidades
  showLineSelector?: boolean;
  useAdvancedDatePicker?: boolean;
  layout?: 'horizontal' | 'stacked';
}

const DateTurnFilter: React.FC<DateTurnFilterProps> = ({
  className = '',
  show,
  scope = 'home',
  all = true,
  disabled = {},
  showLineSelector = false,
  useAdvancedDatePicker = false,
  layout = 'stacked',
}) => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { date, turn, updateSelectedDate, updateTurn, updateSelectedLines, resetFilters } = useFilters(scope);

  /* ----------------------------------------------- Handlers ----------------------------------------------- */
  const handleDateChange = (newDate: Date | null) => {
    updateSelectedDate(newDate);
  };

  const handleTurnChange = (selectedTurn: string | TurnoID) => {
    updateTurn(selectedTurn as TurnoID);
  };

  const handleReset = () => {
    resetFilters();
  };

  /* ----------------------------------------------- Renders ------------------------------------------------ */
  const renderDatePicker = () => {
    if (useAdvancedDatePicker) {
      return <DashboardDatePicker scope={scope} />;
    }

    return (
      <Form.Group>
        <Form.Label className='me-1'>Data</Form.Label>
        <DatePickerComponent selectedDate={date} onDateChange={handleDateChange} />
      </Form.Group>
    );
  };

  const renderTurnSelector = () => (
    <SegmentedTurnBtn
      turn={turn as TurnoID}
      onTurnChange={handleTurnChange}
      all={all}
      width={100}
      id={`${scope}-filter-turn`}
      disabled={disabled}
      small={layout === 'horizontal'}
    />
  );

  const renderLineSelector = () => {
    if (!showLineSelector) return null;
    return <ManagementLinePicker onChange={updateSelectedLines} scope={scope} />;
  };

  const renderResetButton = () => (
    <Button variant='outline-secondary' onClick={handleReset} className={layout === 'stacked' ? 'w-50' : ''}>
      <i className='bi bi-arrow-counterclockwise me-1'></i>
      Resetar Filtros
    </Button>
  );

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */

  if (layout === 'horizontal') {
    // Layout horizontal compacto (para Management)
    return (
      <Collapse in={show}>
        <div>
          <Row className={`mb-3 px-1 mx-1 py-3 bg-light rounded shadow bg-light ${className}`}>
            <Stack direction='horizontal' gap={1} className='justify-content-around'>
              {renderDatePicker()}
              <span style={{ width: 'fit-content' }}>{renderTurnSelector()}</span>
              {renderLineSelector()}
              {renderResetButton()}
            </Stack>
          </Row>
        </div>
      </Collapse>
    );
  }

  // Layout stacked padrão (para Home, LiveLines, Supervision)
  return (
    <Collapse in={show}>
      <div>
        <Row className={`mb-3 px-2 py-3 bg-light rounded shadow gap-1 align-items-center ${className}`}>
          <Col xs={12} md className='mb-2 mb-md-0'>
            {renderDatePicker()}
          </Col>

          <Col xs={12} md={5} className='mb-2 mb-md-0'>
            {renderTurnSelector()}
          </Col>

          {showLineSelector && (
            <Col xs={12} md className='mb-2 mb-md-0'>
              {renderLineSelector()}
            </Col>
          )}

          <Col xs={12} md className='mb-2 mb-md-0 d-flex justify-content-end'>
            {renderResetButton()}
          </Col>
        </Row>
      </div>
    </Collapse>
  );
};

export default DateTurnFilter;
