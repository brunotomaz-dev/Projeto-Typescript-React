import { useCallback, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Exibe um toast com a mensagem e tipo especificados
   * @param message Mensagem a ser exibida
   * @param type Tipo do toast (success, danger, warning, info)
   */
  const showToast = useCallback(
    (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-remove após 3 segundos
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  /**
   * Remove um toast específico pelo ID
   * @param id ID do toast a ser removido
   */
  const closeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Componente React que renderiza os toasts
   */
  const ToastDisplay = useCallback(
    () => (
      <ToastContainer
        className='p-3'
        position='bottom-end'
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1070 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => closeToast(toast.id)}
            bg={toast.type}
            className='mb-2 shadow-lg'
            autohide
            delay={3000}
          >
            <Toast.Header>
              <strong className='me-auto'>
                {toast.type === 'success' && '✓ Sucesso!'}
                {toast.type === 'danger' && '⚠ Erro!'}
                {toast.type === 'warning' && '⚠ Atenção!'}
                {toast.type === 'info' && 'ℹ Informação'}
              </strong>
              <small>agora</small>
            </Toast.Header>
            <Toast.Body
              className={['danger', 'success'].includes(toast.type) ? 'text-white' : ''}
            >
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    ),
    [toasts, closeToast]
  );

  return { showToast, ToastDisplay };
};
