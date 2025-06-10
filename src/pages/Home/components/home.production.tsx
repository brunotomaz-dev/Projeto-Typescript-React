import React, { useState } from 'react';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import { useProductionAndDiscardsQuery } from '../../../hooks/queries/useProductionAndDiscardsQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useAppSelector } from '../../../redux/store/hooks';

const HomeProductionCard: React.FC = () => {
  // Utilizar o hook compartilhado
  const { date, turn } = useFilters('home');
  const { productionData, isLoading } = useProductionAndDiscardsQuery({ date, shift: turn });
  const [showDetails, setShowDetails] = useState(false);
  const { totalByProductBag, totalByProductBol, totalProduction } = useAppSelector(
    (state) => state.production
  );

  const { bagProduction: bagueteProducts, bolProduction: bolinhaProducts } = productionData;

  return (
    <Card className='bg-light shadow border-0 p-1'>
      <div className='d-flex justify-content-between align-items-center p-2'>
        <h3 className='card-title m-0'>
          Produção
          {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
        </h3>
        <Button variant='outline-secondary' size='sm' onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Ver Resumo' : 'Ver Detalhes'}
        </Button>
      </div>

      {/* Visão resumida (totais) */}
      {!showDetails && (
        <Table striped responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className='text-end'>Caixas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bolinhas</td>
              <td className='text-end'>{Math.floor(totalByProductBol).toLocaleString('pt-BR')}</td>
            </tr>
            <tr>
              <td>Baguetes</td>
              <td className='text-end'>{Math.floor(totalByProductBag).toLocaleString('pt-BR')}</td>
            </tr>
            <tr className='table-success'>
              <td>
                <strong>Total</strong>
              </td>
              <td className='text-end'>
                <strong>{Math.floor(totalProduction).toLocaleString('pt-BR')}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      )}

      {/* Visão detalhada (por produto) */}
      {showDetails && (
        <div className='table-responsive'>
          <Table striped>
            <thead className='sticky-top bg-light'>
              <tr>
                <th>Produto</th>
                <th className='text-end'>Caixas</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bolinhaProducts).length > 0 && (
                <>
                  <tr className='table-secondary'>
                    <td colSpan={2}>
                      <strong>Bolinhas</strong>
                    </td>
                  </tr>
                  {Object.entries(bolinhaProducts)
                    .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
                    .map(([produto, total]) => (
                      <tr key={produto}>
                        <td>{produto}</td>
                        <td className='text-end'>{Math.floor(total).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  <tr className='table-light'>
                    <td>
                      <em>Subtotal Bolinhas</em>
                    </td>
                    <td className='text-end'>
                      <em>{Math.floor(totalByProductBol).toLocaleString('pt-BR')}</em>
                    </td>
                  </tr>
                </>
              )}

              {Object.entries(bagueteProducts).length > 0 && (
                <>
                  <tr className='table-secondary'>
                    <td colSpan={2}>
                      <strong>Baguetes</strong>
                    </td>
                  </tr>
                  {Object.entries(bagueteProducts)
                    .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
                    .map(([produto, total]) => (
                      <tr key={produto}>
                        <td>{produto}</td>
                        <td className='text-end'>{Math.floor(total).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  <tr className='table-light'>
                    <td>
                      <em>Subtotal Baguetes</em>
                    </td>
                    <td className='text-end'>
                      <em>{Math.floor(totalByProductBag).toLocaleString('pt-BR')}</em>
                    </td>
                  </tr>
                </>
              )}

              <tr className='table-success'>
                <td>
                  <strong>Total Geral</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalProduction).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default HomeProductionCard;
