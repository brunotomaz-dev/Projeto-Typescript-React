import React from 'react';
import { TurnoID } from '../helpers/constants';
import SegmentedButton from './SegmentedButton';

interface iSegmentedTurnBtnProps {
  turn: TurnoID;
  onTurnChange?: (turn: TurnoID) => void;
  all?: boolean;
  small?: boolean;
  width?: 25 | 50 | 75 | 100;
  id?: string;
  disabled?: {
    [key in TurnoID]?: boolean;
  };
}

const SegmentedTurnBtn: React.FC<iSegmentedTurnBtnProps> = ({
  turn,
  onTurnChange,
  all = false,
  small = false,
  width = 25,
  id = 'segmented-btn-turn',
  disabled = {},
}) => {
  // Define as opções de turno
  const turnOptions = [
    {
      value: 'NOT' as TurnoID,
      label: 'Noturno',
      icon: <i className='bi bi-moon-stars text-muted me-2'></i>,
      disabled: disabled['NOT'] || false,
    },
    {
      value: 'MAT' as TurnoID,
      label: 'Matutino',
      icon: <i className='bi bi-sun text-muted me-2'></i>,
      disabled: disabled['MAT'] || false,
    },
    {
      value: 'VES' as TurnoID,
      label: 'Vespertino',
      icon: <i className='bi bi-sunset text-muted me-2'></i>,
      disabled: disabled['VES'] || false,
    },
  ];

  // Adiciona a opção "Total" se a prop all for verdadeira
  if (turnOptions.length < 4 && all) {
    turnOptions.push({
      value: 'ALL' as TurnoID,
      label: 'Total',
      icon: <i className='bi bi-grid-fill text-muted me-2'></i>,
      disabled: disabled['ALL'] || false,
    });
  }

  /* ---------------------------------------------------- Handle ---------------------------------------------------- */
  // Função para lidar com a mudança de turno
  const handleTurnChange = (value: string) => {
    if (onTurnChange) {
      onTurnChange(value as TurnoID);
    }
  };

  /* ---------------------------------------------------------------------------------------------------------------- */
  /*                                                      LAYOUT                                                      */
  /* ---------------------------------------------------------------------------------------------------------------- */
  return (
    <SegmentedButton
      options={turnOptions}
      value={turn}
      onChange={handleTurnChange}
      id={id}
      small={small}
      width={width}
    />
  );
};

export default SegmentedTurnBtn;
