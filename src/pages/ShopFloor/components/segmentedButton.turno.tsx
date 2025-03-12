import React, { useState } from 'react';
import { Button, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';

interface SegmentedButtonTurnoProps {
  turnos: { id: number; turno: string; name: string }[];
  /** Callback disparado quando um turno é selecionado.
   *
   * @param turno - O turno selecionado.
   */
  onTurnoChange: (turno: string) => void;
  /** Callback disparado quando a visualização muda entre "Por Linha" e "Por Turno".
   *
   * @param show - `true` para visualização "Por Linha", `false` para "Por Turno".
   */
  onByLineChange: (show: boolean) => void;
}

/**
 * Componente que exibe botões segmentados para selecionar a visualização por turno ou por linha,
 * e um dropdown para selecionar o turno quando a visualização é por linha.
 * @param {SegmentedButtonTurnoProps} props - Propriedades do componente.
 * @returns {JSX.Element} - Elemento JSX do componente.
 * @example
 * ```
 * const handleTurnoChange = (turno: string) => {
 *  console.log(turno);
 * };
 * const handleLineTurnChange = (show: boolean) => {
 * console.log(show);
 * };
 * ```
 * ```tsx
 * return (
 * <SegmentedButtonTurno
 *  turnos={TurnosObj}
 * onTurnoChange={handleTurnoChange}
 * onByLineChange={handleLineTurnChange}
 * />
 * );
 * ```
 */

const SegmentedButtonTurno: React.FC<SegmentedButtonTurnoProps> = ({
  turnos,
  onTurnoChange,
  onByLineChange,
}) => {
  const [selectedTurno, setSelectedTurno] = useState('');
  const [showByLine, setShowByLine] = useState<boolean>(false);

  // Retorna o texto a ser exibido no botão de seleção de turno
  const getDisplayText = () => {
    if (!selectedTurno) return 'Selecione um turno';
    const turno = turnos.find((t) => t.turno === selectedTurno);
    return turno?.name || 'Selecione um turno';
  };

  const handleTurnoChange = (turno: string) => {
    setSelectedTurno(turno);
    onTurnoChange(turno);
  };

  // Altera o estado de visualização e chama o callback
  const handleShowByLine = (show: boolean) => {
    setShowByLine(show);
    if (!show) setSelectedTurno('');
    onByLineChange(show);
  };

  return (
    <ButtonGroup className='mb-2 w-50 shadow'>
      <Button
        variant='light'
        onClick={() => handleShowByLine(false)}
        active={!showByLine}
      >
        Por Turno
      </Button>
      <Button variant='light' onClick={() => handleShowByLine(true)} active={showByLine}>
        Por Linha
      </Button>
      {showByLine && (
        <DropdownButton
          as={ButtonGroup}
          title={getDisplayText()}
          id='bg-nested-dropdown'
          variant='light'
          className='turno-dropdown'
        >
          <Dropdown.Item
            onClick={() => handleTurnoChange('')}
            active={selectedTurno === ''}
          >
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
        </DropdownButton>
      )}
    </ButtonGroup>
  );
};

export default SegmentedButtonTurno;
