import React from 'react';
import { Card, Row, Spinner, Table } from 'react-bootstrap';
import useRunningLines from '../../../hooks/useRunningLines';

const HomeLinesCard: React.FC = () => {
  const { runningMachines, isLoading } = useRunningLines();

  return (
    <Card className='shadow border-0 p-3 mb-2'>
      <h3>
        Linhas Rodando
        {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
      </h3>
      <Row>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Linha</th>
              <th>Produto</th>
            </tr>
          </thead>
          <tbody>
            {runningMachines.map(({ linha, produto, maquina_id }) => (
              <tr key={maquina_id}>
                <td>{linha}</td>
                <td>{produto}</td>
              </tr>
            ))}
            {runningMachines.length === 0 && (
              <tr>
                <td colSpan={2} className='text-center'>
                  {isLoading ? 'Carregando...' : 'Nenhuma linha rodando no momento'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Row>
    </Card>
  );
};

export default HomeLinesCard;
