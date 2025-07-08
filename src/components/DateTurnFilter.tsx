import React from 'react';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
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
  showLineSelector?: boolean;
  useAdvancedDatePicker?: boolean;
  compact?: boolean;
}

const DateTurnFilter: React.FC<DateTurnFilterProps> = ({
  className = '',
  show,
  scope = 'home',
  all = true,
  disabled = {},
  showLineSelector = false,
  useAdvancedDatePicker = false,
  compact = false,
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

    return <DatePickerComponent selectedDate={date} onDateChange={handleDateChange} />;
  };

  const renderTurnSelector = () => (
    <SegmentedTurnBtn
      turn={turn as TurnoID}
      onTurnChange={handleTurnChange}
      all={all}
      width={100}
      id={`${scope}-filter-turn`}
      disabled={disabled}
      small={compact}
    />
  );

  const renderLineSelector = () => {
    if (!showLineSelector) return null;
    return <ManagementLinePicker onChange={updateSelectedLines} scope={scope} />;
  };

  const renderResetButton = () => (
    <Button variant='outline-secondary' onClick={handleReset} className={!compact ? 'w-50' : ''}>
      <i className='bi bi-arrow-counterclockwise me-1'></i>
      Resetar Filtros
    </Button>
  );

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */

  return (
    <Collapse in={show}>
      <div>
        <Row
          className={`mb-3 px-2 py-3 bg-light rounded shadow ${compact ? 'gap-1' : 'gap-2'} align-items-center justify-content-between ${className}`}
        >
          <Col xs={12} lg={compact ? 'auto' : true} className='mb-2 mb-lg-0 px-0'>
            {renderDatePicker()}
          </Col>

          <Col xs={12} lg={compact ? 'auto' : 5} className='mb-2 mb-lg-0 px-0'>
            {renderTurnSelector()}
          </Col>

          {showLineSelector && (
            <Col xs={12} lg={compact ? 'auto' : true} className='mb-2 mb-lg-0 px-0'>
              {renderLineSelector()}
            </Col>
          )}

          <Col xs={12} lg={compact ? 'auto' : true} className='mb-2 mb-lg-0 d-flex justify-content-end px-0'>
            {renderResetButton()}
          </Col>
        </Row>
      </div>
    </Collapse>
  );
};

export default DateTurnFilter;
