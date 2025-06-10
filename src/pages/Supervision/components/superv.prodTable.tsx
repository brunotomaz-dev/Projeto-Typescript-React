import React from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import { useProductionAndDiscardsQuery } from '../../../hooks/queries/useProductionAndDiscardsQuery';
import { useFilters } from '../../../hooks/useFilters';
import { useAppSelector } from '../../../redux/store/hooks';

const ProductionTable: React.FC = () => {
  const { date, turn } = useFilters('supervision');

  // Usar o novo hook para buscar e processar os dados
  const { isLoading, error, productionData } = useProductionAndDiscardsQuery({
    date,
    shift: turn,
  });

  // Buscar os dados do Redux
  const {
    totalByProductBag,
    totalByProductBol,
    totalProduction: totalByProduct,
  } = useAppSelector((state) => state.production);

  const { bagProduction: allBagProduction, bolProduction: allBolProduction } = productionData;

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <Card className='bg-light border-0 h-100'>
        <div className='text-center p-5'>
          <Spinner animation='border' />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='bg-light border-0 h-100'>
        <div className='text-center p-3 text-danger'>Erro ao carregar dados de produção</div>
      </Card>
    );
  }

  return (
    <Card className='bg-light border-0 h-100'>
      <h5 className='text-center fs-5 mb-0 p-2'>Caixas Produzidas</h5>
      <Card.Body className='shadow bg-transparent border-0 p-2'>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className='text-end'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allBagProduction)
              .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
              .map(([produto, total]) => (
                <tr key={produto}>
                  <td>{produto}</td>
                  <td className='text-end'>{Math.floor(total).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            {totalByProductBag > 0 && (
              <tr>
                <td>
                  <strong>Total de Baguete</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProductBag).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            )}
            {Object.entries(allBolProduction)
              .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
              .map(([produto, total]) => (
                <tr key={produto}>
                  <td>{produto}</td>
                  <td className='text-end'>{Math.floor(total).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            {totalByProductBol > 0 && (
              <tr>
                <td>
                  <strong>Total de Bolinha</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProductBol).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            )}
            {totalByProduct > 0 && totalByProductBag > 0 && totalByProductBol > 0 && (
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProduct).toLocaleString('pt-BR')}</strong>
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
    </Card>
  );
};

export default ProductionTable;
