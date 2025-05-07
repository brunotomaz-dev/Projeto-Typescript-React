import React, { useEffect, useState } from 'react';
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
}

const SegmentedButton: React.FC<iSegmentedButtonProps> = ({
  options,
  value: btnValue,
  onChange,
  rounded = 'medium',
  fullWidth = false,
}) => {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState(btnValue);

  // Estilo de arredondamento baseado na prop 'rounded'
  const roundStyle = {
    full: 'rounded-5',
    small: 'rounded-2',
    medium: 'rounded-3',
  }[rounded];

  // Estilo para o botão se 'fullWidth' for verdadeiro
  const fullWidthStyle = fullWidth ? 'w-100' : 'w-25';

  // Effect para sincronizar o valor ativo com o valor externo
  useEffect(() => {
    onChange?.(activeTab);
  }, [activeTab]);

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Nav
      variant='pills'
      className={`gap-1 p-1 bg-white ${roundStyle} shadow-sm ${fullWidthStyle}`}
      activeKey={activeTab}
      onSelect={(selectedKey) => setActiveTab(selectedKey || btnValue)}
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
        <Nav.Item>
          <Nav.Link key={option.value} eventKey={option.value} className={roundStyle}>
            {option.icon && option.icon}
            {option.label}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default SegmentedButton;
