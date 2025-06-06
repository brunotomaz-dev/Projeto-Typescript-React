import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useIndicatorsQuery } from '../../../hooks/queries/useIndicatorsQuery';

interface HomeIndicatorsCardProps {
  className?: string;
}

const HomeIndicatorsCard: React.FC<HomeIndicatorsCardProps> = ({ className }) => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { efficiency, performance, repair, isLoading } = useIndicatorsQuery();

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Card className={`bg-light shadow border-0 p-2 pb-4 ${className}`}>
      <h4 className='card-title text-center p-2'>
        Indicadores de eficiência
        {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
      </h4>
      <div className='d-flex flex-row justify-content-center align-items-center h-100'>
        <GaugeChart
          indicator={IndicatorType.EFFICIENCY}
          data={efficiency.average * 100}
          large
          pos='up-center'
        />
        <GaugeChart
          indicator={IndicatorType.PERFORMANCE}
          data={performance.average * 100}
          large
          pos='down-center'
        />
        <GaugeChart indicator={IndicatorType.REPAIR} data={repair.average * 100} large pos='up-center' />
      </div>
    </Card>
  );
};

export default HomeIndicatorsCard;
