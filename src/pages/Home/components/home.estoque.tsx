import React from 'react';
import { Card, Row, Spinner, Table } from 'react-bootstrap';
import { useEstoqueQuery } from '../../../hooks/queries/useEstoqueQuery';

const HomeEstoqueCard: React.FC = () => {
  const { estoqueData, isLoading } = useEstoqueQuery();

  // Tipar estoqueData para garantir que seja um array de objetos com as propriedades esperadas
  interface EstoqueItem {
    produto: string;
    quantidade: number;
  }
  const typedEstoqueData: EstoqueItem[] = estoqueData as EstoqueItem[];

  return (
    <Card className='shadow border-0 p-3 mb-2'>
      <h3>
        Estoque
        {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
      </h3>
      <Row>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className='text-end'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {typedEstoqueData.map(({ produto, quantidade }, index) => (
              <tr key={`${produto}-${index}`}>
                <td>{produto.trim()}</td>
                <td className='text-end'>{quantidade}</td>
              </tr>
            ))}
            {typedEstoqueData.length === 0 && (
              <tr>
                <td colSpan={2} className='text-center'>
                  {isLoading ? 'Carregando...' : 'Nenhum item em estoque'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Row>
    </Card>
  );
};

export default HomeEstoqueCard;
