import { format, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import DatePicker from 'react-datepicker';

interface iDashboardDatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

const DashboardDatePicker: React.FC<iDashboardDatePickerProps> = ({
  selectedDate,
  onChange,
}) => {
  /* -------------------------------------------- Datas ------------------------------------------- */
  const now = new Date();

  /* ------------------------------------------- Handles ------------------------------------------ */
  const handleChange = (date: Date | null): void => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      onChange(formattedDate);
    }
  };

  return (
    <>
      <DatePicker
        selected={parseISO(selectedDate)}
        onChange={(date: Date | null) => handleChange(date)}
        dateFormat='dd/MM/yyyy'
        className='form-control text-center'
        calendarIconClassName='mr-2'
        icon={'bi bi-calendar'}
        showIcon={true}
        popperClassName='custom-popper'
        calendarClassName='custom-calendar'
        locale={ptBR}
        minDate={parseISO('2024-08-01')}
        maxDate={now}
      />
    </>
  );
};

export default DashboardDatePicker;
