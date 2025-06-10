import React from 'react';
import { Card } from 'react-bootstrap';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { useIndicatorsQuery } from '../../../hooks/queries/useIndicatorsQuery';

// cSpell: words eficiencia

const CardGauges: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { efficiency, performance } = useIndicatorsQuery('supervision');

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {efficiency.average > 0 && performance.average > 0 ? (
        <Card className='bg-light border-0 shadow h-100'>
          <h5 className='fs-5 text-center mb-0 p-2'>Indicadores de Produção</h5>
          <Card className='border-0 p-2 d-flex flex-row justify-content-around align-items-center h-100 bg-transparent'>
            <GaugeChart
              indicator={IndicatorType.EFFICIENCY}
              data={efficiency.average * 100}
              key={efficiency.average + 'eff'}
              large
            />
            <GaugeChart
              indicator={IndicatorType.PERFORMANCE}
              data={performance.average * 100}
              key={performance.average + 'perf'}
              large
            />
          </Card>
        </Card>
      ) : (
        <Card className='border-0 p-2 h-100 f-flex justify-content-center align-items-center'>
          <h5 className='fs-5 text-center'>Não há dados no período</h5>
        </Card>
      )}
    </>
  );
};

export default CardGauges;
