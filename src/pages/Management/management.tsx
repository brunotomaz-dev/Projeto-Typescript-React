import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import PageLayout from '../../components/pageLayout';
import ManagementProduction from './components/management.Production';

const Management: React.FC = () => {
  /* ------------------------------------------------- DATAS ------------------------------------------------ */
  // Hoje
  const today = new Date();
  // Primeiro dia do mês
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  /* -------------------------------------- INICIALIZAR ESTADOS LOCAIS -------------------------------------- */

  /* -------------------------------------------------------------------------------------------------------- */
  /*                                                  Layout                                                  */
  /* -------------------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1 className='text-center p-2'>Gestão de Produção</h1>
      <Tabs defaultActiveKey='production' id='management-tabs' className='mb-3'>
        <Tab eventKey='production' title='Produção'>
          <ManagementProduction />
        </Tab>
        <Tab eventKey='maintenance' title='Manutenção'>
          <p>Manutenção</p>
        </Tab>
      </Tabs>
    </PageLayout>
  );
};

export default Management;
