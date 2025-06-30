import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  setFilterType,
  setSelectedDate,
  setSelectedRange,
} from '../../../redux/store/features/managementSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

const DashboardDatePicker: React.FC = () => {
  /* ------------------------------------------------- Redux ------------------------------------------------- */
  const dispatch = useAppDispatch();
  const {
    type: dateType,
    selectedDate,
    selectedRange,
  } = useAppSelector((state) => state.management.filterState);

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
      dispatch(setSelectedDate(formattedDate));
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
      dispatch(setSelectedRange({ startDate: startFormatted, endDate: endFormatted }));
    }
  };

  // Alternar entre os modos de data
  const toggleDateMode = () => {
    // Alternar para o outro modo
    const newMode = dateType === 'single' ? 'range' : 'single';
    dispatch(setFilterType(newMode));

    // Se alternar para modo único e tivermos um range, usar a data inicial do range
    if (newMode === 'single' && selectedRange?.startDate) {
      const startDate = selectedRange.startDate;
      // setSingleDateObj(parseISO(startDate));
      dispatch(setSelectedDate(startDate));
    }
    // Se alternar para modo range e tivermos uma data única, criar um range com a mesma data
    else if (newMode === 'range' && selectedDate) {
      const dateObj = parseISO(selectedDate);
      setStartDateObj(dateObj);
      setEndDateObj(dateObj);
      dispatch(setSelectedRange({ startDate: selectedDate, endDate: selectedDate }));
    }
  };

  /* ------------------------------------------- Renders ------------------------------------------ */
  // Renderização condicional do datepicker com base no modo
  const CustomDatePicker: React.FC = () => {
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

  // Função para definir períodos predefinidos
  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1); // +1 para incluir o dia atual

    setStartDateObj(start);
    setEndDateObj(end);

    const startFormatted = format(startOfDay(start), 'yyyy-MM-dd');
    const endFormatted = format(startOfDay(end), 'yyyy-MM-dd');

    dispatch(setSelectedRange({ startDate: startFormatted, endDate: endFormatted }));
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
        <CustomDatePicker />

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
