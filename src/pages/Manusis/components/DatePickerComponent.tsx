import { parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import DatePicker from 'react-datepicker';

interface iDatePickerProps {
  selectedDate: string;
  onDateChange: (date: Date | null) => void;
}

const DatePickerComponent: React.FC<iDatePickerProps> = ({ onDateChange, selectedDate }) => {
  return (
    <DatePicker
      selected={parseISO(selectedDate)}
      className='form-control text-center'
      locale={ptBR}
      dateFormat='dd/MM/yyyy'
      icon='bi bi-calendar-day'
      popperClassName='custom-popper'
      calendarClassName='custom-calendar'
      showIcon={true}
      onChange={onDateChange}
      minDate={parseISO('2025-01-01')}
      maxDate={startOfDay(new Date())}
    />
  );
};

export default DatePickerComponent;
