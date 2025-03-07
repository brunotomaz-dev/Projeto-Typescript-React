import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Row, Table } from 'react-bootstrap';
import { getCarrinhosCount } from '../../../api/apiRequests';
import { iCartCount, TurnoType } from '../../../interfaces/Carrinhos.interface';

const HomeCartCountCart: React.FC = () => {
  // Encontrar primeiro dia do mês
  const now = startOfDay(new Date());
  // Ajustar o dia atual para o formato yyyy-mm-dd
  const nowString = format(now, 'yyyy-MM-dd');

  const DisplayTurn: Record<TurnoType, string> = {
    MAT: 'Matutino',
    VES: 'Vespertino',
    NOT: 'Noturno',
  };

  //Inicializar estado local
  const [cartCount, setCartCount] = useState<iCartCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Faz a requisição do indicador e salva no estado
    try {
      void getCarrinhosCount(nowString, nowString).then((data: iCartCount[]) => setCartCount(data));
    } catch (err: any) {
      setError(err.message);
      setCartCount([]);
    }
  }, [nowString]);

  return (
    <Card className='shadow border-0 p-3 mb-2'>
      <h3>Carrinhos Produzidos</h3>
      {!error ? (
        <Row>
          <Table striped responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th className='text-end'>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {cartCount.map(({ Turno, Contagem_Carrinhos, Data_apontamento }) => (
                <tr key={Turno + Data_apontamento}>
                  <td>{DisplayTurn[Turno]}</td>
                  <td className='text-end'>{Contagem_Carrinhos.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className='text-end'>
                  <strong>
                    {cartCount
                      .reduce((acc, curr) => acc + curr.Contagem_Carrinhos, 0)
                      .toLocaleString('pt-BR')}
                  </strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </Row>
      ) : (
        <div className='alert alert-warning text-center' role='alert'>
          <i className='bi bi-exclamation-triangle me-2'></i>
          {error}
        </div>
      )}
    </Card>
  );
};

export default HomeCartCountCart;
