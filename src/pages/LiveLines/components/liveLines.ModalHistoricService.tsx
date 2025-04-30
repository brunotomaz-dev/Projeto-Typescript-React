import React from 'react';
import { Button, Modal } from 'react-bootstrap';

interface iProps {
  isOpened: boolean;
  onHide?: () => void;
}

const ModalServiceHistory: React.FC<iProps> = ({ isOpened, onHide }) => {
  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Modal show={isOpened} size='lg' centered onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Histórico Manutenção</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1>Hello World!</h1>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalServiceHistory;
