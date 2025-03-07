import React from 'react';
import { FormSelect, Row } from 'react-bootstrap';
import { colorObj } from '../../../helpers/constants';
import { iInfoIhmLive } from '../interfaces/infoIhm';
import MachineStatus from './lineStatus';

interface ControlsProps {
  selectedLine: number;
  selectedShift: string;
  lines: number[];
  turnos: Record<string, string>;
  shiftOptions: string[];
  onLineChange: (line: number) => void;
  onShiftChange: (shift: string) => void;
  cardStyle: React.CSSProperties;
  status: string;
  statusRender: boolean;
  infoParada: iInfoIhmLive | undefined;
}

const LineControls: React.FC<ControlsProps> = ({
  selectedLine,
  selectedShift,
  lines,
  turnos,
  shiftOptions,
  onLineChange,
  onShiftChange,
  cardStyle,
  status,
  statusRender,
  infoParada,
}) => {
  // Definir o problema e motivo da parada
  let problema = infoParada?.problema || 'Não Apontado';
  const motivo = infoParada?.motivo || 'Não apontado';
  problema = motivo === 'Parada Programada' ? infoParada?.causa || 'Não Apontado' : problema;

  const bgColor = colorObj[motivo as keyof typeof colorObj] || colorObj['Não apontado'];

  return (
    <>
      <Row className='mb-3'>
        <FormSelect
          value={selectedLine}
          className='bg-light p-4 shadow text-center'
          style={cardStyle}
          onChange={(e) => onLineChange(Number(e.target.value))}
        >
          {lines.map((line) => (
            <option style={{ fontSize: '1vw' }} key={line} value={line}>
              {`Linha ${line}`}
            </option>
          ))}
        </FormSelect>
      </Row>
      <Row className='mb-3'>
        <FormSelect
          value={selectedShift}
          className='bg-light p-4 shadow text-center'
          style={cardStyle}
          onChange={(e) => onShiftChange(e.target.value)}
        >
          {shiftOptions.map((shift) => (
            <option style={{ fontSize: '1vw' }} key={shift} value={shift}>
              {turnos[shift]}
            </option>
          ))}
        </FormSelect>
      </Row>
      {statusRender && <MachineStatus status={status} />}
      {status !== 'true' && statusRender && (
        <Row className='card text-center text-white px-1 py-3 fs-5 mb-3' style={{ backgroundColor: bgColor }}>
          {problema}
        </Row>
      )}
      {status !== 'true' && statusRender && (
        <Row className='card text-center fs-4 bg-light p-3'>{infoParada?.tempo} minutos</Row>
      )}
    </>
  );
};

export default LineControls;
