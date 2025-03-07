import React from 'react';
import MonthProdCardsMNT from './monthProduction.Management';
import TodayProductionCards from './todayProductionCard';

const ManagementProduction: React.FC = () => {
  // Hoje
  const today = new Date();
  // Primeiro dia do mês
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return (
    <>
      <TodayProductionCards today={today} />
      <MonthProdCardsMNT firstDay={firstDay} />
    </>
  );
};

export default ManagementProduction;
