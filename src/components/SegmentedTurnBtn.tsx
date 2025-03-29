import React from 'react';
import { TurnoID } from '../helpers/constants';
import SegmentedButton from './SegmentedButton';

interface iSegmentedTurnBtnProps {
  turn: TurnoID;
  onTurnChange?: (turn: TurnoID) => void;
  variant?: 'default' | 'pills' | 'modern' | 'subtle';
  all?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SegmentedTurnBtn: React.FC<iSegmentedTurnBtnProps> = ({
  turn,
  onTurnChange,
  variant = 'modern',
  all = false,
}) => {
  const turnOptions = [
    { value: 'NOT' as TurnoID, label: 'Noturno' },
    { value: 'MAT' as TurnoID, label: 'Matutino' },
    { value: 'VES' as TurnoID, label: 'Vespertino' },
  ];

  // Adiciona a opção "Total" se a prop all for verdadeira
  if (turnOptions.length < 4 && all) {
    turnOptions.push({ value: 'ALL' as TurnoID, label: 'Total' });
  }

  return (
    <SegmentedButton
      options={turnOptions}
      value={turn}
      onChange={onTurnChange}
      variant={variant}
    />
  );
};

export default SegmentedTurnBtn;
