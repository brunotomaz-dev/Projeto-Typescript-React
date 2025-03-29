import React, { useState } from 'react';
import SegmentedButtonWithDropdown from '../../../components/SegmentedButtonWithDropdown';

type ViewMode = 'byTurn' | 'byLine';
type TurnoOption = { id: number; turno: string; name: string };

interface SegmentedButtonTurnoProps {
  turnos: TurnoOption[];
  onTurnoChange: (turno: string) => void;
  onByLineChange: (show: boolean) => void;
}

const SegmentedButtonTurno: React.FC<SegmentedButtonTurnoProps> = ({
  turnos,
  onTurnoChange,
  onByLineChange,
}) => {
  // Estado para controlar o modo de visualização (byTurn ou byLine)
  const [viewMode, setViewMode] = useState<ViewMode>('byTurn');

  // Estado para armazenar o turno selecionado
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);

  // Opções para o botão segmentado
  const viewOptions = [
    { value: 'byTurn' as ViewMode, label: 'Por Turno' },
    { value: 'byLine' as ViewMode, label: 'Por Linha' },
  ];

  // Converter o array de turnos para o formato aceito pelo dropdown
  const turnoDropdownOptions = turnos.map((turno) => ({
    value: turno.turno,
    label: turno.name,
  }));

  // Função para lidar com mudanças no modo de visualização
  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);

    // Se mudar para 'byTurn', limpar seleção de turno
    if (mode === 'byTurn') {
      setSelectedTurno(null);
      onTurnoChange('');
    }

    // Informar o componente pai sobre a mudança
    onByLineChange(mode === 'byLine');
  };

  // Função para lidar com mudanças no dropdown de turno
  const handleTurnoChange = (turno: string | null) => {
    setSelectedTurno(turno);
    onTurnoChange(turno || '');
  };

  return (
    <div className='mb-3'>
      <SegmentedButtonWithDropdown
        options={viewOptions}
        value={viewMode}
        onChange={handleViewChange}
        dropdownOptions={turnoDropdownOptions}
        dropdownValue={selectedTurno}
        onDropdownChange={handleTurnoChange}
        enableDropdownFor='byLine'
        dropdownTitle='Selecione um turno'
        emptyOptionLabel='Todos os turnos'
        variant='pills'
        fullWidth={true}
        allowEmpty={true}
      />
    </div>
  );
};

export default SegmentedButtonTurno;
