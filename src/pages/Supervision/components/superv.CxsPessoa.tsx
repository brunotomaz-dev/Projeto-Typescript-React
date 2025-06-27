import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useAppSelector } from '../../../redux/store/hooks';

const CaixasPessoa: React.FC = () => {
  const meta = 50;

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const totalProduction = useAppSelector((state) => state.production.totalProduction);
  const totalPresentes = useAppSelector((state) => state.supervision.totalPresentes);

  const caixasPessoa = useMemo(() => {
    const totalProdCsx = Math.floor(totalProduction / 10);
    return totalPresentes > 0 ? Math.floor(totalProdCsx / totalPresentes) : 0;
  }, [totalProduction, totalPresentes]);

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Card className='bg-light border-0 shadow h-100'>
      <h5 className='text-center fs-5 mb-0 p-2'>Caixas por Pessoa</h5>
      {totalPresentes > 0 ? (
        <Card.Body className='d-flex flex-column bg-transparent border-0 h-100 justify-content-evenly p-3'>
          <Card className='bg-light-grey-sfm p-2 shadow mb-3 border-light'>
            <Card.Title className='fs-6 fw-light'>Meta de Caixas por pessoa</Card.Title>
            <Card.Body>
              <Card.Text className='text-center' style={{ fontSize: '3vw' }}>
                {meta}
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className='border-light bg-light-grey-sfm p-2 shadow'>
            <Card.Title className='fs-6 fw-light'>Caixas por pessoa</Card.Title>
            <Card.Body>
              <Card.Text className='text-center' style={{ fontSize: '3vw' }}>
                {caixasPessoa}
              </Card.Text>
            </Card.Body>
          </Card>
        </Card.Body>
      ) : (
        <Card className='align-items-center border-0 h-100 justify-content-center p-2 shadow f-flex'>
          <h5 className='text-center fs-5'>Não há pessoas presentes para calcular a produção por pessoa.</h5>
        </Card>
      )}
    </Card>
  );
};

export default CaixasPessoa;
