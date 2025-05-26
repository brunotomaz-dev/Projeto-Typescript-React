import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

interface ScrollToTopProps {
  scrollThreshold?: number;
  bottom?: number;
  right?: number;
  size?: 'sm' | 'lg' | undefined;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  scrollThreshold = 300,
  bottom = 20,
  right = 20,
  size = 'sm',
}) => {
  // Estado para controlar a visibilidade do botão
  const [isVisible, setIsVisible] = useState(false);

  // Função para verificar a posição do scroll e atualizar a visibilidade do botão
  const toggleVisibility = () => {
    if (window.pageYOffset > scrollThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Função para rolar de volta ao topo com animação suave
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Adicionar e remover o listener de scroll
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Estilo inline para o botão flutuante
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `${bottom}px`,
    right: `${right}px`,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    borderRadius: '50%',
    width: size === 'sm' ? '40px' : '50px',
    height: size === 'sm' ? '40px' : '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: isVisible ? 'all' : 'none',
    zIndex: 1000,
  };

  return (
    <Button
      variant='outline-secondary'
      style={buttonStyle}
      onClick={scrollToTop}
      title='Voltar ao topo'
      size={size}
      className={isVisible ? 'scroll-top-visible' : ''}
      aria-label='Voltar ao topo'
    >
      <i className='bi bi-arrow-up'></i>
    </Button>
  );
};

export default ScrollToTop;
