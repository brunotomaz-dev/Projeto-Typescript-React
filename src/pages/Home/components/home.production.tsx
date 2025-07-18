import React, { useState } from 'react';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import { useProductionQuery } from '../../../hooks/queries/useProductionQuery';
import { useAppSelector } from '../../../redux/store/hooks';

const HomeProductionCard: React.FC = () => {
  // Utilizar o hook compartilhado
  const { productionByType, productionDetails, isLoading } = useProductionQuery('home');
  const [showDetails, setShowDetails] = useState(false);
  const {} = useAppSelector((state) => state.production);

  const { baguete, bolinha, total } = productionByType;
  const bagueteProducts = productionDetails.filter((item) => item.tipo === 'baguete');
  const bolinhaProducts = productionDetails.filter((item) => item.tipo === 'bolinha');

  const totalByProductBag = Math.floor(baguete / 10);
  const totalByProductBol = Math.floor(bolinha / 10);
  const totalProduction = Math.floor(total / 10);

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
              <td className='text-end'>{totalByProductBol.toLocaleString('pt-BR')}</td>
            </tr>
            <tr>
              <td>Baguetes</td>
              <td className='text-end'>{totalByProductBag.toLocaleString('pt-BR')}</td>
            </tr>
            <tr className='table-success'>
              <td>
                <strong>Total</strong>
              </td>
              <td className='text-end'>
                <strong>{totalProduction.toLocaleString('pt-BR')}</strong>
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
              {bolinhaProducts.length > 0 && (
                <>
                  <tr className='table-secondary'>
                    <td colSpan={2}>
                      <strong>Bolinhas</strong>
                    </td>
                  </tr>
                  {bolinhaProducts
                    .sort((a, b) => a.produto.localeCompare(b.produto))
                    .map(({ produto, quantidade }) => (
                      <tr key={produto}>
                        <td>{produto}</td>
                        <td className='text-end'>{Math.floor(quantidade / 10).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  <tr className='table-light'>
                    <td>
                      <em>Subtotal Bolinhas</em>
                    </td>
                    <td className='text-end'>
                      <em>{totalByProductBol.toLocaleString('pt-BR')}</em>
                    </td>
                  </tr>
                </>
              )}

              {bagueteProducts.length > 0 && (
                <>
                  <tr className='table-secondary'>
                    <td colSpan={2}>
                      <strong>Baguetes</strong>
                    </td>
                  </tr>
                  {bagueteProducts
                    .sort((a, b) => a.produto.localeCompare(b.produto))
                    .map(({ produto, quantidade }) => (
                      <tr key={produto}>
                        <td>{produto}</td>
                        <td className='text-end'>{Math.floor(quantidade / 10).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  <tr className='table-light'>
                    <td>
                      <em>Subtotal Baguetes</em>
                    </td>
                    <td className='text-end'>
                      <em>{totalByProductBag.toLocaleString('pt-BR')}</em>
                    </td>
                  </tr>
                </>
              )}

              <tr className='table-success'>
                <td>
                  <strong>Total Geral</strong>
                </td>
                <td className='text-end'>
                  <strong>{totalProduction.toLocaleString('pt-BR')}</strong>
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
