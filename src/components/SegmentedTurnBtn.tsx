import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { TurnoID } from '../helpers/constants';

interface iSegmentedTurnBtnProps {
  turn: TurnoID;
  onTurnChange?: (turn: TurnoID) => void;
}

const SegmentedTurnBtn: React.FC<iSegmentedTurnBtnProps> = ({ turn, onTurnChange }) => {
  const [selectedTurn, setSelectedTurn] = useState<TurnoID>(turn);

  const handleBtnClick = (turno: TurnoID) => {
    setSelectedTurn(turno);
    if (onTurnChange) {
      onTurnChange(turno);
    }
  };
  return (
    <ButtonGroup className='shadow'>
      <Button
        variant='light'
        // variant={selectedTurn === 'MAT' ? 'primary' : 'light'}
        onClick={() => handleBtnClick('MAT')}
        active={selectedTurn === 'MAT'}
      >
        Matutino
      </Button>
      <Button
        variant='light'
        // variant={selectedTurn === 'VES' ? 'primary' : 'light'}
        onClick={() => handleBtnClick('VES')}
        active={selectedTurn === 'VES'}
      >
        Vespertino
      </Button>
      <Button
        variant='light'
        // variant={selectedTurn === 'NOT' ? 'primary' : 'light'}
        onClick={() => handleBtnClick('NOT')}
        active={selectedTurn === 'NOT'}
      >
        Noturno
      </Button>
    </ButtonGroup>
  );
};

export default SegmentedTurnBtn;
