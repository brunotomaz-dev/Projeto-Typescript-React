// cSpell: words superv recno usuario presencas lideranca panificacao saida autohide
import React, { useEffect } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { useAbsenceQuery } from '../../../hooks/queries/useAbsenceQuery';
import { useToast } from '../../../hooks/useToast';
import { AbsenceKinds } from '../../../interfaces/Absence.interface';
import { setAbsenceModal, setPresenceModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch } from '../../../redux/store/hooks';
import AbsenceTable from './superv.AbsTable';
import SuperCardsAbsence from './superv.CardsAbsence';
import AbsenceFormModal from './superv.ModalAbs';
import PresenceAddModal from './superv.PresModal';
import PresenceTable from './superv.PresenceTable';

interface iAbsenceProps {
  onPresenceChange: (total: number) => void;
}

const SupervAbsence: React.FC<iAbsenceProps> = ({ onPresenceChange }) => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recuperar o nome do usuário
  const dispatch = useAppDispatch();

  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const { counters, presenceData, totalPresentes } = useAbsenceQuery('supervision');

  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- EFFECTS ------------------------------------------ */

  useEffect(() => {
    // Notifica o componente pai sobre a mudança no número de presenças
    onPresenceChange(totalPresentes);
  }, [totalPresentes, onPresenceChange]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Abertura do modal para criação
  const handleModalOpen = (type: string) => {
    dispatch(
      setAbsenceModal({
        absenceModalVisible: true,
        absenceModalEdit: false,
        absenceModalType: type,
      })
    );
  };

  const handlePresenceModalOpen = () => {
    if (presenceData.length > 0) {
      // Se já existe registro de presença, não permite abrir o modal
      return showToast('Já existe registro de presença para o dia!', 'warning');
    }

    dispatch(
      setPresenceModal({
        presenceModalVisible: true,
        presenceModalEdit: false,
      })
    );
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Stack direction='horizontal' className='mb-3'>
        <SuperCardsAbsence
          title='Atrasos'
          value={counters.atrasos}
          onClick={() => handleModalOpen(AbsenceKinds.ATRASO)}
        />
        <SuperCardsAbsence
          title='Saída Antecipada'
          value={counters.saidaAntecipada}
          onClick={() => handleModalOpen(AbsenceKinds.SAIDA_ANTECIPADA)}
        />
        <SuperCardsAbsence
          title='Faltas'
          value={counters.faltas}
          onClick={() => handleModalOpen(AbsenceKinds.FALTA)}
        />
        <SuperCardsAbsence
          title='Afastamentos'
          value={counters.afastamentos}
          onClick={() => handleModalOpen(AbsenceKinds.AFASTAMENTO)}
        />
        <SuperCardsAbsence
          title='Férias'
          value={counters.ferias}
          onClick={() => handleModalOpen(AbsenceKinds.FERIAS)}
        />
        <SuperCardsAbsence
          title='Remanejados'
          value={counters.remanejados}
          onClick={() => handleModalOpen(AbsenceKinds.REMANEJAMENTO)}
        />
        <SuperCardsAbsence title='Presenças' value={totalPresentes} onClick={handlePresenceModalOpen} />
      </Stack>

      <AbsenceFormModal />

      <PresenceAddModal />

      <Row className='g-1 mb-3'>
        <Col xs={12} xl={9}>
          <AbsenceTable />
        </Col>
        <Col xs={12} xl>
          <PresenceTable />
        </Col>
      </Row>

      {/* Toast */}
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default SupervAbsence;
