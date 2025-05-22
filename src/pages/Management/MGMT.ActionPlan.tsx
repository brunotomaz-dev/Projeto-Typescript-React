import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { getActionPlan } from '../../api/apiRequests';
import { iActionPlan } from '../../interfaces/ActionPlan.interface';
import ActionPlanCompletionTimeChart from './components/ActionPlanCompletionTimeChart';
import ActionPlanLevelChart from './components/ActionPlanLevelChart';
import ActionPlanOpeningLevelChart from './components/ActionPlanOpeningLevelChart';
import ActionPlanStatusChart from './components/ActionPlanStatusChart';

const ActionPlanMGMT: React.FC = () => {
  /* -------------------------------------------------- Local State ------------------------------------------------- */
  const [actionPlan, setActionPlan] = useState<iActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /* -------------------------------------------- DATAS ------------------------------------------- */
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const dayStartString = format(startOfDay(threeMonthsAgo), 'yyyy-MM-dd');

  /* ---------------------------------------------------- Effect ---------------------------------------------------- */
  useEffect(() => {
    setIsLoading(true);
    void getActionPlan([dayStartString])
      .then((response: iActionPlan[]) => {
        setActionPlan(response);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching action plan:', error);
        setIsLoading(false);
      });
  }, []);

  /* ---------------------------------------------------------------------------------------------------------------- */
  /*                                                      LAYOUT                                                      */
  /* ---------------------------------------------------------------------------------------------------------------- */
  return (
    <Container fluid className='p-3'>
      <h1 className='text-center mb-4'>Dashboard de Planos de Ação</h1>

      {isLoading ? (
        <div className='text-center p-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
          <p className='mt-3'>Carregando dados...</p>
        </div>
      ) : (
        <>
          <Row>
            <Col lg={6} className='mb-3'>
              <ActionPlanStatusChart actionPlanData={actionPlan} />
            </Col>
            <Col lg={6} className='mb-3'>
              <ActionPlanLevelChart actionPlanData={actionPlan} />
            </Col>
          </Row>

          <Row>
            <Col lg={6} className='mb-3'>
              <ActionPlanCompletionTimeChart actionPlanData={actionPlan} />
            </Col>
            <Col lg={6} className='mb-3'>
              <ActionPlanOpeningLevelChart actionPlanData={actionPlan} />
            </Col>
          </Row>

          {/* Área para mais gráficos futuros */}
        </>
      )}
    </Container>
  );
};

export default ActionPlanMGMT;
