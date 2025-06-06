import React from 'react';
import { Col, Row } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useLineIndicators } from '../../../hooks/useLiveLineIndicators';

const LineIndicators: React.FC = () => {
  const { efficiency, performance, repair, isFetching, isLoading } = useLineIndicators();

  const isRefreshing = isLoading || isFetching;

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      <Row>
        <Col
          xs={12}
          sm
          className='card bg-transparent align-items-center border-0'
          style={{ height: '200px' }}
        >
          <GaugeChart indicator={IndicatorType.EFFICIENCY} data={efficiency} trio />
        </Col>
        <Col
          xs={12}
          sm
          className='card bg-transparent align-items-center border-0'
          style={{ height: '200px' }}
        >
          <GaugeChart indicator={IndicatorType.PERFORMANCE} data={performance} trio />
        </Col>
        <Col
          xs={12}
          sm
          className='card bg-transparent align-items-center border-0'
          style={{ height: '200px' }}
        >
          <GaugeChart indicator={IndicatorType.REPAIR} data={repair} trio />
        </Col>
      </Row>
    </>
  );
};

export default LineIndicators;
