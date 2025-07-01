import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFiltersWithLines } from '../../../hooks/useFiltersWithLines';

interface iDatePickerProps {
  scope?: string;
}

const DashboardDatePicker: React.FC<iDatePickerProps> = ({ scope = 'management' }) => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const {
    updateFilterType,
    updateSelectedDate,
    updateSelectedDateRange,
    selectedDate,
    selectedRange,
    type: dateType,
  } = useFiltersWithLines(scope);

  /* ----------------------------------------- Estado Local ---------------------------------------- */

  // Estados locais para controlar as datas do datepicker
  const [startDateObj, setStartDateObj] = useState<Date | null>(
    selectedRange?.startDate ? parseISO(selectedRange.startDate) : null
  );
  const [endDateObj, setEndDateObj] = useState<Date | null>(
    selectedRange?.endDate ? parseISO(selectedRange.endDate) : null
  );

  /* -------------------------------------------- Datas ------------------------------------------- */
  const now = new Date();
  const minDate = parseISO('2024-08-01');

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Manipular mudanças em data única
  const handleSingleDateChange = (date: Date | null): void => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      updateSelectedDate(formattedDate);
    }
  };

  // Manipular mudanças em intervalo de datas
  const handleRangeChange = (dates: [Date | null, Date | null]): void => {
    const [start, end] = dates;

    setStartDateObj(start);
    setEndDateObj(end);

    // Só passar para o hook quando ambas as datas estiverem selecionadas
    if (start && end) {
      const startFormatted = format(startOfDay(start), 'yyyy-MM-dd');
      const endFormatted = format(startOfDay(end), 'yyyy-MM-dd');
      updateSelectedDateRange(startFormatted, endFormatted);
    }
  };

  // Alternar entre os modos de data
  const toggleDateMode = () => {
    // Alternar para o outro modo
    const newMode = dateType === 'single' ? 'range' : 'single';
    updateFilterType(newMode);

    // Se alternar para modo único e tivermos um range, usar a data inicial do range
    if (newMode === 'single' && selectedRange?.startDate) {
      const startDate = selectedRange.startDate;
      // setSingleDateObj(parseISO(startDate));
      updateSelectedDate(startDate);
    }
    // Se alternar para modo range e tivermos uma data única, criar um range com a mesma data
    else if (newMode === 'range' && selectedDate) {
      const dateObj = parseISO(selectedDate);
      setStartDateObj(dateObj);
      setEndDateObj(dateObj);
      updateSelectedDateRange(selectedDate, selectedDate);
    }
  };

  /* ------------------------------------------- Renders ------------------------------------------ */
  // Renderização condicional do datepicker com base no modo
  const customDatePicker = () => {
    const commonProps = {
      dateFormat: 'dd/MM/yyyy',
      className: 'form-control text-center',
      showIcon: true,
      icon: <i className='bi bi-calendar me-2'></i>,
      popperClassName: 'custom-popper',
      calendarClassName: 'custom-calendar',
      locale: ptBR,
      minDate: minDate,
      maxDate: now,
      isClearable: false,
    };

    if (dateType === 'single') {
      return (
        <DatePicker
          {...commonProps}
          selected={parseISO(selectedDate)}
          onChange={handleSingleDateChange}
          placeholderText='Selecione uma data'
          key={`single-${selectedDate}`}
        />
      );
    } else {
      return (
        <DatePicker
          {...commonProps}
          selectsRange
          startDate={startDateObj}
          endDate={endDateObj}
          onChange={handleRangeChange}
          placeholderText='Selecione um período'
          key={`range-${dateType}`}
        />
      );
    }
  };

  // Função para definir períodos predefinidos
  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1); // +1 para incluir o dia atual

    setStartDateObj(start);
    setEndDateObj(end);

    const startFormatted = format(startOfDay(start), 'yyyy-MM-dd');
    const endFormatted = format(startOfDay(end), 'yyyy-MM-dd');

    updateSelectedDateRange(startFormatted, endFormatted);
  };

  // Botões de predefinição rápida para períodos comuns
  const PresetButtons: React.FC = () => {
    return (
      dateType === 'range' && (
        <div className='d-flex gap-2 mt-2 preset-buttons'>
          <Button
            size='sm'
            variant='outline-secondary'
            className='py-0 px-2'
            onClick={() => setPresetRange(7)}
          >
            Últimos 7 dias
          </Button>
          <Button
            size='sm'
            variant='outline-secondary'
            className='py-0 px-2'
            onClick={() => setPresetRange(30)}
          >
            Últimos 30 dias
          </Button>
        </div>
      )
    );
  };

  return (
    <div className='date-picker-container position-relative'>
      {/* Input do DatePicker */}
      <div className='datepicker-with-toggle align-items-center d-flex'>
        {customDatePicker()}

        {/* Botão de toggle */}
        <OverlayTrigger
          placement='top'
          overlay={
            <Tooltip id='toggle-mode-tooltip'>
              {dateType === 'single' ? 'Mudar para período' : 'Mudar para data única'}
            </Tooltip>
          }
        >
          <Button
            variant='light'
            // size='sm'
            className='toggle-date-mode-btn ms-1 py-1'
            onClick={toggleDateMode}
            aria-label={dateType === 'single' ? 'Mudar para período' : 'Mudar para data única'}
          >
            <i className={`bi ${dateType === 'single' ? 'bi-calendar-range' : 'bi-calendar-date'}`}></i>
          </Button>
        </OverlayTrigger>
      </div>
      {/* Botões de predefinição */}
      <PresetButtons />
    </div>
  );
};

export default DashboardDatePicker;
