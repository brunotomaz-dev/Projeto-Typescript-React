// cSpell: words superv recno usuario presencas lideranca panificacao saida autohide
import React, { useEffect, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { createAbsenceData, createPresenceData } from '../../../api/apiRequests';
import { useToast } from '../../../hooks/useToast';
import { iAbsence, iPresence } from '../../../interfaces/Absence.interface';
import { useAppSelector } from '../../../redux/store/hooks';
import { iAbsenceForm } from '../interface/AbsenceForm.interface';
import SuperCardsAbsence from './superv.CardsAbsence';
import AbsenceFormModal from './superv.ModalAbs';
import PresenceAddModal from './superv.PresModal';

interface iAbsenceProps {
  selectedDate: string;
  selectedTurno: string;
  absenceData: iAbsence[];
  presenceData: iPresence[];
  onDataChange: () => void;
  onPresenceChange: (total: number) => void;
}

const SupervAbsence: React.FC<iAbsenceProps> = ({
  selectedDate,
  selectedTurno,
  absenceData,
  presenceData,
  onDataChange,
  onPresenceChange,
}) => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  // Recuperar o nome do usuário
  const userName = useAppSelector((state) => state.user.fullName);
  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [faltas, setFaltas] = useState<number>(0);
  const [atrasos, setAtrasos] = useState<number>(0);
  const [presencas, setPresencas] = useState<number>(0);
  const [afastamentos, setAfastamentos] = useState<number>(0);
  const [saidaAntecipada, setSaidaAntecipada] = useState<number>(0);
  const [remanejados, setRemanejados] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPresenceModal, setShowPresenceModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
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

  useEffect(() => {
    onPresenceChange(presencas);
  }, [presencas]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Abertura do modal
  const handleModalOpen = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const handlePresenceModalOpen = () => {
    if (presenceData.length > 0) {
      setShowPresenceModal(false);
      return showToast('Já existe registro de presença para o dia!', 'warning');
    }

    setShowPresenceModal(true);
  };

  // Envio do formulário
  const handleFormSubmit = async (formData: iAbsenceForm) => {
    try {
      await createAbsenceData({ ...formData, usuario: userName });

      // Atualiza os dados
      onDataChange();

      // Exibir mensagem de sucesso
      showToast('Dados salvos com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar dados de ausência:', error);
      showToast('Erro ao salvar dados de ausência!', 'danger');
    }
  };

  const handlePresenceSubmit = async (data: iPresence) => {
    try {
      // Salvar dados de presença
      await createPresenceData(data);

      // Atualizar dados
      onDataChange();

      // Exibir mensagem de sucesso
      showToast('Dados salvos com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar dados de presença:', error);
      showToast('Erro ao salvar dados de presença!', 'danger');
    }
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Stack direction='horizontal' className='mb-3'>
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
        <SuperCardsAbsence
          title='Presenças'
          value={presencas}
          onClick={handlePresenceModalOpen}
        />
      </Stack>

      <AbsenceFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        inicialDate={selectedDate}
        inicialTurno={selectedTurno}
        inicialType={modalType}
      />

      <PresenceAddModal
        show={showPresenceModal}
        onHide={() => setShowPresenceModal(false)}
        inicialDate={selectedDate}
        inicialTurno={selectedTurno}
        onSubmit={handlePresenceSubmit}
      />

      {/* Toast */}
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default SupervAbsence;
