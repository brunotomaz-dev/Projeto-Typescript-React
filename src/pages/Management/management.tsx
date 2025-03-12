import React, { useState } from 'react';
import PageLayout from '../../components/pageLayout';
import MNGMainSegmentedBtn from './components/management.MainSegmentedBtn';
import ManagementProduction from './components/management.Production';

const Management: React.FC = () => {
  /* -------------------------------------------- DATAS ------------------------------------------- */
  // Hoje
  const today = new Date();
  // Primeiro dia do mês
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  /* --------------------------------- INICIALIZAR ESTADOS LOCAIS --------------------------------- */
  const [btnChoice, setBtnChoice] = useState('production');

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1 className='text-center p-2'>Gestão de Produção</h1>
      <MNGMainSegmentedBtn setBtnChoice={setBtnChoice} />
      <hr />
      {btnChoice === 'production' && <ManagementProduction />}
    </PageLayout>
  );
};

export default Management;
