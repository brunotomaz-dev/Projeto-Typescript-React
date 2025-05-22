import React from 'react';
import MonthProdCardsMNT from './components/monthProduction.Management';
import CxsPessoaHeatmap from './components/prod.CxsPessoa';
import TodayProductionCards from './components/todayProductionCard';

const ManagementProduction: React.FC = () => {
  // Hoje
  const today = new Date();
  // Primeiro dia do mês
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return (
    <>
      <h1 className='text-center'>Dados de Produção</h1>
      <hr />
      <CxsPessoaHeatmap />
      <h3 className='text-center mt-3'>Produção do Dia</h3>
      <TodayProductionCards today={today} />
      <h3 className='text-center mt-3'>Produção do Mês atual e dos últimos 2 meses</h3>
      <MonthProdCardsMNT firstDay={firstDay} />
    </>
  );
};

export default ManagementProduction;
