import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

interface MNGMainSegmentedBtnProps {
  setBtnChoice: (btn: string) => void;
}

const MNGMainSegmentedBtn: React.FC<MNGMainSegmentedBtnProps> = ({ setBtnChoice }) => {
  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [btnClicked, setBtnClicked] = useState('production');
  /* ------------------------------------------- HANDLES ------------------------------------------ */
  const handleBtnClick = (btn: string) => {
    setBtnChoice(btn);
    setBtnClicked(btn);
  };

  /* ------------------------------------------- LAYOUT ------------------------------------------- */
  return (
    <ButtonGroup className='shadow'>
      <Button
        variant='light'
        onClick={() => handleBtnClick('production')}
        active={btnClicked === 'production'}
      >
        Produção
      </Button>
      <Button
        variant='light'
        onClick={() => handleBtnClick('stops')}
        active={btnClicked === 'stops'}
      >
        Paradas
      </Button>
    </ButtonGroup>
  );
};

export default MNGMainSegmentedBtn;
