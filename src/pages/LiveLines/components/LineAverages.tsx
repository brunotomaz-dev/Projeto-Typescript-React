import React from 'react';
import { Row } from 'react-bootstrap';
import { useLineAverages } from '../../../hooks/useLinesAverage';
import GaugeAverage from './gaugeAverage';

const LineAverages: React.FC = () => {
  // Usar o hook especializado
  const { averages, isLoading, hasData, isFetching } = useLineAverages();

  // Se não houver dados, mostrar mensagem
  if (!hasData) {
    return (
      <>
        <h6 className='mt-2 fs-6 text-center fw-bold text-dark-emphasis'> Eficiência Média da Linha</h6>
        <Row className='justify-content-center align-items-center text-muted h-100'>
          <p className='text-center'>Sem dados de eficiência disponíveis</p>
        </Row>
      </>
    );
  }

  const isRefreshing = isLoading || isFetching;

  // Renderizar os gauges para cada turno que tem dados
  return (
    <>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      <h6 className='mt-2 fs-6 text-center fw-bold text-dark-emphasis'> Eficiência Média da Linha</h6>

      {averages.noturno.exists && <GaugeAverage average={averages.noturno.value} turn='Noturno' />}

      {averages.matutino.exists && <GaugeAverage average={averages.matutino.value} turn='Matutino' />}

      {averages.vespertino.exists && <GaugeAverage average={averages.vespertino.value} turn='Vespertino' />}
    </>
  );
};

export default LineAverages;
