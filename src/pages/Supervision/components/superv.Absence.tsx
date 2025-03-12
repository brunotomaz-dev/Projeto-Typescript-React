// cSpell: words superv recno usuario presencas lideranca panificacao saida autohide
import React, { useEffect, useState } from 'react';
import { Stack, Toast, ToastContainer } from 'react-bootstrap';
import {
  createAbsenceData,
  getAbsenceData,
  getPresenceData,
} from '../../../api/apiRequests';
import { iAbsence, iPresence } from '../../../interfaces/Absence.interface';
import { useAppSelector } from '../../../redux/store/hooks';
import { iAbsenceForm } from '../interface/AbsenceForm.interface';
import SuperCardsAbsence from './superv.CardsAbsence';
import AbsenceFormModal from './superv.ModalAbs';

interface iAbsenceProps {
  selectedDate: string;
  selectedTurno: string;
}

const SupervAbsence: React.FC<iAbsenceProps> = ({ selectedDate, selectedTurno }) => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recuperar o nome do usuário
  const userName = useAppSelector((state) => state.user.fullName);
  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [absenceData, setAbsenceData] = useState<iAbsence[]>([]);
  const [presenceData, setPresenceData] = useState<iPresence[]>([]);
  const [faltas, setFaltas] = useState<number>(0);
  const [atrasos, setAtrasos] = useState<number>(0);
  const [presencas, setPresencas] = useState<number>(0);
  const [afastamentos, setAfastamentos] = useState<number>(0);
  const [saidaAntecipada, setSaidaAntecipada] = useState<number>(0);
  const [remanejados, setRemanejados] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  useEffect(() => {
    void getAbsenceData(selectedDate).then((data: iAbsence[]) => {
      data = data.filter((absence) => absence.turno.trim() === selectedTurno);

      setAbsenceData(data);
    });

    void getPresenceData(selectedDate).then((data: iPresence[]) => {
      data = data.filter((presence) => presence.turno === selectedTurno);
      setPresenceData(data);
    });
  }, [selectedDate, selectedTurno]);

  // Contagem de faltas, atrasos, presenças, afastamentos, saídas antecipadas e remanejados
  useEffect(() => {
    const faltasCount = absenceData.filter((absence) => absence.tipo === 'Falta').length;
    const atrasosCount = absenceData.filter(
      (absence) => absence.tipo === 'Atraso'
    ).length;
    const afastamentosCount = absenceData.filter(
      (absence) => absence.tipo === 'Afastamento'
    ).length;
    const saidaAntecipadaCount = absenceData.filter(
      (absence) => absence.tipo === 'Saída Antecipada'
    ).length;
    const remanejadosCount = absenceData.filter(
      (absence) => absence.tipo === 'Remanejamento'
    ).length;

    if (presenceData.length > 0) {
      const presencasCount =
        presenceData[0].embalagem +
        presenceData[0].forno +
        presenceData[0].lideranca +
        presenceData[0].panificacao +
        presenceData[0].pasta +
        presenceData[0].recheio;

      setPresencas(presencasCount);
    } else {
      setPresencas(0);
    }

    setFaltas(faltasCount);
    setAtrasos(atrasosCount);
    setAfastamentos(afastamentosCount);
    setSaidaAntecipada(saidaAntecipadaCount);
    setRemanejados(remanejadosCount);
  }, [absenceData, presenceData]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Abertura do modal
  const handleModalOpen = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  // Envio do formulário
  const handleFormSubmit = async (formData: iAbsenceForm) => {
    try {
      await createAbsenceData({ ...formData, usuario: userName });

      // Atualiza os dados
      const updatedData: iAbsence[] = await getAbsenceData(selectedDate);
      setAbsenceData(
        updatedData.filter((absence) => absence.turno.trim() === selectedTurno)
      );

      // Exibir mensagem de sucesso
      setToast({
        show: true,
        message: 'Dados salvos com sucesso!',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao salvar dados de ausência:', error);
      setToast({
        show: true,
        message: 'Erro ao salvar dados de ausência!',
        type: 'danger',
      });
    }
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Stack direction='horizontal' className='p-2'>
        <SuperCardsAbsence
          title='Faltas'
          value={faltas}
          onClick={() => handleModalOpen('Falta')}
        />
        <SuperCardsAbsence
          title='Atrasos'
          value={atrasos}
          onClick={() => handleModalOpen('Atraso')}
        />
        <SuperCardsAbsence
          title='Afastamentos'
          value={afastamentos}
          onClick={() => handleModalOpen('Afastamento')}
        />
        <SuperCardsAbsence
          title='Saída Antecipada'
          value={saidaAntecipada}
          onClick={() => handleModalOpen('Saída Antecipada')}
        />
        <SuperCardsAbsence
          title='Remanejados'
          value={remanejados}
          onClick={() => handleModalOpen('Remanejamento')}
        />
        <SuperCardsAbsence title='Presenças' value={presencas} />
      </Stack>

      <AbsenceFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        inicialDate={selectedDate}
        inicialTurno={selectedTurno}
        inicialType={modalType}
      />

      {/* Toast */}
      <ToastContainer className='p-3' position='bottom-end' style={{ zIndex: 1070 }}>
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.type}
        >
          <Toast.Header closeButton>
            <strong className='me-auto'>
              {toast.type === 'success' ? '✓ Sucesso!' : '⚠ Atenção!'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.type === 'success' ? '' : 'text-white'}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default SupervAbsence;
