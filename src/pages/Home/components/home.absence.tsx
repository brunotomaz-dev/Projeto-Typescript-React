// cSpell: words recno usuario presencas saida panificacao lideranca
import { format, startOfDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row } from 'react-bootstrap';
import { getAbsenceData, getPresenceData } from '../../../api/apiRequests';
import { Turno } from '../../../helpers/constants';
import { getShift } from '../../../helpers/turn';
import { useToast } from '../../../hooks/useToast';
import { iAbsence, iPresence } from '../../../interfaces/Absence.interface';
import HomeCardsAbsence from './home.cardsAbsence';

// Constantes para tipos de ausência
const ABSENCE_TYPES = {
  FALTA: 'Falta',
  ATRASO: 'Atraso',
  AFASTAMENTO: 'Afastamento',
  SAIDA_ANTECIPADA: 'Saída Antecipada',
  REMANEJAMENTO: 'Remanejamento',
  FERIAS: 'Férias',
};

// Interface para os contadores
interface AbsenceCounters {
  faltas: number;
  atrasos: number;
  afastamentos: number;
  saidaAntecipada: number;
  remanejados: number;
  ferias: number;
  presencas: number;
}

const HomeAbsence: React.FC = () => {
  /* -------------------------------------------- DATAS ------------------------------------------- */
  const now = new Date();
  const todayFetchString = format(startOfDay(now), 'yyyy-MM-dd');
  const actualShift = getShift();
  /* ---------------------------------------- LOCAL STORAGE --------------------------------------- */
  const [absenceData, setAbsenceData] = useState<iAbsence[]>([]);
  const [presenceData, setPresenceData] = useState<iPresence[]>([]);

  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  // Hook do Toast
  const { showToast, ToastDisplay } = useToast();

  /* ------------------------------------------- FUNÇÕES ----------------------------------------- */
  // Opções de turno
  const shiftOptions = useMemo(() => {
    const shifts: Record<Turno, string[]> = {
      [Turno.NOT]: [Turno.NOT],
      [Turno.MAT]: [Turno.MAT, Turno.NOT],
      [Turno.VES]: [Turno.VES, Turno.MAT, Turno.NOT],
    };

    return shifts[actualShift as keyof typeof shifts];
  }, [actualShift]);

  // Função para carregar dados de ausência
  const loadAbsenceData = async () => {
    Promise.allSettled([getAbsenceData(todayFetchString), getAbsenceData(todayFetchString, true)])
      .then((results: PromiseSettledResult<iAbsence[]>[]) => {
        const [absData, absDaysOff] = results.map((result) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.error('Erro ao carregar dados de ausência:', result.reason);
            showToast('Erro ao carregar dados de ausência', 'danger');
            return [];
          }
        });

        // Une os dados de ausência e dias de ausencia, evitando duplicatas
        const combinedData = [...absData, ...absDaysOff].reduce((acc: iAbsence[], curr: iAbsence) => {
          const exists = acc.find((item) => item.recno === curr.recno);
          if (!exists) {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Filtra os dados de ausência, precisa se de um dos turnos da array de turnos
        const filteredData = combinedData.filter((absence) => shiftOptions.includes(absence.turno));

        setAbsenceData(filteredData);
      })
      .catch((error) => {
        console.error('Erro ao carregar dados de ausência:', error);
        showToast('Erro ao carregar dados de ausência', 'danger');
      });
  };

  /* ----------------------------------------- USE EFFECTS ---------------------------------------- */
  // Fetch dos dados de ausência
  useEffect(() => {
    // Carrega os dados de ausência e presença ao montar o componente
    loadAbsenceData();

    void getPresenceData(todayFetchString).then((data: iPresence[]) => {
      setPresenceData(data);
    });
  }, [todayFetchString]);

  // Usar useMemo para calcular todos os contadores de uma vez
  const counters = useMemo<AbsenceCounters>(() => {
    // Inicializar todos os contadores
    const result = {
      faltas: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.FALTA).length,
      atrasos: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.ATRASO).length,
      afastamentos: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.AFASTAMENTO).length,
      saidaAntecipada: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.SAIDA_ANTECIPADA)
        .length,
      remanejados: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.REMANEJAMENTO).length,
      ferias: absenceData.filter((absence) => absence.tipo === ABSENCE_TYPES.FERIAS).length,
      presencas: 0,
    };

    // Calcular total de presenças se houver dados
    if (presenceData.length > 0) {
      result.presencas = presenceData.reduce((acc, presence) => {
        acc +=
          presence.panificacao +
          presence.lideranca +
          presence.embalagem +
          presence.forno +
          presence.pasta +
          presence.recheio;
        return acc;
      }, 0);
    }

    return result;
  }, [absenceData, presenceData]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Card className='shadow bg-transparent border-0 h-100'>
        <Card.Body>
          <Card.Title className='text-center fs-4'>Ausência / Presença</Card.Title>
          <Row className='mt-3'>
            <HomeCardsAbsence title='Faltas' value={counters.faltas} />
            <HomeCardsAbsence title='Afastamentos' value={counters.afastamentos} />
            <HomeCardsAbsence title='Férias' value={counters.ferias} />
          </Row>
          <Row className='mt-3'>
            <HomeCardsAbsence title='Atrasos' value={counters.atrasos} />
            <HomeCardsAbsence title='Saída Antecipada' value={counters.saidaAntecipada} />
          </Row>
          <Row className='mt-3'>
            <HomeCardsAbsence title='Presenças' value={counters.presencas} />
            <HomeCardsAbsence title='Remanejados' value={counters.remanejados} />
          </Row>
        </Card.Body>
      </Card>
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default HomeAbsence;
