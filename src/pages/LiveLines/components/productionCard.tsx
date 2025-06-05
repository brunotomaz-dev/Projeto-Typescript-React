import React from 'react';
import { Card } from 'react-bootstrap';
import { useLineIndicators } from '../../../hooks/useLiveLineIndicators';
import { useProductionData } from '../../../hooks/useLiveProductionData';

const ProductionPanel: React.FC = () => {
  // Obter dados diretamente do hook especializado
  const { productionTotal, produto, isLoading } = useProductionData();
  const { efficiency } = useLineIndicators();

  const isEfficiencyLow = efficiency < 90; // Defina o limite de eficiência conforme necessário

  return (
    <Card.Body className='d-flex flex-column h-100 justify-content-center'>
      {isLoading ? (
        <div className='d-flex justify-content-center align-items-center h-100'>
          <div className='spinner-border text-secondary' role='status'>
            <span className='visually-hidden'>Carregando...</span>
          </div>
        </div>
      ) : (
        <>
          <div className='text-center'>
            <h5 className='text-secondary'>Bandejas Produzidas</h5>
            <span className={`text-center fs-2 fw-bold ${isEfficiencyLow ? 'text-danger' : 'text-success'}`}>
              {productionTotal.toLocaleString('pt-BR')}
            </span>
          </div>
          <hr className='my-3' />
          <div className='text-center'>
            <h5 className='text-secondary'>Produto</h5>
            <span className='text-center fs-5 fw-bold text-primary'>{produto}</span>
          </div>
        </>
      )}
    </Card.Body>
  );
};

export default ProductionPanel;
