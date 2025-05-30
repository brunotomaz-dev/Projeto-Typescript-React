import React from 'react';
import { TurnoID } from '../helpers/constants';
import SegmentedButton from './SegmentedButton';

interface iSegmentedTurnBtnProps {
  turn: TurnoID;
  onTurnChange?: (turn: TurnoID) => void;
  all?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  id?: string;
}

const SegmentedTurnBtn: React.FC<iSegmentedTurnBtnProps> = ({
  turn,
  onTurnChange,
  all = false,
  small = false,
  fullWidth = false,
  id = 'segmented-btn-turn',
}) => {
  // Define as opções de turno
  const turnOptions = [
    { value: 'NOT' as TurnoID, label: 'Noturno' },
    { value: 'MAT' as TurnoID, label: 'Matutino' },
    { value: 'VES' as TurnoID, label: 'Vespertino' },
  ];

  // Adiciona a opção "Total" se a prop all for verdadeira
  if (turnOptions.length < 4 && all) {
    turnOptions.push({ value: 'ALL' as TurnoID, label: 'Total' });
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
      fullWidth={fullWidth}
    />
  );
};

export default SegmentedTurnBtn;
