import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getOrdemServico } from '../../../api/apiRequests';
import { toTitleCase } from '../../../helpers/helper.functions';
import { useAppSelector } from '../../../redux/store/hooks';
import {
  iMaintenanceOrders,
  OS_Status,
  Service_Type,
} from '../../Manusis/interfaces/MaintenanceOrders';

interface iProps {
  isOpened: boolean;
  onHide?: () => void;
}

const ModalServiceHistory: React.FC<iProps> = ({ isOpened, onHide }) => {
  /* ------------------------------------------------------------------------------------------- Redux ---- */
  const machine = useAppSelector((state) => state.liveLines.selectedMachine);

  /* ---------------------------------------------------------------------------------------- Local State - */
  const [machineHistory, setMachineHistory] = useState<iMaintenanceOrders[]>([]);

  /* ---------------------------------------------------------------------------------------------- Fetch - */
  const fetchPreventiveMachineHistory = async () => {
    const response = await getOrdemServico({
      status_id: OS_Status.CLOSED,
      tipo_manutencao: Service_Type.PREVENTIVA,
      cod_ativo: machine,
    });
    if (response) {
      setMachineHistory(response);
    }
    console.log('response', response);
  };

  /* -------------------------------------------------------------------------------------------- Handles - */
  const handleClose = () => {
    setMachineHistory([]);
    onHide && onHide();
  };

  /* --------------------------------------------------------------------------------------------- Effect - */
  useEffect(() => {
    if (isOpened) {
      fetchPreventiveMachineHistory();
    }
  }, [isOpened]);

  /* ----------------------------------------------------------------------------------------- Constantes - */
  const title =
    machineHistory.length > 0 ? toTitleCase(machineHistory[0].ativo) : `Máquina: ${machine}`;

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Modal show={isOpened} size='lg' centered onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Histórico Manutenção</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3 className='fs-3 text-center'>{title}</h3>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalServiceHistory;
