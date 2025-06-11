import React from 'react';
import { Card, Row, Spinner, Table } from 'react-bootstrap';
import { useCartProductionQuery } from '../../../hooks/queries/useCartProductionQuery';
import { TurnoType } from '../../../interfaces/Carrinhos.interface';

const HomeCartCountCart: React.FC = () => {
  const { cartsData, totalCarts, isLoading } = useCartProductionQuery();

  const DisplayTurn: Record<TurnoType, string> = {
    MAT: 'Matutino',
    VES: 'Vespertino',
    NOT: 'Noturno',
  };

  return (
    <Card className='shadow border-0 p-1'>
      <div className='p-2'>
        <h3 className='m-0'>
          Carrinhos Produzidos
          {isLoading && <Spinner animation='border' size='sm' className='ms-2' />}
        </h3>
      </div>
      <Row>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Turno</th>
              <th className='text-end'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {cartsData.map(({ Turno, Contagem_Carrinhos, Data_apontamento }, index) => (
              <tr key={`${Turno}-${Data_apontamento}-${index}`}>
                <td>{DisplayTurn[Turno as TurnoType] || Turno}</td>
                <td className='text-end'>{Contagem_Carrinhos}</td>
              </tr>
            ))}
            <tr className='table-success'>
              <td>
                <strong>Total</strong>
              </td>
              <td className='text-end'>
                <strong>{totalCarts}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Row>
    </Card>
  );
};

export default HomeCartCountCart;
