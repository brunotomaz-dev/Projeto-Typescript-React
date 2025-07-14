import React from 'react';
import { Button, Card, Col, FormControl, Row } from 'react-bootstrap';
import DatePickerComponent from '../../../components/DatePickerComponent';
import SegmentedTurnBtn from '../../../components/SegmentedTurnBtn';
import { TurnoID } from '../../../helpers/constants';
import { useFilters } from '../../../hooks/useFilters';

interface iSelectorsOperationProps {
  scope: string;
}

const SelectorsOperation: React.FC<iSelectorsOperationProps> = ({ scope }) => {
  const { date, turn, selectedLines, updateSelectedDate, updateSelectedLines, updateTurn, resetFilters } =
    useFilters(scope);

  const handleDateChange = (newDate: Date | null) => {
    updateSelectedDate(newDate);
  };

  const handleTurnChange = (selectedTurn: string) => {
    updateTurn(selectedTurn as TurnoID);
  };

  const handleReset = () => {
    resetFilters();
  };

  const renderDatePicker = () => {
    return <DatePickerComponent selectedDate={date} onDateChange={handleDateChange} />;
  };

  const renderResetButton = () => (
    <Button variant='outline-secondary' onClick={handleReset}>
      <i className='bi bi-arrow-counterclockwise me-1'></i>
      Resetar Filtros
    </Button>
  );

  const linhas = new Array(14).fill(null).map((_, i) => (
    <option key={i + 1} value={i + 1}>
      Linha {i + 1}
    </option>
  ));

  const renderLineSelector = () => (
    <FormControl
      as='select'
      className='form-select'
      value={selectedLines.length > 0 ? selectedLines[0] : ''}
      onChange={(e) => updateSelectedLines([parseInt(e.target.value)])}
    >
      <option value='' disabled>
        Selecione uma linha
      </option>
      {linhas}
    </FormControl>
  );

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Card className='shadow border-0 bg-light p-3 mb-3'>
      <Row className='g-3 align-items-center justify-content-between'>
        <Col xs={12} xl='auto'>
          {renderDatePicker()}
        </Col>
        <Col xs={12} xl='auto'>
          <SegmentedTurnBtn
            turn={turn}
            onTurnChange={handleTurnChange}
            width={100}
            id='turn-selector-operation'
            small={true}
          />
        </Col>
        <Col xs={12} xl='auto'>
          {renderLineSelector()}
        </Col>
        <Col xs={12} xl='auto' className='d-flex justify-content-end'>
          {renderResetButton()}
        </Col>
      </Row>
    </Card>
  );
};

export default SelectorsOperation;
