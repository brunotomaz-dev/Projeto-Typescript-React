// cSpell: words recno usuario presencas saida panificacao lideranca
import { format, startOfDay } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Card, Row } from 'react-bootstrap';
import { getAbsenceData, getPresenceData } from '../../../api/apiRequests';
import { iAbsence, iPresence } from '../../../interfaces/Absence.interface';
import HomeCardsAbsence from './home.cardsAbsence';

const HomeAbsence: React.FC = () => {
  /* -------------------------------------------- DATAS ------------------------------------------- */
  const now = new Date();
  const todayFetchString = format(startOfDay(now), 'yyyy-MM-dd');

  /* ---------------------------------------- LOCAL STORAGE --------------------------------------- */
  const [absenceData, setAbsenceData] = useState<iAbsence[]>([]);
  const [presenceData, setPresenceData] = useState<iPresence[]>([]);
  const [faltas, setFaltas] = useState<number>(0);
  const [atrasos, setAtrasos] = useState<number>(0);
  const [presencas, setPresencas] = useState<number>(0);
  const [afastamentos, setAfastamentos] = useState<number>(0);
  const [saidaAntecipada, setSaidaAntecipada] = useState<number>(0);
  const [remanejados, setRemanejados] = useState<number>(0);

  /* ------------------------------------------- FUNÇÕES ------------------------------------------ */

  /* ----------------------------------------- USE EFFECTS ---------------------------------------- */
  // Fetch dos dados de ausência
  useEffect(() => {
    void getAbsenceData(todayFetchString).then((data: iAbsence[]) => {
      setAbsenceData(data);
    });
    void getPresenceData(todayFetchString).then((data: iPresence[]) => {
      setPresenceData(data);
    });
  }, [todayFetchString]);

  // Somar os tipos de ausência
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
      const presencasCount = presenceData.reduce((acc, presence) => {
        acc +=
          presence.panificacao +
          presence.lideranca +
          presence.embalagem +
          presence.forno +
          presence.pasta +
          presence.recheio;
        return acc;
      }, 0);

      setPresencas(presencasCount);
    }

    setFaltas(faltasCount);
    setAtrasos(atrasosCount);
    setAfastamentos(afastamentosCount);
    setSaidaAntecipada(saidaAntecipadaCount);
    setRemanejados(remanejadosCount);
  }, [absenceData, presenceData]);
  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Card className='shadow bg-transparent border-0  h-100'>
      <Card.Body>
        <Card.Title className='text-center fs-4'>Ausência / Presença</Card.Title>
        <Row className='mt-3'>
          <HomeCardsAbsence title='Faltas' value={faltas} />
          <HomeCardsAbsence title='Atrasos' value={atrasos} />
          <HomeCardsAbsence title='Presenças' value={presencas} />
        </Row>
        <Row className='mt-3'>
          <HomeCardsAbsence title='Afastamentos' value={afastamentos} />
          <HomeCardsAbsence title='Saída Antecipada' value={saidaAntecipada} />
          <HomeCardsAbsence title='Remanejados' value={remanejados} />
        </Row>
      </Card.Body>
    </Card>
  );
};

export default HomeAbsence;
