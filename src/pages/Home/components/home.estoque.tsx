import React, { useEffect, useState } from 'react';
import { Card, Row, Table } from 'react-bootstrap';
import { getEstoqueAtual } from '../../../api/apiRequests';

interface iEstoque {
  produto: string;
  quantidade: number;
}

const HomeEstoqueCard: React.FC = () => {
  const [estoque, setEstoque] = useState<iEstoque[]>([]);
  useEffect(() => {
    void getEstoqueAtual().then((data: iEstoque[]) => {
      setEstoque(data);
    });
  }, []);

  return (
    <Card className="shadow border-0 p-3 mb-2">
      <h3>Estoque</h3>
      <Row>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className="text-end">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {estoque.map(({ produto, quantidade }) => (
              <tr key={produto}>
                <td>{produto.trim()}</td>
                <td className="text-end">{quantidade.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              <td className="text-end">
                <strong>{estoque.reduce((acc, curr) => acc + curr.quantidade, 0).toLocaleString('pt-BR')}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Row>
    </Card>
  );
};

export default HomeEstoqueCard;
