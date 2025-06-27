import React from 'react';
import { Card, Row, Table } from 'react-bootstrap';
import { useProductionQuery } from '../../../hooks/queries/useProductionQuery';

const ProductionTable: React.FC = () => {
  // Usar o novo hook para buscar e processar os dados
  const { productionByType, productionDetails, isLoading, isFetching, error } =
    useProductionQuery('supervision');

  const { baguete, bolinha, total } = productionByType;
  const allBagProduction = productionDetails.filter((item) => item.tipo === 'baguete');
  const allBolProduction = productionDetails.filter((item) => item.tipo === 'bolinha');

  const totalByProductBag = Math.floor(baguete / 10);
  const totalByProductBol = Math.floor(bolinha / 10);
  const totalByProduct = Math.floor(total / 10);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */

  const isRefreshing = isLoading || isFetching;

  if (error) {
    return (
      <Card className='bg-light border-0 h-100'>
        <div className='text-center p-3 text-danger'>Erro ao carregar dados de produção</div>
      </Card>
    );
  }

  return (
    <Card className='bg-light border-0 h-100'>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      <h5 className='text-center fs-5 mb-0 p-2'>Caixas Produzidas</h5>
      {!isLoading && (
        <Card.Body className='shadow bg-transparent border-0 p-2'>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Produto</th>
                <th className='text-end'>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {allBagProduction
                .sort((a, b) => a.produto.localeCompare(b.produto))
                .map(({ produto, quantidade }) => (
                  <tr key={produto}>
                    <td>{produto}</td>
                    <td className='text-end'>{Math.floor(quantidade / 10).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              {totalByProductBag > 0 && (
                <tr>
                  <td>
                    <strong>Total de Baguete</strong>
                  </td>
                  <td className='text-end'>
                    <strong>{totalByProductBag.toLocaleString('pt-BR')}</strong>
                  </td>
                </tr>
              )}
              {allBolProduction
                .sort((a, b) => a.produto.localeCompare(b.produto))
                .map(({ produto, quantidade }) => (
                  <tr key={produto}>
                    <td>{produto}</td>
                    <td className='text-end'>{Math.floor(quantidade / 10).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              {totalByProductBol > 0 && (
                <tr>
                  <td>
                    <strong>Total de Bolinha</strong>
                  </td>
                  <td className='text-end'>
                    <strong>{totalByProductBol.toLocaleString('pt-BR')}</strong>
                  </td>
                </tr>
              )}
              {totalByProduct > 0 && totalByProductBag > 0 && totalByProductBol > 0 && (
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td className='text-end'>
                    <strong>{totalByProduct.toLocaleString('pt-BR')}</strong>
                  </td>
                </tr>
              )}
              {totalByProduct === 0 && (
                <tr>
                  <td colSpan={6} className='text-center py-3 text-muted'>
                    Nenhum registro encontrado para este turno.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      )}
    </Card>
  );
};

export default ProductionTable;
