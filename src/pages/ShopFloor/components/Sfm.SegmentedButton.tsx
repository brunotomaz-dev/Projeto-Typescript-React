import React, { useEffect, useState } from 'react';
import { Dropdown, Nav } from 'react-bootstrap';

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
  /* ---------------------------------------------------------------------------------------- Local State - */
  const [viewMode, setViewMode] = useState<string>('byTurn');
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(viewMode);
  const [dropdownActive, setDropdownActive] = useState(false);

  /* -------------------------------------------------------------------------------------------- Options - */
  // Opções para o botão segmentado
  const viewOptions = [
    { value: 'byTurn', label: 'Por Turno' },
    { value: 'byLine', label: 'Por Linha' },
  ];

  // Converter o array de turnos para o formato aceito pelo dropdown
  const turnoDropdownOptions = turnos.map((turno) => ({
    value: turno.turno,
    label: turno.name,
  }));

  const selectedTurnoOption = turnoDropdownOptions.find((option) => option.value === selectedTurno);
  const selectedTurnoLabel = selectedTurnoOption ? selectedTurnoOption.label : 'Selecione um turno';

  /* -------------------------------------------------------------------------------------------- Handles - */
  // Função para lidar com mudanças no modo de visualização
  const handleViewChange = (mode: string) => {
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

  /* ----------------------------------------------------------------------------------------- Componente - */
  // Criação do componente NavLinks
  const NavLinks: React.FC = () => {
    return (
      <>
        {viewOptions.map((option) => (
          <Nav.Item>
            <Nav.Link key={option.value} eventKey={option.value} className='rounded-5'>
              {option.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </>
    );
  };

  /* --------------------------------------------------------------------------------------------- Effect - */
  // Effect para sincronizar o valor ativo com o valor externo
  useEffect(() => {
    handleViewChange(activeTab);
  }, [activeTab]);

  /* ------------------------------------------------ Style ----------------------------------------------- */
  const dropdownStyle = {
    backgroundColor: dropdownActive ? 'var(--bs-light-grey)' : 'var(--bs-white)',
    color: 'var(--bs-secondary)',
    borderColor: dropdownActive ? 'var(--bs-light-grey)' : '',
    transition: 'background-color 0.2s ease',
  };

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Nav
      variant='pills'
      className='gap-1 p-1 bg-white rounded-5 shadow-sm w-75 mx-auto mb-2 d-flex justify-content-center align-items-center'
      activeKey={activeTab}
      onSelect={(selectedKey) => setActiveTab(selectedKey || viewMode)}
      fill
      style={
        {
          '--bs-nav-pills-link-active-bg': 'var(--bs-light-grey)',
          '--bs-nav-pills-link-active-color': 'var(--bs-secondary)',
          '--bs-nav-link-color': 'var(--bs-secondary)',
        } as React.CSSProperties
      }
    >
      <NavLinks />
      {activeTab === 'byLine' && (
        <Dropdown onToggle={() => setDropdownActive(!dropdownActive)}>
          <Dropdown.Toggle
            variant='light'
            className='rounded-5'
            disabled={activeTab !== 'byLine'}
            style={dropdownStyle}
          >
            {selectedTurnoLabel}
          </Dropdown.Toggle>
          <Dropdown.Menu className='rounded-2 shadow border-0 bg-light-grey-sfm'>
            {turnoDropdownOptions.map((option) => (
              <Dropdown.Item key={option.value} onClick={() => handleTurnoChange(option.value)}>
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
    </Nav>
  );
};

export default SegmentedButtonTurno;
