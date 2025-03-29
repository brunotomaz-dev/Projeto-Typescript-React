import React, { useEffect, useRef, useState } from 'react';
import { ButtonGroup } from 'react-bootstrap';

// Interface para as opções do botão segmentado
interface SegmentOption<T> {
  value: T; // Valor da opção (pode ser qualquer tipo)
  label: string; // Texto a ser exibido
  icon?: React.ReactNode; // Ícone opcional
  disabled?: boolean; // Permite desabilitar opções individuais
}

// Props do componente
interface SegmentedButtonProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'modern' | 'subtle';
  className?: string;
  iconPosition?: 'start' | 'end' | 'top' | 'none';
  compact?: boolean; // Para versão mais compacta
  ariaLabel?: string; // Descrição de acessibilidade
}

function SegmentedButton<T>({
  options,
  value,
  onChange,
  fullWidth = false,
  size = 'md',
  variant = 'default',
  className = '',
  iconPosition = 'start',
  compact = false,
  ariaLabel = 'Opções de navegação',
}: SegmentedButtonProps<T>) {
  const [selectedValue, setSelectedValue] = useState<T>(value);
  const buttonGroupRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Sincronizar com o valor externo quando ele mudar
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value]);

  // Atualizar o indicador quando mudar a seleção
  useEffect(() => {
    updateIndicatorPosition();
  }, [selectedValue, options]);

  // Atualizar o indicador em caso de resize
  useEffect(() => {
    window.addEventListener('resize', updateIndicatorPosition);
    return () => {
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, []);

  const handleButtonClick = (optionValue: T) => {
    if (optionValue === selectedValue) return; // Evitar atualizações desnecessárias

    setSelectedValue(optionValue);
    if (onChange) {
      onChange(optionValue);
    }
  };

  // Calcular a posição do indicador deslizante
  const updateIndicatorPosition = () => {
    if (!buttonGroupRef.current) return;

    const buttonGroup = buttonGroupRef.current;
    const buttons = buttonGroup.querySelectorAll('button');

    // Encontrar o índice do botão selecionado
    const index = options.findIndex(
      (option) => JSON.stringify(option.value) === JSON.stringify(selectedValue)
    );

    if (index >= 0 && index < buttons.length) {
      const selectedButton = buttons[index];

      setIndicatorStyle({
        left: `${selectedButton.offsetLeft}px`,
        width: `${selectedButton.offsetWidth}px`,
        opacity: 1,
      });
    }
  };

  // Classes CSS com base nas props
  const containerClasses = [
    'segmented-button-container',
    variant,
    size,
    fullWidth ? 'w-100' : '',
    compact ? 'compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonGroupClasses = [
    'segmented-button-group',
    variant,
    size,
    fullWidth ? 'w-100' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const buttonClasses = `segmented-btn ${variant} ${size}`;

  // Renderizar o conteúdo do botão (ícone + texto)
  const renderButtonContent = (option: SegmentOption<T>) => {
    const { label, icon } = option;

    if (!icon || iconPosition === 'none') {
      return label;
    }

    const iconElement = <span className='segmented-btn-icon'>{icon}</span>;
    const textElement = <span className='segmented-btn-text'>{label}</span>;

    switch (iconPosition) {
      case 'start':
        return (
          <div className='d-flex align-items-center'>
            {iconElement}
            {textElement}
          </div>
        );
      case 'end':
        return (
          <div className='d-flex align-items-center'>
            {textElement}
            {iconElement}
          </div>
        );
      case 'top':
        return (
          <div className='d-flex flex-column align-items-center'>
            {iconElement}
            {textElement}
          </div>
        );
      default:
        return label;
    }
  };

  return (
    <div className={containerClasses}>
      <ButtonGroup
        ref={buttonGroupRef}
        className={buttonGroupClasses}
        role='group'
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const isSelected =
            JSON.stringify(option.value) === JSON.stringify(selectedValue);
          return (
            <button
              key={String(option.value)}
              type='button'
              className={`${buttonClasses} ${isSelected ? 'active' : ''}`}
              onClick={() => handleButtonClick(option.value)}
              disabled={option.disabled}
              aria-pressed={isSelected}
              aria-label={option.label}
            >
              {renderButtonContent(option)}
            </button>
          );
        })}
        <div className='segmented-indicator' style={indicatorStyle} />
      </ButtonGroup>
    </div>
  );
}

export default SegmentedButton;
