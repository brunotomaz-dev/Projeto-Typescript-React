//cSpell: words linepicker
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { getInfoIHM } from '../../api/apiRequests';
import DateTurnLineFilter from '../../components/DateTurnLineFilter';
import PersonalizedTransition from '../../components/PersonalizedTransition';
import { useFiltersVisibility } from '../../hooks/useFiltersVisibility';
import { useFiltersWithLines } from '../../hooks/useFiltersWithLines';
import { iInfoIHM } from '../../interfaces/InfoIHM.interface';
import DashBar from './components/Dash.Bar';
import DashTimeline from './components/Dash.Timeline';
import DashYamazumi from './components/Dash.Yamazumi';

const ManagementDashboards: React.FC = () => {
  /* ------------------------------------------- Redux -------------------------------------------- */
  const {
    selectedDate,
    selectedLines,
    turn,
    selectedRange,
    type: dateType,
  } = useFiltersWithLines('management');

  const {
    isVisible: isFilterVisible,
    toggle: toggleFilterVisibility,
    resetVisibility: resetFilterVisibility,
  } = useFiltersVisibility('management');

  /* ----------------------------------------- Local State ---------------------------------------- */
  const [infoIhmData, setInfoIhmData] = useState<iInfoIHM[]>([]);
  const [notAffBar, setNotAffBar] = useState<boolean>(false);

  /* ------------------------------------------- Effect ------------------------------------------- */
  useEffect(() => {
    const dateChoice =
      dateType === 'single' ? selectedDate : [selectedRange.startDate, selectedRange.endDate];

    void getInfoIHM(dateChoice).then((res: iInfoIHM[]) => {
      // Filtrar dados pela linha, se não for [] ou length = 14
      if (selectedLines.length > 0 && selectedLines.length !== 14) {
        res = res.filter((item) => selectedLines.includes(item.linha));
      }
      // Se o turno for diferente de ALL, filtrar os dados
      if (turn !== 'ALL') {
        res = res.filter((item) => item.turno === turn);
      }

      setInfoIhmData(res);
    });
  }, [dateType, selectedDate, selectedRange, selectedLines, turn]);

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

      <DateTurnLineFilter show={isFilterVisible} />
      <PersonalizedTransition scope='management' filtersWithLines />

      <Row className='mb-3 mt-2'>
        <Col>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashYamazumi data={infoIhmData} />
          </Card>
        </Col>
      </Row>
      <Row className='mb-3'>
        <Form.Switch className='mb-3 d-flex justify-content-center'>
          <Form.Check.Input
            id='custom-switch'
            onChange={() => setNotAffBar(!notAffBar)}
            checked={notAffBar}
          />
          <Form.Check.Label className='ms-2 text-muted fs-6'>
            Exibir Paradas que não Afetam Eficiência
          </Form.Check.Label>
        </Form.Switch>
        <Col xs={12} xl={6} className='mb-3'>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'ALL'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Primeiro'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
      </Row>
      <Row className='mb-3'>
        <Col xs={12} xl={6} className='mb-3'>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Segundo'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
        <Col xs={12} xl={6}>
          <Card className='p-2 bg-transparent border-0 shadow-sm'>
            <DashBar
              data={infoIhmData}
              selectedLines={selectedLines}
              selectedShift={turn}
              selectedDate={selectedDate}
              dataType={'Terceiro'}
              notAffBar={notAffBar}
            />
          </Card>
        </Col>
      </Row>
      {dateType === 'single' && (
        <Row>
          <Col xs={12}>
            <Card className='p-2 bg-transparent border-0 shadow-sm'>
              <DashTimeline data={infoIhmData} selectedLines={selectedLines} selectedShift={turn} />
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ManagementDashboards;
