import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardText, Col, Modal, ProgressBar, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toTitleCase } from '../../../helpers/helper.functions';
import { useAppDispatch, useAppSelector } from '../../../redux/store/hooks';
import { fetchPreventive, fetchServicesOrders } from '../../Manusis/functions/fetchPreventiveCorretive';
import { formatHourDecimal } from '../../Manusis/functions/formatHourDecimal';
import { iMaintenanceOrders } from '../../Manusis/interfaces/MaintenanceOrders';

interface iProps {
  isOpened: boolean;
  onHide?: () => void;
}

const ModalServiceHistory: React.FC<iProps> = ({ isOpened, onHide }) => {
  /* ------------------------------------------------------------------------------------------- Redux ---- */
  const machine = useAppSelector((state) => state.liveLines.selectedMachine);
  const preventiveHistory = useAppSelector((state) => state.preventiva.preventive);
  const {
    isLoading,
    progress,
    corretive: serviceOrders,
    progressOS,
  } = useAppSelector((state) => state.preventiva);
  const dispatch = useAppDispatch();

  /* ---------------------------------------------------------------------------------------- Local State - */
  const [recentMaintenanceOrders, setRecentMaintenanceOrders] = useState<iMaintenanceOrders[]>([]);

  /* -------------------------------------------------------------------------------------------- Handles - */
  const handleClose = () => {
    onHide && onHide();
  };

  /* --------------------------------------------------------------------------------------------- Effect - */
  useEffect(() => {
    if (isOpened) {
      if (preventiveHistory.length > 0 && machine === preventiveHistory[0].codigo_ativo) {
        return;
      }
      fetchPreventive(machine, dispatch);
    }
  }, [isOpened]);

  useEffect(() => {
    if (
      preventiveHistory.length > 0 &&
      (serviceOrders.length === 0 || preventiveHistory[0].codigo_ativo !== serviceOrders[0].codigo_ativo)
    ) {
      fetchServicesOrders(
        {
          codigo_ativo: preventiveHistory[0].codigo_ativo,
          data_conclusao: preventiveHistory[0].data_conclusao,
        },
        dispatch
      );
    }
  }, [preventiveHistory]);

  useEffect(() => {
    setRecentMaintenanceOrders(serviceOrders.slice(0, 10));
  }, [serviceOrders]);

  /* ----------------------------------------------------------------------------------------- Constantes - */
  const title =
    preventiveHistory.length > 0 ? toTitleCase(preventiveHistory[0].ativo) : `Máquina: ${machine}`;

  const hasPreventiveHistory = preventiveHistory.length > 0;

  /* ---------------------------------------------------------------------------------------- Componentes - */
  const PreventiveContent: React.FC = () => {
    return (
      <>
        <p>
          Última Preventiva Finalizada:{' '}
          <strong>
            {format(preventiveHistory[0].data_conclusao, 'dd/MM/yyyy')}
            <Link
              className='text-decoration-none text-black'
              to={'/preventive'}
            >{` (OS - ${preventiveHistory[0].numero_os})`}</Link>
          </strong>
        </p>
        <p>
          OS abertas desde a última preventiva: <strong>{serviceOrders.length}</strong>
        </p>
        <p>Últimas OS abertas:</p>
        {serviceOrders.length > 0 && (
          <Row className='justify-content-around gap-2'>
            {recentMaintenanceOrders.map((serviceOrder) => (
              <Card key={serviceOrder.numero_os} style={{ width: '49%' }} className='shadow-sm border-0'>
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
                        {format(serviceOrder.data_criacao, 'dd/MM/yyyy')}
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
            <ProgressBar animated now={progressOS} variant='success' key={2} label='OS Corretivas' />
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
