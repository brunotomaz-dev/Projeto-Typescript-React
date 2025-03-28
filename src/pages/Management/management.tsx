import React, { useState } from 'react';
import PageLayout from '../../components/pageLayout';
import MNGMainSegmentedBtn from './components/management.MainSegmentedBtn';
import ManagementProduction from './components/management.Production';
import ManagementDashboards from './components/management.dashboards';

const Management: React.FC = () => {
  /* --------------------------------- INICIALIZAR ESTADOS LOCAIS --------------------------------- */
  const [btnChoice, setBtnChoice] = useState('dashboards');

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1 className='text-center p-2'>Gestão de Produção</h1>
      <MNGMainSegmentedBtn setBtnChoice={setBtnChoice} />
      <hr />
      {btnChoice === 'production' && <ManagementProduction />}
      {btnChoice === 'dashboards' && <ManagementDashboards />}
    </PageLayout>
  );
};

export default Management;
