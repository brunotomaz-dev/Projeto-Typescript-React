import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

interface iCaixasPessoaProps {
  totalProduction: number;
  presentes: number;
}

const CaixasPessoa: React.FC<iCaixasPessoaProps> = ({ totalProduction, presentes }) => {
  const meta = 50;

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [caixasPessoa, setCaixasPessoa] = useState<number>(0);

  /* ------------------------------------------- EFFECT ------------------------------------------- */
  useEffect(() => {
    if (presentes > 0) {
      setCaixasPessoa(Math.floor(Math.floor(totalProduction) / presentes) || 0);
    }
  }, [totalProduction, presentes]);

  return (
    <Card className='bg-transparent border-0 h-100'>
      <h5 className='text-center fs-5'>Caixas por Pessoa</h5>
      {presentes > 0 ? (
        <Card className='border-0 p-2 mb-3 h-100 d-flex justify-content-around bg-transparent'>
          <Card className='shadow border-0 p-2 mb-3'>
            <Card.Title className='fs-6 fw-light'>Meta de Caixas por pessoa</Card.Title>
            <Card.Body>
              <Card.Text className='text-center' style={{ fontSize: '3vw' }}>
                {meta}
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className='shadow border-0 p-2'>
            <Card.Title className='fs-6 fw-light'>Caixas por pessoa</Card.Title>
            <Card.Body>
              <Card.Text className='text-center' style={{ fontSize: '3vw' }}>
                {caixasPessoa}
              </Card.Text>
            </Card.Body>
          </Card>
        </Card>
      ) : (
        <Card className='border-0 p-2 h-100 f-flex justify-content-center align-items-center'>
          <h5 className='fs-5 text-center'>
            Não há pessoas presentes para calcular a produção por pessoa.
          </h5>
        </Card>
      )}
    </Card>
  );
};

export default CaixasPessoa;
