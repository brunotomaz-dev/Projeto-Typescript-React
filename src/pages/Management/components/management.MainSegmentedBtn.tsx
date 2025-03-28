import React, { useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { BsBox } from 'react-icons/bs';
import { IoBarChart } from 'react-icons/io5';

interface MNGMainSegmentedBtnProps {
  setBtnChoice: (btn: string) => void;
}

const MNGMainSegmentedBtn: React.FC<MNGMainSegmentedBtnProps> = ({ setBtnChoice }) => {
  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [btnClicked, setBtnClicked] = useState('dashboards');
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
        onClick={() => handleBtnClick('dashboards')}
        active={btnClicked === 'dashboards'}
      >
        <IoBarChart className='mb-1 me-1' /> Dashboards
      </Button>
      <Button
        variant='light'
        onClick={() => handleBtnClick('production')}
        active={btnClicked === 'production'}
      >
        <BsBox className='mb-1 me-1' /> Produção
      </Button>
    </ButtonGroup>
  );
};

export default MNGMainSegmentedBtn;
