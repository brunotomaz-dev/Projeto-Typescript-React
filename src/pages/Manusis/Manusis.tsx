//cSpell: words solicitacao servico criacao localizacao descricao nivel
import { format, startOfDay } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { getSolicitacaoServico } from '../../api/apiRequests';
import PageLayout from '../../components/pageLayout';
import DatePickerComponent from './components/DatePickerComponent';
import { iServiceRequirement, SR_Status } from './interfaces/ServiceRequirement.interface';

const Manusis: React.FC = () => {
  /* --------------------------------------- Data De Hoje --------------------------------------- */
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');

  /* --------------------------------------------------------------------------- Local Store ---- */
  const [serviceRequirements, setServiceRequirements] = useState<iServiceRequirement[]>([]);
  const [ssLoading, setSSLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  /* -------------------------------------------------------------------------------- Effect ---- */
  useEffect(() => {
    const fetchData = () => {
      if (serviceRequirements.length === 0) {
        setSSLoading(true);
      }
      void getSolicitacaoServico({ data_criacao: selectedDate, status_id: SR_Status.NEW })
        .then((response: iServiceRequirement[]) => {
          // Ordenar pela hora de criação
          response.sort((a, b) => {
            // Converter formato dd/MM/yyyy para MM/dd/yyyy ou yyyy-MM-dd
            const [diaA, mesA, anoA] = a.data_criacao.split('/');
            const [diaB, mesB, anoB] = b.data_criacao.split('/');

            const dateA = new Date(`${anoA}-${mesA}-${diaA}T${a.hora_criacao}`);
            const dateB = new Date(`${anoB}-${mesB}-${diaB}T${b.hora_criacao}`);

            return dateA.getTime() - dateB.getTime();
          });
          setServiceRequirements(response);
        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {
          setSSLoading(false);
        });
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000 * 60); // Atualiza a cada 60 segundos

    return () => {
      clearInterval(interval);
    };
  }, [selectedDate]);

  /* ------------------------------------------ Handles ----------------------------------------- */
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      setSelectedDate(formattedDate);
    }
  };

  /* ---------------------------------------- Constantes ---------------------------------------- */
  const hasRequirements = serviceRequirements.length > 0;
  const hasNoRequirements = serviceRequirements.length === 0;

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <PageLayout>
      <h1>Manusis</h1>
      <Col className='mb-2'>
        <DatePickerComponent onDateChange={handleDateChange} selectedDate={selectedDate} />
        {ssLoading && (
          <Spinner animation='border' role='status' className='ms-2 align-middle' />
        )}
      </Col>
      <Container fluid>
        <Row>
          <Col
            xs={12}
            xl={4}
            className='bg-primary-subtle p-2 rounded-3 d-flex flex-column gap-2'
          >
            <h4 className='text-center fs-4'>
              Solicitações de Serviço
              {hasRequirements && (
                <Badge bg='secondary' pill className='ms-1 align-top fs-6'>
                  {serviceRequirements.length}
                </Badge>
              )}
            </h4>
            {hasNoRequirements && <Alert variant='info'>Nenhum registro encontrado.</Alert>}
            {hasRequirements && (
              <>
                {serviceRequirements.map((sr) => (
                  <Card
                    key={sr.id}
                    className={`${sr.maquina_parada ? 'border-danger shadow bg-danger-subtle' : 'border-light shadow-sm'}`}
                  >
                    <Card.Header className={`${sr.maquina_parada && 'bg-danger text-light'}`}>
                      SS nº {sr.numero_ss} - {sr.assunto_principal}
                    </Card.Header>
                    <Card.Body>
                      <Card.Title>{sr.ativo}</Card.Title>
                      <Card.Text>
                        <strong>Solicitante:</strong> {sr.solicitante}
                        <br />
                        <strong>Data da Solicitação</strong> {sr.data_criacao}
                        <br />
                        <strong>Hora da Solicitação</strong> {sr.hora_criacao}
                        <br />
                        <strong>Localização:</strong> {sr.descricao_localizacao_nivel2}
                        <br />
                        <strong>Assunto:</strong> {sr.assunto_secundario}
                        <br />
                        <strong>Solicitação:</strong>{' '}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(sr.solicitacao),
                          }}
                        />
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </Col>
          <Col
            xs={12}
            xl={4}
            className='bg-success-subtle p-2 rounded-3 d-flex flex-column gap-2'
          >
            <h4 className='text-center fs-4'>Ordens Abertas</h4>
            <p className='text-center'>Em Construção</p>
          </Col>
          <Col
            xs={12}
            xl={4}
            className='bg-warning-subtle p-2 rounded-3 d-flex flex-column gap-2'
          >
            <h4 className='text-center fs-4'>Ordens Fechadas</h4>
            <p className='text-center'>Em Construção</p>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Manusis;
