import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type DateMode = 'single' | 'range';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface iDashboardDatePickerProps {
  selectedDate?: string;
  selectedRange?: DateRange;
  onChange: (date: string | DateRange) => void;
  initialMode?: DateMode;
  showModeToggle?: boolean;
}

const DashboardDatePicker: React.FC<iDashboardDatePickerProps> = ({
  selectedDate,
  selectedRange,
  onChange,
  initialMode = 'single',
  showModeToggle = true,
}) => {
  /* ----------------------------------------- Estado Local ---------------------------------------- */
  const [dateMode, setDateMode] = useState<DateMode>(initialMode);

  // Estados locais para controlar as datas do datepicker
  const [startDateObj, setStartDateObj] = useState<Date | null>(
    selectedRange?.startDate ? parseISO(selectedRange.startDate) : null
  );
  const [endDateObj, setEndDateObj] = useState<Date | null>(
    selectedRange?.endDate ? parseISO(selectedRange.endDate) : null
  );
  const [singleDateObj, setSingleDateObj] = useState<Date | null>(
    selectedDate ? parseISO(selectedDate) : null
  );

  /* -------------------------------------------- Datas ------------------------------------------- */
  const now = new Date();
  const minDate = parseISO('2024-08-01');

  // Sincronizar estados locais quando as props mudam
  useEffect(() => {
    if (selectedDate && dateMode === 'single') {
      setSingleDateObj(parseISO(selectedDate));
    }
  }, [selectedDate, dateMode]);

  useEffect(() => {
    if (selectedRange && dateMode === 'range') {
      setStartDateObj(selectedRange.startDate ? parseISO(selectedRange.startDate) : null);
      setEndDateObj(selectedRange.endDate ? parseISO(selectedRange.endDate) : null);
    }
  }, [selectedRange, dateMode]);

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Manipular mudanças em data única
  const handleSingleDateChange = (date: Date | null): void => {
    setSingleDateObj(date);
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      onChange(formattedDate);
    }
  };

  // Manipular mudanças em intervalo de datas
  const handleRangeChange = (dates: [Date | null, Date | null]): void => {
    const [start, end] = dates;
    setStartDateObj(start);
    setEndDateObj(end);

    // Só notificar o componente pai quando ambas as datas estiverem selecionadas
    if (start && end) {
      const startFormatted = format(startOfDay(start), 'yyyy-MM-dd');
      const endFormatted = format(startOfDay(end), 'yyyy-MM-dd');
      onChange({ startDate: startFormatted, endDate: endFormatted });
    }
  };

  // Alternar entre os modos de data
  const toggleDateMode = () => {
    // Alternar para o outro modo
    const newMode = dateMode === 'single' ? 'range' : 'single';
    setDateMode(newMode);

    // Se alternar para modo único e tivermos um range, usar a data inicial do range
    if (newMode === 'single' && selectedRange?.startDate) {
      const startDate = selectedRange.startDate;
      setSingleDateObj(parseISO(startDate));
      onChange(startDate);
    }
    // Se alternar para modo range e tivermos uma data única, criar um range com a mesma data
    else if (newMode === 'range' && selectedDate) {
      const dateObj = parseISO(selectedDate);
      setStartDateObj(dateObj);
      setEndDateObj(dateObj);
      onChange({ startDate: selectedDate, endDate: selectedDate });
    }
  };

  /* ------------------------------------------- Renders ------------------------------------------ */
  // Renderização condicional do datepicker com base no modo
  const renderDatePicker = () => {
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

    if (dateMode === 'single') {
      return (
        <DatePicker
          {...commonProps}
          selected={singleDateObj}
          onChange={handleSingleDateChange}
          placeholderText='Selecione uma data'
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
        />
      );
    }
  };

  // Botões de predefinição rápida para períodos comuns
  const renderPresetButtons = () => {
    // Função para definir períodos predefinidos
    const setPresetRange = (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days + 1); // +1 para incluir o dia atual

      setStartDateObj(start);
      setEndDateObj(end);

      const startFormatted = format(startOfDay(start), 'yyyy-MM-dd');
      const endFormatted = format(startOfDay(end), 'yyyy-MM-dd');

      onChange({ startDate: startFormatted, endDate: endFormatted });
    };

    return (
      dateMode === 'range' && (
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
        {renderDatePicker()}

        {/* Botão de toggle */}
        {showModeToggle && (
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id='toggle-mode-tooltip'>
                {dateMode === 'single' ? 'Mudar para período' : 'Mudar para data única'}
              </Tooltip>
            }
          >
            <Button
              variant='light'
              // size='sm'
              className='toggle-date-mode-btn ms-1 py-1'
              onClick={toggleDateMode}
              aria-label={dateMode === 'single' ? 'Mudar para período' : 'Mudar para data única'}
            >
              <i className={`bi ${dateMode === 'single' ? 'bi-calendar-range' : 'bi-calendar-date'}`}></i>
            </Button>
          </OverlayTrigger>
        )}
      </div>

      {/* Botões de predefinição */}
      {renderPresetButtons()}
    </div>
  );
};

export default DashboardDatePicker;
