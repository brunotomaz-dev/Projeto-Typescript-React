import React from 'react';
import { Card } from 'react-bootstrap';
import { useLineIndicators } from '../../../hooks/useLiveLineIndicators';
import { useProductionData } from '../../../hooks/useLiveProductionData';

const ProductionPanel: React.FC = () => {
  // Obter dados diretamente do hook especializado
  const { productionTotal, produto, isLoading, isFetching } = useProductionData();
  const { efficiency } = useLineIndicators();

  const isEfficiencyLow = efficiency < 90;

  const isRefreshing = isLoading || isFetching;

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      {isRefreshing && (
        <div className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </div>
      )}
      <Card.Body className='d-flex flex-column h-100 justify-content-center'>
        <>
          <div className='text-center'>
            <h6 className='text-secondary'>Bandejas Produzidas</h6>
            <span className={`text-center fs-1 fw-bold ${isEfficiencyLow ? 'text-danger' : 'text-success'}`}>
              {productionTotal.toLocaleString('pt-BR')}
            </span>
          </div>
          <hr className='my-3' />
          <div className='text-center'>
            <h6 className='text-secondary'>Produto</h6>
            <span className='text-center fs-5 fw-bold text-primary'>{produto}</span>
          </div>
        </>
      </Card.Body>
    </>
  );
};

export default ProductionPanel;
