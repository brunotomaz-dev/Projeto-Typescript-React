import React from 'react';
import { Button, Card } from 'react-bootstrap';
import ActionPlanOperatorsFormModal from '../../../components/actionPlanOperatorsFormModal';
import { useActionPlanModal } from '../../../hooks/useActionPlanModal';
import { resetModalActionPlanCall } from '../../../redux/store/features/uiStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';

const ActionPlanCardOperators: React.FC = () => {
  const SCOPE = 'operators';
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  // Hook do Modal de Plano de ação
  const { openModal, createFromStopData } = useActionPlanModal(SCOPE);
  const callModal = useAppSelector((state) => state.uiState.modalActionPlanCall[SCOPE]);
  const stopsData = useAppSelector((state) => state.clickData.stopsData);
  const dispatch = useAppDispatch();

  if (callModal && stopsData) {
    createFromStopData(stopsData);
    dispatch(resetModalActionPlanCall(SCOPE));
  }

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  const handleBtnClick = () => {
    openModal({ mode: 'create' });
  };
  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Card className='shadow border-0 bg-light p-3 mb-3'>
        <section className='d-flex justify-content-between align-items-center mb-3'>
          <h5 className='mb-0'>Plano de Ação</h5>
          <Button variant='primary' size='sm' onClick={handleBtnClick}>
            <i className='bi bi-plus-circle me-1'></i>
            Novo Plano
          </Button>
        </section>
        <Card.Body className='text-center text-muted'>
          <i className='bi bi-clipboard-check' style={{ fontSize: '2rem' }}></i>
          <p className='mt-2 mb-1'>Crie planos de ação para resolver problemas identificados</p>
          <small>Clique nas paradas acima ou no botão "Novo Plano" para começar</small>
        </Card.Body>
      </Card>
      <ActionPlanOperatorsFormModal />
    </>
  );
};

export default ActionPlanCardOperators;
