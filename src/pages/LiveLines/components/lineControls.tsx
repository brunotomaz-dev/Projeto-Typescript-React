import { format, startOfDay } from 'date-fns';
import React from 'react';
import { Card, FormSelect, Row } from 'react-bootstrap';
import { colorObj, getTurnoName } from '../../../helpers/constants';
import { getShift } from '../../../helpers/turn';
import { useInfoIHMQuery } from '../../../hooks/queries/useLiveInfoIHMQuery';
import { useFilters } from '../../../hooks/useFilters';
import { setLiveSelectedLine } from '../../../redux/store/features/liveLinesSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';
import MachineStatus from './lineStatus';

const LineControls: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const dispatch = useAppDispatch();
  const { date, turn } = useFilters('liveLines');

  // Buscar linha selecionada do Redux
  const selectedLine = useAppSelector((state) => state.liveLines.selectedLine);

  // Buscar informações de parada
  const { lastInfoIHM } = useInfoIHMQuery(selectedLine);

  // Variáveis
  const nowDate = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const shiftActual = getShift();
  const lines = Array.from({ length: 14 }, (_, i) => i + 1);

  // Status da linha
  const status = useAppSelector((state) => state.liveLines.machineStatus);
  const statusRender = turn === shiftActual && date === nowDate;

  /* -------------------------------------------------- Info ------------------------------------------------- */
  // Definir o problema e motivo da parada
  let problema = lastInfoIHM?.problema || 'Não Apontado';
  const motivo = lastInfoIHM?.motivo || 'Não apontado';
  problema = motivo === 'Parada Programada' ? lastInfoIHM?.causa || 'Não Apontado' : problema;

  const bgColor = colorObj[motivo as keyof typeof colorObj] || colorObj['Não apontado'];

  /* ------------------------------------------------ Handlers ----------------------------------------------- */
  // Atualizar linha selecionada
  const handleLineChange = (line: number) => {
    dispatch(setLiveSelectedLine(line));
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <Row className='mb-2'>
        <FormSelect
          value={selectedLine}
          className='bg-light p-4 shadow text-center fs-3 rounded-3'
          onChange={(e) => handleLineChange(Number(e.target.value))}
        >
          {lines.map((line) => (
            <option style={{ fontSize: '1vw' }} key={line} value={line}>
              {`Linha ${line}`}
            </option>
          ))}
        </FormSelect>
      </Row>
      <Row className='mb-2'>
        <Card className='bg-light p-4 shadow text-center fs-3 rounded-3'>{`${getTurnoName(turn)}`}</Card>
      </Row>
      {statusRender && <MachineStatus status={status} />}
      {status !== 'true' && statusRender && (
        <Row
          className='card text-center text-white px-1 py-3 fs-5 mb-2 rounded-3'
          style={{ backgroundColor: bgColor }}
        >
          {problema}
        </Row>
      )}
      {status !== 'true' && statusRender && (
        <Row className='card text-center fs-4 bg-light p-3 rounded-3'>{lastInfoIHM?.tempo} minutos</Row>
      )}
    </>
  );
};

export default LineControls;
