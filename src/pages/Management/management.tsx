import React, { useState } from 'react';
import { BsBox } from 'react-icons/bs';
import { IoBarChart } from 'react-icons/io5';
import SegmentedButton from '../../components/SegmentedButton';
import PageLayout from '../../components/pageLayout';
import ManagementProduction from './components/management.Production';
import ManagementDashboards from './components/management.dashboards';

const Management: React.FC = () => {
  const buttonOptions = [
    {
      value: 'dashboards',
      label: 'Dashboards',
      icon: <IoBarChart className='mb-1 me-1' />,
    },
    { value: 'production', label: 'Produção', icon: <BsBox className='mb-1 me-1' /> },
  ];

  /* --------------------------------- INICIALIZAR ESTADOS LOCAIS --------------------------------- */
  const [btnChoice, setBtnChoice] = useState('dashboards');

  const handleBtnChange = (value: string) => {
    setBtnChoice(value);
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1 className='text-center p-2'>Gestão de Produção</h1>
      <SegmentedButton
        options={buttonOptions}
        value={btnChoice}
        onChange={handleBtnChange}
        key={'DashOrProd'}
      />
      <hr />
      {btnChoice === 'production' && <ManagementProduction />}
      {btnChoice === 'dashboards' && <ManagementDashboards />}
    </PageLayout>
  );
};

export default Management;
