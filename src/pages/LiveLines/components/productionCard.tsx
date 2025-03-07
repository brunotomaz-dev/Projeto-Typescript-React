import React from 'react';
import { Row } from 'react-bootstrap';

interface ProductionPanelProps {
  productionTotal: number;
  produto: string;
}

const ProductionPanel: React.FC<ProductionPanelProps> = ({ productionTotal, produto }) => {
  const sizeClass = produto.length > 20 ? 'fs-5' : 'fs-4';

  return (
    <Row className='h-100 p-3 fs-responsive'>
      <p>Produto</p>
      <h4 className={`text-center ${sizeClass}`}>{produto}</h4>
      <p>Produção</p>
      <h1 className='text-center'>{productionTotal}</h1>
    </Row>
  );
};

export default ProductionPanel;
