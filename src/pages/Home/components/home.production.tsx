import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Row, Table } from 'react-bootstrap';
import { getProduction } from '../../../api/apiRequests';
import { iProduction } from '../../ProductionLive/interfaces/production.interface';

const HomeProductionCard: React.FC = () => {
  const [totalByProduct, setTotalByProduct] = useState<{ [key: string]: number }>({});

  // Com production, soma o total_produzido para cada produto

  // Recuperar a data de hoje
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');

  useEffect(() => {
    void getProduction(nowDate).then((data: iProduction[]) => {
      // Calcula total por produto
      const totals = data.reduce(
        (acc, curr) => {
          const produto = curr.produto.trim();
          acc[produto] = (acc[produto] || 0) + curr.total_produzido;
          return acc;
        },
        {} as { [key: string]: number }
      );
      setTotalByProduct(totals);
    });
  }, [nowDate]);

  return (
    <>
      <Card className='shadow border-0 p-3 mb-2'>
        <h3>Caixas Produzidas</h3>
        <Row>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Produto</th>
                <th className='text-end'>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalByProduct)
                .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
                .map(([produto, total]) => (
                  <tr key={produto}>
                    <td>{produto}</td>
                    <td className='text-end'>
                      {Math.floor(total / 10).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className='text-end'>
                  <strong>
                    {Object.values(totalByProduct)
                      .reduce((acc, curr) => acc + Math.floor(curr / 10), 0)
                      .toLocaleString('pt-BR')}
                  </strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </Row>
      </Card>
    </>
  );
};

export default HomeProductionCard;
