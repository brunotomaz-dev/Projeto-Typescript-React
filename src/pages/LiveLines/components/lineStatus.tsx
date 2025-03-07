import React from 'react';
import { Row } from 'react-bootstrap';

interface MachineStatusProps {
  status?: string;
}

const MachineStatus: React.FC<MachineStatusProps> = ({ status }) => {
  const isRunning = status === 'true';

  return (
    <Row className={`card text-center mb-3 p-3 fs-3 text-light ${isRunning ? 'bg-success' : 'bg-danger'}`}>
      {isRunning ? 'Rodando' : 'Parada'}
    </Row>
  );
};

export default MachineStatus;
