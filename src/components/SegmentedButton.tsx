import React, { useEffect, useRef } from 'react';
import { Nav } from 'react-bootstrap';

interface iSegmanetedButtonOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface iSegmentedButtonProps {
  options: iSegmanetedButtonOption[];
  value: string;
  onChange?: (value: string) => void;
  rounded?: 'full' | 'small' | 'medium';
  fullWidth?: boolean;
  small?: boolean;
  id?: string;
}

const SegmentedButton: React.FC<iSegmentedButtonProps> = ({
  options,
  value,
  onChange,
  rounded = 'medium',
  fullWidth = false,
  small = false,
  id = 'segmented-button',
}) => {
  /* ---------------------------------------------------- Use Ref --------------------------------------------------- */
  const isFirstRender = useRef(true);

  /* ---------------------------------------------------- Effect ---------------------------------------------------- */
  useEffect(() => {
    // Adicionar uma pequena demora artificial apenas na primeira renderização
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Forçar re-renderização após primeiro render para garantir que os estilos sejam aplicados
      const timer = setTimeout(() => {
        // Este setState vazio força uma re-renderização
        // eslint-disable-next-line
        setState({});
      }, 50);

      return () => clearTimeout(timer);
    }
  }, []);

  /* ---------------------------------------------------- Handles --------------------------------------------------- */
  // Estado vazio apenas para forçar re-renderização
  const [_state, setState] = React.useState({});

  // Estilo de arredondamento baseado na prop 'rounded'
  const roundStyle = {
    full: 'rounded-5',
    small: 'rounded-2',
    medium: 'rounded-3',
  }[rounded];

  // Estilo para o botão se 'fullWidth' for verdadeiro
  const fullWidthStyle = fullWidth ? 'w-100' : 'w-25';

  // Manipulador para quando o usuário clica em uma opção
  const handleSelect = (selectedKey: string | null) => {
    if (selectedKey && onChange) {
      onChange(selectedKey);
    }
  };

  // Aplicar estilo diretamente por CSS customizado
  const customStyles = `
    .navbar-pill-active {
      background-color: var(--bs-light-grey) !important;
      color: var(--bs-secondary) !important;
    }`;

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <>
      <style>{customStyles}</style>
      <Nav
        key={id}
        variant='pills'
        className={`gap-1 p-1 bg-white ${roundStyle} shadow-sm ${fullWidthStyle} ${small ? 'small' : ''}`}
        activeKey={value}
        onSelect={handleSelect}
        fill
        style={
          {
            '--bs-nav-pills-link-active-bg': 'var(--bs-light-grey)',
            '--bs-nav-pills-link-active-color': 'var(--bs-secondary)',
            '--bs-nav-link-color': 'var(--bs-secondary)',
          } as React.CSSProperties
        }
      >
        {options.map((option) => (
          <Nav.Item key={`item-${option.value}-${id}`}>
            <Nav.Link
              eventKey={option.value}
              className={`${roundStyle} ${option.value === value ? 'navbar-pill-active' : ''}`}
              disabled={option.disabled}
              key={`link-${option.value}-${id}`}
            >
              {option.icon && option.icon}
              {option.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </>
  );
};

export default SegmentedButton;
