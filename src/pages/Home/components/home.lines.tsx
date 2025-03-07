import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Row, Table } from 'react-bootstrap';
import { getMaquinaInfo } from '../../../api/apiRequests';
import { getShift } from '../../../helpers/turn';
import { iMaquinaInfo } from '../../../interfaces/MaquinaInfo.interface';
import { useAppSelector } from '../../../redux/store/hooks';
import { RootState } from '../../../redux/store/store';

interface iMaquinas {
  maquina_id: string;
  linha: number;
  status: string;
  produto: string;
}

const HomeLinesCard: React.FC = () => {
  const now = startOfDay(new Date());
  const nowDate = format(now, 'yyyy-MM-dd');
  const [machines, setMachines] = useState<iMaquinas[]>([]);
  const lineMachine = useAppSelector((state: RootState) => state.home.lineMachine as { [key: string]: number });

  useEffect(() => {
    const turno = getShift();
    void getMaquinaInfo({ data: nowDate, turno: turno }).then((data: iMaquinaInfo[]) => {
      const sortedData = [...data].sort((a, b) => b.recno - a.recno);
      const uniqueMachines = sortedData.reduce<Record<string, iMaquinas>>((acc, curr) => {
        if (!acc[curr.maquina_id]) {
          acc[curr.maquina_id] = {
            maquina_id: curr.maquina_id,
            linha: lineMachine[curr.maquina_id] ?? 0,
            status: curr.status === 'true' ? 'Rodando' : 'Parada',
            produto: curr.produto.trim(),
          };
        }
        return acc;
      }, {});
      // Converter para array para poder ordenar
      const uniqueMachinesArray = Object.values(uniqueMachines)
        // Mantém apenas as linhas que estão Rodando
        .filter((machine) => machine.status === 'Rodando')
        // Ordena por linha
        .sort((a, b) => a.linha - b.linha);

      setMachines(uniqueMachinesArray);
    });
  }, [nowDate, lineMachine]);

  return (
    <Card className="shadow border-0 p-3 mb-2">
      <h3>Linhas</h3>
      <Row>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Linha</th>
              <th>Status</th>
              <th>Produto</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.maquina_id}>
                <td>{machine.linha}</td>
                <td>{machine.status}</td>
                <td>{machine.produto}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Card>
  );
};

export default HomeLinesCard;
