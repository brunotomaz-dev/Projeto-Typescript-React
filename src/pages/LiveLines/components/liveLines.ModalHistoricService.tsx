import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardText, Col, Modal, ProgressBar, Row } from 'react-bootstrap';
import { getOrdemServico } from '../../../api/apiRequests';
import { toTitleCase } from '../../../helpers/helper.functions';
import { useAppSelector } from '../../../redux/store/hooks';
import { formatHourDecimal } from '../../Manusis/functions/formatHourDecimal';
import {
  iMaintenanceOrders,
  OS_Status,
  Service_Type,
} from '../../Manusis/interfaces/MaintenanceOrders';

interface iProps {
  isOpened: boolean;
  onHide?: () => void;
}

const ModalServiceHistory: React.FC<iProps> = ({ isOpened, onHide }) => {
  /* ------------------------------------------------------------------------------------------- Redux ---- */
  const machine = useAppSelector((state) => state.liveLines.selectedMachine);

  /* ---------------------------------------------------------------------------------------- Local State - */
  const [machineHistory, setMachineHistory] = useState<iMaintenanceOrders[]>([]);
  const [serviceOrders, setServiceOrders] = useState<iMaintenanceOrders[]>([]);
  const [recentMaintenanceOrders, setRecentMaintenanceOrders] = useState<iMaintenanceOrders[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressOS, setProgressOS] = useState(0);
  const [lastPreventive, setLastPreventive] = useState<string>('');

  /* ---------------------------------------------------------------------------------------------- Fetch - */
  const fetchPreventiveMachineHistory = async () => {
    setProgress(0);
    setIsLoading(true);

    const response: iMaintenanceOrders[] = await getOrdemServico({
      status_id: OS_Status.CLOSED,
      tipo_manutencao: Service_Type.PREVENTIVA,
      cod_ativo: machine,
    });
    // Atualizar o progresso
    setProgress(35);

    const responsePontual: iMaintenanceOrders[] = await getOrdemServico({
      status_id: OS_Status.CLOSED,
      tipo_manutencao: Service_Type.PREVENTIVA_PONTUAL,
      cod_ativo: machine,
    });
    // Atualizar o progresso
    setProgress(70);

    // Combinar os resultados
    response.push(...responsePontual);
    // Atualizar o progresso
    setProgress(80);

    if (response.length > 0) {
      // Ordenar por data de conclusão, da mais recente para a mais antiga
      response.sort((a, b) => {
        const dateA = new Date(a.data_conclusao);
        const dateB = new Date(b.data_conclusao);
        return dateB.getTime() - dateA.getTime(); // Ordem decrescente
      });
      // Limitar a 5 registros
      response.splice(5);

      setMachineHistory(response);
      setLastPreventive(response[0].data_conclusao);
    }
    // Atualizar o progresso
    setProgress(100);
    // Definir o estado de carregamento como falso
    setIsLoading(false);
  };

  const fetchServicesOrders = async () => {
    // Atualizar o progresso
    setProgressOS(0);
    setIsLoading(true);

    const conclusionDate = format(new Date(machineHistory[0].data_conclusao), 'yyyy-MM-dd');
    // Atualizar o progresso
    setProgressOS(35);

    const response: iMaintenanceOrders[] = await getOrdemServico({
      cod_ativo: machineHistory[0].codigo_ativo,
      data_criacao__gt: conclusionDate,
      tipo_manutencao: Service_Type.CORRETIVA,
    });
    // Atualizar o progresso
    setProgressOS(75);

    if (response.length > 0) {
      // Ordenar por data de conclusão, da mais recente para a mais antiga
      response.sort((a, b) => {
        const dateA = new Date(a.data_conclusao);
        const dateB = new Date(b.data_conclusao);
        return dateB.getTime() - dateA.getTime(); // Ordem decrescente
      });

      setServiceOrders(response);
      setRecentMaintenanceOrders(response.slice(0, 10)); // Limitar registros
    }
    // Atualizar o progresso
    setProgressOS(100);
    // Definir o estado de carregamento como falso
    setIsLoading(false);
    // Zera o progresso
    setProgressOS(0);
  };

  /* -------------------------------------------------------------------------------------------- Handles - */
  const handleClose = () => {
    setMachineHistory([]);
    onHide && onHide();
  };

  /* --------------------------------------------------------------------------------------------- Effect - */
  useEffect(() => {
    if (isOpened) {
      fetchPreventiveMachineHistory();
    }
  }, [isOpened]);

  useEffect(() => {
    if (machineHistory.length > 0) {
      fetchServicesOrders();
    }
  }, [machineHistory]);

  /* ----------------------------------------------------------------------------------------- Constantes - */
  const title =
    machineHistory.length > 0 ? toTitleCase(machineHistory[0].ativo) : `Máquina: ${machine}`;

  const hasPreventiveHistory = machineHistory.length > 0;

  /* ---------------------------------------------------------------------------------------- Componentes - */
  const PreventiveContent: React.FC = () => {
    return (
      <>
        <p>
          Última Preventiva Finalizada: <strong>{lastPreventive}</strong>
        </p>
        <p>
          OS abertas desde a última preventiva: <strong>{serviceOrders.length}</strong>
        </p>
        <p>Últimas OS abertas:</p>
        {serviceOrders.length > 0 && (
          <Row className='justify-content-around gap-2'>
            {recentMaintenanceOrders.map((serviceOrder) => (
              <Card
                key={serviceOrder.numero_os}
                style={{ width: '49%' }}
                className='shadow-sm border-0'
              >
                <Card.Body>
                  <Row>
                    <Col xl={4}>
                      <CardText>
                        <strong>OS </strong>
                        <em>{serviceOrder.numero_os}</em>
                      </CardText>
                    </Col>
                    <Col>
                      <CardText className='text-end'>
                        <strong>Status: </strong>
                        <br />
                        {serviceOrder.status}
                      </CardText>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col>
                      <CardText>
                        <strong>Tempo:</strong>
                        <br />
                        {formatHourDecimal(serviceOrder.tempo_trabalho_realizado)}
                      </CardText>
                    </Col>
                    <Col>
                      <CardText className='text-end'>
                        <strong>Data da Abertura: </strong>
                        {serviceOrder.data_criacao}
                      </CardText>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col>
                      <CardText>
                        <strong>Solicitação: </strong>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(serviceOrder.descricao),
                          }}
                        />
                      </CardText>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              // <li key={serviceOrder.id}>
              //   <strong>{serviceOrder.numero_os}</strong> -{' '}
              //   <span
              //     dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(serviceOrder.descricao) }}
              //   />{' '}
              //   - {serviceOrder.data_criacao} -{' '}
              //   {formatHourDecimal(serviceOrder.tempo_trabalho_realizado)}
              // </li>
            ))}
          </Row>
        )}
      </>
    );
  };

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Modal show={isOpened} size='lg' centered onHide={handleClose}>
      <Modal.Header closeButton className='bg-light-grey-sfm border-bottom border-secondary-subtle'>
        <Modal.Title>Histórico de Manutenção</Modal.Title>
      </Modal.Header>
      <Modal.Body className='bg-light-grey-sfm'>
        <h3 className='fs-3 text-center'>{title}</h3>
        {isLoading ? (
          <ProgressBar>
            <ProgressBar animated now={progress} key={1} label='Preventiva' />
            <ProgressBar
              animated
              now={progressOS}
              variant='success'
              key={2}
              label='OS Corretivas'
            />
          </ProgressBar>
        ) : (
          <>
            {hasPreventiveHistory ? (
              <PreventiveContent />
            ) : (
              <Alert className='p-2 w-75 text-center mx-auto' variant='warning'>
                Nenhuma manutenção preventiva encontrada.
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className='bg-light-grey-sfm border-top border-secondary-subtle'>
        <Button variant='secondary' onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalServiceHistory;
