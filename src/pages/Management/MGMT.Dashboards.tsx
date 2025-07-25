//cSpell: words linepicker
import React, { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import AnimatedFilterNotification from '../../components/AnimatedFilterNotification';
import DateTurnFilter from '../../components/DateTurnFilter';
import { useFilters } from '../../hooks/useFilters';
import { useFiltersVisibility } from '../../hooks/useFiltersVisibility';
import DashTimeline from './components/Dash.Timeline';
import SetupDash from './components/SetupDash';
import StopsDash from './components/StopsDash';

const ManagementDashboards: React.FC = () => {
  /* ------------------------------------------- Hooks -------------------------------------------- */
  const { type: dateType } = useFilters('management');

  const {
    isVisible: isFilterVisible,
    toggle: toggleFilterVisibility,
    resetVisibility: resetFilterVisibility,
  } = useFiltersVisibility('management');

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    // Resetar visibilidade dos filtros quando a página for montada
    return () => resetFilterVisibility();
  }, [resetFilterVisibility]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Container fluid className='p-1'>
      <h1 className='text-center'>Dashboards</h1>
      <Row className='mb-1'>
        <Col>
          <Button
            variant={isFilterVisible ? 'secondary' : 'outline-secondary'}
            size='sm'
            onClick={toggleFilterVisibility}
            className='d-flex align-items-center mb-1'
          >
            <i className={`bi ${isFilterVisible ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
            {isFilterVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </Col>
      </Row>

      <Row className='px-2'>
        <DateTurnFilter
          show={isFilterVisible}
          scope='management'
          showLineSelector={true}
          useAdvancedDatePicker={true}
          compact={true}
        />
        <AnimatedFilterNotification scope='management' />
      </Row>

      <StopsDash />

      {dateType === 'single' && (
        <Row>
          <Col xs={12}>
            <DashTimeline />
          </Col>
        </Row>
      )}

      <SetupDash />
    </Container>
  );
};

export default ManagementDashboards;
