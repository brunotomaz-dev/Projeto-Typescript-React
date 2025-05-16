import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { formatHourDecimal } from '../functions/formatHourDecimal';
import { iMaintenanceOrders, OS_Status } from '../interfaces/MaintenanceOrders';

interface iOrderServiceCardsProps {
  os: iMaintenanceOrders;
  className?: string;
  style?: React.CSSProperties;
}

const OrderServiceCards: React.FC<iOrderServiceCardsProps> = ({ os, className, style }) => {
  const bgStatus =
    os.status_id === OS_Status.OPENED
      ? 'success'
      : os.status_id === OS_Status.CLOSED
        ? 'danger'
        : os.status_id === OS_Status.CANCELED
          ? 'info'
          : os.status_id === OS_Status.COMPLETED_NOTES
            ? 'warning'
            : 'secondary';

  const texstStatus = os.status_id === OS_Status.COMPLETED_NOTES ? 'dark' : 'light';
  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Card key={os.id} className={className} style={style}>
      <Card.Header className='bg-light'>
        OS {os.numero_os} - {os.descricao_localizacao_nivel1} /{os.assunto_principal}
      </Card.Header>
      <Card.Body>
        <Card.Title>{os.ativo}</Card.Title>
        <Card.Text>
          <strong>Solicitante:</strong> {os.solicitante_ss || '-'}
          <br />
          <strong>Número SS:</strong> {os.numero_ss || '-'}
          <br />
          <strong>Localização:</strong> {os.descricao_localizacao_nivel3} - {os.descricao_localizacao_nivel2}
          <br />
          <strong>Assunto:</strong> {os.assunto_secundario || '-'}
          <br />
          <strong>Tipo de Manutenção</strong> {os.tipo_manutencao || '-'}
          <br />
          <strong>Descrição:</strong>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(os.descricao),
            }}
          />
          <br />
          <strong>Status:</strong>{' '}
          {
            <Badge bg={bgStatus} text={texstStatus}>
              {os.status}
            </Badge>
          }
          <br />
          <strong>Data da Abertura</strong> {format(os.data_criacao, 'dd/MM/yyyy')}
          <br />
          <strong>Hora da Abertura</strong> {os.hora_criacao}
          <br />
          <strong>Responsável:</strong> {os.responsavel_manutencao || '-'}
          <br />
          <strong>Início do Atendimento:</strong>{' '}
          {os.inicio_atendimento !== '' && format(os.inicio_atendimento, 'dd/MM/yyyy')} -{' '}
          {os.hora_inicio_atendimento}
          <br />
          <strong>Conclusão do Atendimento:</strong>{' '}
          {os.fim_atendimento !== '' && format(os.fim_atendimento, 'dd/MM/yyyy')} - {os.hora_fim_atendimento}
          <br />
          <strong>Histórico:</strong> <br />
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(os.historico_servico_executado),
            }}
          />
          <br />
        </Card.Text>
      </Card.Body>
      <Card.Footer className='text-center'>
        <strong>Tempo Estimado:</strong> {formatHourDecimal(os.tempo_estimado_trabalho)}
        <br />
        <strong>Tempo Realizado:</strong> {formatHourDecimal(os.tempo_trabalho_realizado)}
        <br />
      </Card.Footer>
    </Card>
  );
};

export default OrderServiceCards;
