import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import SegmentedButton from './SegmentedButton';

// Opção para dropdown
interface DropdownOption<T> {
  value: T;
  label: string;
}

// Props do componente
interface SegmentedButtonWithDropdownProps<T, D> {
  options: Array<{
    value: T;
    label: string;
    icon?: React.ReactNode;
    hasDropdown?: boolean;
  }>;
  value: T;
  onChange: (value: T) => void;
  dropdownOptions?: DropdownOption<D>[];
  dropdownValue?: D | null;
  onDropdownChange?: (value: D | null) => void;
  dropdownTitle?: string;
  enableDropdownFor?: T; // Valor para o qual habilitar o dropdown
  variant?: 'default' | 'pills' | 'modern' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
  dropdownPlaceholderWhenDisabled?: string;
}

function SegmentedButtonWithDropdown<T, D>({
  options,
  value,
  onChange,
  dropdownOptions = [],
  dropdownValue = null,
  onDropdownChange,
  dropdownTitle = 'Selecione uma opção',
  enableDropdownFor,
  variant = 'modern',
  size = 'md',
  fullWidth = false,
  allowEmpty = true,
  emptyOptionLabel = 'Todas as opções',
  dropdownPlaceholderWhenDisabled = 'Selecione "Por Linha"',
}: SegmentedButtonWithDropdownProps<T, D>) {
  // Estado local para o valor selecionado no dropdown
  const [localDropdownValue, setLocalDropdownValue] = useState<D | null>(dropdownValue);

  // Estado para controlar se o dropdown está aberto
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Verificar se o dropdown deve estar ativo
  const isDropdownEnabled =
    enableDropdownFor !== undefined &&
    JSON.stringify(value) === JSON.stringify(enableDropdownFor);

  // Refs para medir e ajustar tamanhos dos botões
  const segmentedBtnGroupRef = useRef<HTMLDivElement>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement>(null);

  // Estado para armazenar a largura calculada
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  // Atualizar estado local quando props mudam
  useEffect(() => {
    if (dropdownValue !== localDropdownValue) {
      setLocalDropdownValue(dropdownValue);
    }
  }, [dropdownValue]);

  // Reset dropdown value when disabling it (optional, remove if you want to preserve the selection)
  useEffect(() => {
    if (!isDropdownEnabled && localDropdownValue !== null) {
      setLocalDropdownValue(null);
      if (onDropdownChange) {
        onDropdownChange(null);
      }
    }
  }, [isDropdownEnabled]);

  // Determinar o texto a ser exibido no dropdown
  const getDisplayText = () => {
    // Se o dropdown estiver desabilitado, mostrar o texto de placeholder
    if (!isDropdownEnabled) {
      return dropdownPlaceholderWhenDisabled;
    }

    // Se não houver valor selecionado, mostrar o título padrão
    if (localDropdownValue === null) {
      return dropdownTitle;
    }

    // Se houver um valor selecionado, mostrar o rótulo correspondente
    const selected = dropdownOptions.find(
      (option) => JSON.stringify(option.value) === JSON.stringify(localDropdownValue)
    );

    return selected ? selected.label : dropdownTitle;
  };

  // Manipular mudança no dropdown
  const handleDropdownChange = (itemValue: D | null) => {
    if (!isDropdownEnabled) return; // Não fazer nada se o dropdown estiver desabilitado

    setLocalDropdownValue(itemValue);
    if (onDropdownChange) {
      onDropdownChange(itemValue);
    }
    // Fechar o dropdown após a seleção
    setIsDropdownOpen(false);
  };

  // Manipular clique no botão do dropdown
  const handleDropdownClick = () => {
    if (!isDropdownEnabled) return; // Não fazer nada se o dropdown estiver desabilitado
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Determinar as classes do dropdown com base no variant
  const getDropdownClasses = () => {
    const baseClasses = ['segmented-dropdown', size];

    switch (variant) {
      case 'modern':
        return [...baseClasses, 'modern-dropdown'].join(' ');
      case 'pills':
        return [...baseClasses, 'pills-dropdown'].join(' ');
      case 'subtle':
        return [...baseClasses, 'subtle-dropdown'].join(' ');
      default:
        return [...baseClasses, 'default-dropdown'].join(' ');
    }
  };

  // Determinar as classes para o botão do dropdown
  const getToggleButtonClasses = () => {
    const baseClasses = ['dropdown-toggle', `dropdown-toggle-${variant}`];

    if (isDropdownOpen) {
      baseClasses.push('active');
    }

    return baseClasses.join(' ');
  };

  // Determinar classes para o botão
  const getButtonClasses = () => {
    const classes = ['segmented-btn', variant, size, 'dropdown-button'];

    if (isDropdownOpen) {
      classes.push('active');
    }

    if (!isDropdownEnabled) {
      classes.push('disabled');
    }

    return classes.join(' ');
  };

  // Calcular larguras para torná-las uniformes
  useEffect(() => {
    const calculateButtonWidth = () => {
      if (segmentedBtnGroupRef.current) {
        const segmentedButtons =
          segmentedBtnGroupRef.current.querySelectorAll('.segmented-btn');

        if (segmentedButtons.length > 0) {
          // Calcular a média de largura dos botões do SegmentedButton
          const totalWidth = Array.from(segmentedButtons).reduce(
            (sum, btn) => sum + btn.clientWidth,
            0
          );

          const averageWidth = totalWidth / segmentedButtons.length;

          // Ajustar largura do dropdown para corresponder à média
          setButtonWidth(averageWidth);
        }
      }
    };

    // Calcular quando o componente é montado e quando as opções mudam
    calculateButtonWidth();

    // Também recalcular quando a janela for redimensionada
    window.addEventListener('resize', calculateButtonWidth);
    return () => {
      window.removeEventListener('resize', calculateButtonWidth);
    };
  }, [options, value]);

  return (
    <div className='segmented-with-dropdown-container'>
      <div
        className={`segmented-section ${fullWidth ? 'w-100' : ''}`}
        ref={segmentedBtnGroupRef}
      >
        <SegmentedButton
          options={options}
          value={value}
          onChange={onChange}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
        />
      </div>

      <div
        className={`dropdown-section ${variant} ${size} ${!isDropdownEnabled ? 'disabled' : ''}`}
      >
        <Dropdown
          show={isDropdownEnabled && isDropdownOpen}
          onToggle={(isOpen) => isDropdownEnabled && setIsDropdownOpen(isOpen)}
        >
          <Dropdown.Toggle
            as='div'
            id='dropdown-custom-toggle'
            className={getToggleButtonClasses()}
          >
            <button
              ref={dropdownBtnRef}
              type='button'
              className={getButtonClasses()}
              onClick={handleDropdownClick}
              disabled={!isDropdownEnabled}
              aria-disabled={!isDropdownEnabled}
              style={{
                boxShadow: 'none',
                border: 'none',
                height: '100%',
                width: buttonWidth ? `${buttonWidth}px` : 'auto', // Usar a largura calculada
                minWidth: '120px', // Garantir uma largura mínima
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: variant === 'modern' ? '10px 16px' : '8px 16px',
                opacity: isDropdownEnabled ? 1 : 0.65, // Reduzir opacidade quando desabilitado
                cursor: isDropdownEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              <div className='d-flex align-items-center justify-content-center w-100'>
                <span
                  className='selected-text text-truncate me-2'
                  style={{ maxWidth: '85%' }}
                >
                  {getDisplayText()}
                </span>
                {isDropdownEnabled && (
                  <i
                    className={`bi ${isDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                    style={{ fontSize: '0.65em', flexShrink: 0 }}
                  ></i>
                )}
              </div>
            </button>
          </Dropdown.Toggle>

          <Dropdown.Menu className={getDropdownClasses()}>
            {allowEmpty && (
              <>
                <Dropdown.Item
                  onClick={() => handleDropdownChange(null)}
                  active={localDropdownValue === null}
                  className='dropdown-item-custom'
                >
                  {emptyOptionLabel}
                </Dropdown.Item>
                <Dropdown.Divider />
              </>
            )}

            {dropdownOptions.map((option, index) => (
              <Dropdown.Item
                key={index}
                onClick={() => handleDropdownChange(option.value)}
                active={
                  JSON.stringify(localDropdownValue) === JSON.stringify(option.value)
                }
                className='dropdown-item-custom'
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}

export default SegmentedButtonWithDropdown;
