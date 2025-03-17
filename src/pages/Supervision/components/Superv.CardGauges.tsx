import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { getIndicator } from '../../../api/apiRequests';
import GaugeChart from '../../../components/gauge';
import { IndicatorType } from '../../../helpers/constants';
import { iEficiencia, iPerformance } from '../../../interfaces/Indicators.interfaces';

// cSpell: words eficiencia

interface iCardGaugesProps {
  shift: string;
  today: string;
}

const CardGauges: React.FC<iCardGaugesProps> = ({ shift, today }) => {
  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [eficiencia, setEficiencia] = useState<iEficiencia[]>([]);
  const [performance, setPerformance] = useState<iPerformance[]>([]);

  /* ------------------------------------------ CÁLCULOS ------------------------------------------ */

  // Conseguir a média de eficiencia
  const eficienciaMedia =
    eficiencia.length > 0
      ? (eficiencia.reduce((acc, curr) => acc + curr.eficiencia, 0) / eficiencia.length) *
        100
      : 0;

  const performanceMedia =
    performance.length > 0
      ? (performance.reduce((acc, curr) => acc + curr.performance, 0) /
          performance.length) *
        100
      : 0;

  /* ------------------------------------------- EFFECT ------------------------------------------- */
  useEffect(() => {
    // Faz a requisição do indicador e salva no estado
    void getIndicator('eficiencia', today).then((data: iEficiencia[]) => {
      setEficiencia(data.filter((item) => item.eficiencia > 0 && item.turno === shift));
    });
    void getIndicator('performance', today).then((data: iPerformance[]) =>
      setPerformance(data.filter((item) => item.turno === shift))
    );
  }, [today, shift]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {eficienciaMedia > 0 && performanceMedia > 0 ? (
        <>
          <h5 className='fs-5 text-center'>Indicadores de Produção</h5>
          <Card className='border-0 p-2 d-flex flex-row justify-content-around align-items-center h-100 bg-transparent'>
            <GaugeChart
              indicator={IndicatorType.EFFICIENCY}
              data={eficienciaMedia}
              key={eficienciaMedia + 'eff'}
              large
            />
            <GaugeChart
              indicator={IndicatorType.PERFORMANCE}
              data={performanceMedia}
              key={performanceMedia + 'perf'}
              large
            />
          </Card>
        </>
      ) : (
        <Card className='border-0 p-2 h-100 f-flex justify-content-center align-items-center'>
          <h5 className='fs-5 text-center'>Não há dados no período</h5>
        </Card>
      )}
    </>
  );
};

export default CardGauges;
