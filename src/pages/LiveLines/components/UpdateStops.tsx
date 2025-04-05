import React, { useEffect, useState } from 'react';
import { Button, Card, Table } from 'react-bootstrap';
import { getMaquinaIHM } from '../../../api/apiRequests';
import { getShiftByTime } from '../../../helpers/turn';
import { iMaquinaIHM } from '../interfaces/maquinaIhm.interface';
import EditStopModal from './ModalUpdate';

interface iUpdateStopsProps {
  selectedLine: number;
  selectedShift: string;
  selectedDate: string;
  nowDate: string;
}

const UpdateStops: React.FC<iUpdateStopsProps> = ({
  nowDate,
  selectedDate,
  selectedLine,
  selectedShift,
}) => {
  /* ----------------------------------------------------------------------------- Local State ---- */
  const [maquinaIHM, setMaquinaIHM] = useState<iMaquinaIHM[]>([]);
  const [selectedStop, setSelectedStop] = useState<iMaquinaIHM | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  /* --------------------------------------------------------------------------------- Effects ---- */
  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedLine, selectedShift, nowDate]);

  /* ------------------------------------------------------------------------------ Functions ---- */
  const fetchData = () => {
    if (nowDate === selectedDate) {
      void getMaquinaIHM({ data: selectedDate, linha: selectedLine })
        .then((res: iMaquinaIHM[]) => {
          // Verificar o turno do registro
          res = res.filter((item) => {
            const shift = getShiftByTime(item.hora_registro);
            return shift === selectedShift;
          });
          setMaquinaIHM(res);
        })
        .catch((err) => {
          console.log('err', err);
        });
    }
  };

  const handleEdit = (stop: iMaquinaIHM) => {
    setSelectedStop(stop);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedStop(null);
  };

  const handleSaveChanges = () => {
    fetchData(); // Recarregar dados após salvar
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Card className='p-2'>
        <Table striped hover size='sm' className='table-sm'>
          <thead>
            <tr>
              <th>Data</th>
              <th>Linha</th>
              <th>Máquina</th>
              <th>Motivo</th>
              <th>Equipamento</th>
              <th>Problema</th>
              <th>Causa</th>
              <th>Hora de Registro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {maquinaIHM.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.data_registro}</td>
                  <td>{item.linha}</td>
                  <td>{item.maquina_id}</td>
                  <td>{item.motivo}</td>
                  <td>{item.equipamento || '-'}</td>
                  <td>{item.problema}</td>
                  <td>{item.causa}</td>
                  <td>{item.hora_registro}</td>
                  <td>
                    <Button
                      variant='outline-primary'
                      size='sm'
                      onClick={() => handleEdit(item)}
                    >
                      <i className='bi bi-pencil-fill'></i>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <EditStopModal
        show={showEditModal}
        onHide={handleCloseModal}
        stopData={selectedStop}
        onSave={handleSaveChanges}
      />
    </>
  );
};

export default UpdateStops;
