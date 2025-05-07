// Criar componente react de dropdown de turno
import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

interface iTurno {
  id: number;
  turno: string;
  name: string;
}

interface iDropdownTurnoProps {
  turnos: iTurno[];
  onTurnoChange: (turno: string) => void;
}

const DropdownTurno: React.FC<iDropdownTurnoProps> = ({ turnos, onTurnoChange }) => {
  const [selectedTurno, setSelectedTurno] = useState<string>('');

  /* ------------------------------------------- Texto de exibição ------------------------------------------ */
  const getDisplayText = () => {
    if (!selectedTurno) return 'Selecione um turno';
    const turno = turnos.find((t) => t.turno === selectedTurno);
    return turno?.name || 'Selecione um turno';
  };

  const handleTurnoChange = (turno: string) => {
    setSelectedTurno(turno);
    onTurnoChange(turno);
  };

  return (
    <Dropdown className='mb-2'>
      <Dropdown.Toggle variant='light' id='dropdown-basic'>
        {getDisplayText()}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleTurnoChange('')} active={selectedTurno === ''}>
          Todos os turnos
        </Dropdown.Item>
        <Dropdown.Divider />
        {turnos.map((turno) => (
          <Dropdown.Item
            key={turno.id}
            onClick={() => handleTurnoChange(turno.turno)}
            active={selectedTurno === turno.turno}
          >
            {turno.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownTurno;
