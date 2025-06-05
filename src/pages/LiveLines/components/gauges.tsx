import React from 'react';
import { Col, Row } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useLineIndicators } from '../../../hooks/useLiveLineIndicators';

const LineIndicators: React.FC = () => {
  const { efficiency, performance, repair } = useLineIndicators();

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Row>
      <Col xs={12} sm className='' style={{ height: '200px' }}>
        <GaugeChart indicator={IndicatorType.EFFICIENCY} data={efficiency} trio />
      </Col>
      <Col xs={12} sm className='' style={{ height: '200px' }}>
        <GaugeChart indicator={IndicatorType.PERFORMANCE} data={performance} trio />
      </Col>
      <Col xs={12} sm className='' style={{ height: '200px' }}>
        <GaugeChart indicator={IndicatorType.REPAIR} data={repair} trio />
      </Col>
    </Row>
  );
};

export default LineIndicators;
