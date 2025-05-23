// cSpell: words superv recno usuario presencas lideranca panificacao saida autohide
import React, { useEffect, useState } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { createAbsenceData, createPresenceData, updateAbsenceData } from '../../../api/apiRequests';
import { useToast } from '../../../hooks/useToast';
import { iAbsence, iPresence } from '../../../interfaces/Absence.interface';
import { useAppSelector } from '../../../redux/store/hooks';
import { iAbsenceForm } from '../interface/AbsenceForm.interface';
import AbsenceTable from './superv.AbsTable';
import SuperCardsAbsence from './superv.CardsAbsence';
import AbsenceFormModal from './superv.ModalAbs';
import PresenceAddModal from './superv.PresModal';
import PresenceTable from './superv.PresenceTable';

// Definindo os tipos de ausência como uma constante para reutilização
export const AbsenceTypes = {
  FALTA: 'Falta',
  ATRASO: 'Atraso',
  AFASTAMENTO: 'Afastamento',
  SAIDA_ANTECIPADA: 'Saída Antecipada',
  REMANEJAMENTO: 'Remanejamento',
  FERIAS: 'Férias',
} as const;

// Criando um tipo para os contadores de ausência
interface AbsenceCounters {
  faltas: number;
  atrasos: number;
  afastamentos: number;
  saidaAntecipada: number;
  remanejados: number;
  ferias: number;
  presencas: number;
}

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
  // Estado único para todos os contadores
  const [counters, setCounters] = useState<AbsenceCounters>({
    faltas: 0,
    atrasos: 0,
    afastamentos: 0,
    saidaAntecipada: 0,
    remanejados: 0,
    ferias: 0, // Adicionando o contador de férias
    presencas: 0,
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPresenceModal, setShowPresenceModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<iAbsenceForm & { recno?: number }>>({});
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Contagem de faltas, atrasos, presenças, afastamentos, saídas antecipadas, remanejados e férias
  useEffect(() => {
    // Calcula contagens de cada tipo de ausência
    const newCounters = {
      faltas: absenceData.filter((absence) => absence.tipo === AbsenceTypes.FALTA).length,
      atrasos: absenceData.filter((absence) => absence.tipo === AbsenceTypes.ATRASO).length,
      afastamentos: absenceData.filter((absence) => absence.tipo === AbsenceTypes.AFASTAMENTO).length,
      saidaAntecipada: absenceData.filter((absence) => absence.tipo === AbsenceTypes.SAIDA_ANTECIPADA).length,
      remanejados: absenceData.filter((absence) => absence.tipo === AbsenceTypes.REMANEJAMENTO).length,
      ferias: absenceData.filter((absence) => absence.tipo === AbsenceTypes.FERIAS).length,
      presencas: 0,
    };

    // Calcula o total de presenças se houver dados
    if (presenceData.length > 0) {
      const presencasCount =
        presenceData[0].embalagem +
        presenceData[0].forno +
        presenceData[0].lideranca +
        presenceData[0].panificacao +
        presenceData[0].pasta +
        presenceData[0].recheio;

      newCounters.presencas = presencasCount;
    }

    // Atualiza o estado com todas as contagens de uma vez
    setCounters(newCounters);
  }, [absenceData, presenceData]);

  useEffect(() => {
    // Notifica o componente pai sobre a mudança no número de presenças
    onPresenceChange(counters.presencas);
  }, [counters.presencas, onPresenceChange]);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Abertura do modal para criação
  const handleModalOpen = (type: string) => {
    setModalType(type);
    setIsEdit(false);
    setEditData({});
    setShowModal(true);
  };

  const handlePresenceModalOpen = () => {
    if (presenceData.length > 0) {
      setShowPresenceModal(false);
      return showToast('Já existe registro de presença para o dia!', 'warning');
    }

    setShowPresenceModal(true);
  };

  // Envio do formulário (criação ou edição)
  const handleFormSubmit = async (formData: iAbsenceForm) => {
    try {
      if (isEdit && editData.recno) {
        // Atualizar registro existente
        await updateAbsenceData({
          ...formData,
          usuario: userName,
          recno: editData.recno,
        });
        showToast('Registro atualizado com sucesso!', 'success');
      } else {
        // Criar novo registro
        await createAbsenceData({ ...formData, usuario: userName });
        showToast('Registro criado com sucesso!', 'success');
      }

      // Atualiza os dados
      onDataChange();
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

  // Adicionar função para lidar com edição vinda da tabela
  const handleEditAbsence = (absence: iAbsence) => {
    setModalType(absence.tipo);
    setIsEdit(true);
    setEditData({
      recno: absence.recno,
      data_occ: absence.data_occ,
      turno: absence.turno,
      tipo: absence.tipo,
      nome: absence.nome,
      setor: absence.setor,
      motivo: absence.motivo,
      data_retorno: absence.data_retorno,
    });
    setShowModal(true);
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
          onClick={() => handleModalOpen(AbsenceTypes.ATRASO)}
        />
        <SuperCardsAbsence
          title='Saída Antecipada'
          value={counters.saidaAntecipada}
          onClick={() => handleModalOpen(AbsenceTypes.SAIDA_ANTECIPADA)}
        />
        <SuperCardsAbsence
          title='Faltas'
          value={counters.faltas}
          onClick={() => handleModalOpen(AbsenceTypes.FALTA)}
        />
        <SuperCardsAbsence
          title='Afastamentos'
          value={counters.afastamentos}
          onClick={() => handleModalOpen(AbsenceTypes.AFASTAMENTO)}
        />
        <SuperCardsAbsence
          title='Férias'
          value={counters.ferias}
          onClick={() => handleModalOpen(AbsenceTypes.FERIAS)}
        />
        <SuperCardsAbsence
          title='Remanejados'
          value={counters.remanejados}
          onClick={() => handleModalOpen(AbsenceTypes.REMANEJAMENTO)}
        />
        <SuperCardsAbsence title='Presenças' value={counters.presencas} onClick={handlePresenceModalOpen} />
      </Stack>

      <AbsenceFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        inicialDate={isEdit ? editData.data_occ || selectedDate : selectedDate}
        inicialTurno={isEdit ? editData.turno || selectedTurno : selectedTurno}
        inicialType={modalType}
        isEdit={isEdit}
        absenceData={editData}
      />

      <PresenceAddModal
        show={showPresenceModal}
        onHide={() => setShowPresenceModal(false)}
        inicialDate={selectedDate}
        inicialTurno={selectedTurno}
        onSubmit={handlePresenceSubmit}
      />

      <Row className='g-1 mb-3'>
        <Col xs={12} xl={9}>
          <AbsenceTable absenceData={absenceData} onDataChange={onDataChange} onEdit={handleEditAbsence} />
        </Col>
        <Col xs={12} xl>
          <PresenceTable presenceData={presenceData} onDataChange={onDataChange} />
        </Col>
      </Row>

      {/* Toast */}
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default SupervAbsence;
