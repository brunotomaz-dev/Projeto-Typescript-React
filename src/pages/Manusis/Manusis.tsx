//cSpell: words solicitacao servico criacao localizacao descricao nivel manutencao responsavel historico
//cSpell: words conclusao
import { format, startOfDay } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { getOrdemServico, getSolicitacaoServico } from '../../api/apiRequests';
import PageLayout from '../../components/pageLayout';
import DatePickerComponent from './components/DatePickerComponent';
import { iMaintenanceOrders, OS_Status } from './interfaces/MaintenanceOrders';
import { iServiceRequirement, SR_Status } from './interfaces/ServiceRequirement.interface';

const Manusis: React.FC = () => {
  /* --------------------------------------- Data De Hoje --------------------------------------- */
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');

  /* --------------------------------------------------------------------------- Local Store ---- */
  const [serviceRequirements, setServiceRequirements] = useState<iServiceRequirement[]>([]);
  const [orderByAppointment, setOrderByAppointment] = useState<iMaintenanceOrders[]>([]);
  const [closedOrdersByDate, setClosedOrdersByDate] = useState<iMaintenanceOrders[]>([]);
  const [ssLoading, setSSLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(todayString);

  /* --------------------------------------------------------------------------- Requisições ---- */
  const fetchRequestData = () => {
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

  const fetchOrderByAppointment = () => {
    if (orderByAppointment.length === 0) {
      setSSLoading(true);
    }
    void getOrdemServico({ inicio_atendimento: selectedDate, status_id: OS_Status.OPENED })
      .then((response: iMaintenanceOrders[]) => {
        // Ordenar pela hora de criação
        response.sort((a, b) => {
          // Converter formato dd/MM/yyyy para MM/dd/yyyy ou yyyy-MM-dd
          const [diaA, mesA, anoA] = a.inicio_atendimento.split('/');
          const [diaB, mesB, anoB] = b.inicio_atendimento.split('/');

          const dateA = new Date(`${anoA}-${mesA}-${diaA}T${a.hora_inicio_atendimento}`);
          const dateB = new Date(`${anoB}-${mesB}-${diaB}T${b.hora_inicio_atendimento}`);

          return dateB.getTime() - dateA.getTime();
        });

        setOrderByAppointment(response);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setSSLoading(false);
      });
  };

  const fetchClosedOrdersByDate = () => {
    if (closedOrdersByDate.length === 0) {
      setSSLoading(true);
    }
    void getOrdemServico({ data_conclusao: selectedDate, status_id: OS_Status.CLOSED })
      .then((response: iMaintenanceOrders[]) => {
        // Ordenar pela hora de criação
        response.sort((a, b) => {
          // Converter formato dd/MM/yyyy para MM/dd/yyyy ou yyyy-MM-dd
          const [diaA, mesA, anoA] = a.data_conclusao.split('/');
          const [diaB, mesB, anoB] = b.data_conclusao.split('/');

          const dateA = new Date(`${anoA}-${mesA}-${diaA}T${a.hora_conclusao}`);
          const dateB = new Date(`${anoB}-${mesB}-${diaB}T${b.hora_conclusao}`);

          return dateB.getTime() - dateA.getTime();
        });

        console.log('Ordens Fechadas:', response);
        setClosedOrdersByDate(response);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setSSLoading(false);
      });
  };

  /* -------------------------------------------------------------------------------- Effect ---- */
  useEffect(() => {
    fetchRequestData();
    fetchOrderByAppointment();
    fetchClosedOrdersByDate();

    const interval = setInterval(() => {
      fetchRequestData();
      fetchOrderByAppointment();
      fetchClosedOrdersByDate();
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
  const hasOrders = orderByAppointment.length > 0;
  const hasNoOrders = orderByAppointment.length === 0;
  const hasClosedOrders = closedOrdersByDate.length > 0;
  const hasNoClosedOrders = closedOrdersByDate.length === 0;

  /* ------------------------------------------ Funções ----------------------------------------- */
  // Função para converter decimal de horas em formato legível (horas ou minutos)
  const formatHourDecimal = (decimalHours: number | string): string => {
    if (!decimalHours && decimalHours !== 0) return '-';

    // Converter para número caso venha como string
    const hours = typeof decimalHours === 'string' ? parseFloat(decimalHours) : decimalHours;

    // Converter para minutos
    const totalMinutes = hours * 60;

    // Se for menos de uma hora, mostrar em minutos
    if (hours < 1) {
      return `${Math.round(totalMinutes)} minutos`;
    }

    // Se for hora exata, mostrar apenas horas
    if (hours % 1 === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }

    // Caso contrário, mostrar horas e minutos
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours} ${wholeHours === 1 ? 'hora' : 'horas'} e ${minutes} minutos`;
  };

  // Adicione uma função para calcular a diferença de horas entre duas datas
  const getHoursDifference = (dateString: string, timeString: string): number => {
    if (!dateString || !timeString) return 0;

    try {
      const [dia, mes, ano] = dateString.split('/');
      const dateTime = new Date(`${ano}-${mes}-${dia}T${timeString}`);
      const now = new Date();

      // Diferença em milissegundos
      const diffMs = now.getTime() - dateTime.getTime();
      // Converter para horas
      return diffMs / (1000 * 60 * 60);
    } catch (error) {
      console.error('Erro ao calcular diferença de horas:', error);
      return 0;
    }
  };

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
        <Row className='gap-1'>
          <Col
            xs={12}
            xl={3}
            className='bg-primary-subtle p-2 rounded-3 d-flex flex-column gap-2 flex-grow-1'
          >
            <h4 className='text-center fs-4'>
              Solicitações de Serviço
              {hasRequirements && (
                <Badge bg='secondary' pill className='ms-1 align-top fs-6'>
                  {serviceRequirements.length}
                </Badge>
              )}
            </h4>
            {hasNoRequirements && (
              <Alert variant='info' className='text-center'>
                Nenhum registro encontrado.
              </Alert>
            )}
            {hasRequirements && (
              <>
                {serviceRequirements.map((sr) => (
                  <Card
                    key={sr.id}
                    className={`${sr.maquina_parada ? 'border-danger shadow bg-danger-subtle' : 'border-light shadow-sm'}`}
                  >
                    <Card.Header
                      className={`${
                        sr.maquina_parada
                          ? 'border-danger shadow bg-danger-subtle'
                          : getHoursDifference(sr.data_criacao, sr.hora_criacao) >= 1
                            ? 'border-warning shadow bg-warning-subtle'
                            : 'border-light shadow-sm'
                      }`}
                    >
                      SS {sr.numero_ss} - {sr.descricao_localizacao_nivel1} /
                      {sr.assunto_principal}
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
                        <strong>Localização:</strong> {sr.descricao_localizacao_nivel3} -{' '}
                        {sr.descricao_localizacao_nivel2}
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
            <h4 className='text-center fs-4'>
              Ordens Abertas
              {hasOrders && (
                <Badge bg='secondary' pill className='ms-1 align-top fs-6'>
                  {orderByAppointment.length}
                </Badge>
              )}
            </h4>
            {hasNoOrders && (
              <Alert variant='info' className='text-center'>
                Nenhum registro encontrado.
              </Alert>
            )}
            {hasOrders &&
              orderByAppointment.map((os) => (
                <Card
                  key={os.id}
                  className={`${os.fim_atendimento !== '-' ? 'border-success shadow bg-success-subtle' : 'border-light shadow-sm'}`}
                >
                  <Card.Header
                    className={`${os.fim_atendimento !== '-' && 'bg-success text-light'}`}
                  >
                    OS {os.numero_os} - {os.descricao_localizacao_nivel1} /
                    {os.assunto_principal}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{os.ativo}</Card.Title>
                    <Card.Text>
                      <strong>Solicitante:</strong> {os.solicitante_ss || '-'}
                      <br />
                      <strong>Número SS:</strong> {os.numero_ss || '-'}
                      <br />
                      <strong>Localização:</strong> {os.descricao_localizacao_nivel3} -{' '}
                      {os.descricao_localizacao_nivel2}
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
                      {os.fim_atendimento !== '-' ? (
                        <Badge bg='success'>Aberta</Badge>
                      ) : (
                        os.fim_atendimento === '-' && (
                          <Badge bg='warning'>Em Atendimento</Badge>
                        )
                      )}
                      <br />
                      <strong>Data da Abertura</strong> {os.data_criacao}
                      <br />
                      <strong>Hora da Abertura</strong> {os.hora_criacao}
                      <br />
                      <strong>Responsável:</strong> {os.responsavel_manutencao || '-'}
                      <br />
                      <strong>Início do Atendimento:</strong> {os.inicio_atendimento || '-'} -{' '}
                      {os.hora_inicio_atendimento || '-'}
                      <br />
                      <strong>Conclusão do Atendimento:</strong> {os.fim_atendimento || '-'} -{' '}
                      {os.hora_fim_atendimento || '-'}
                      <br />
                      <strong>Histórico:</strong>{' '}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(os.historico_servico_executado),
                        }}
                      />
                      <br />
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className='text-center'>
                    <strong>Tempo Estimado:</strong>{' '}
                    {formatHourDecimal(os.tempo_estimado_trabalho)}
                    <br />
                    <strong>Tempo Realizado:</strong>{' '}
                    {formatHourDecimal(os.tempo_trabalho_realizado)}
                    <br />
                  </Card.Footer>
                </Card>
              ))}
          </Col>
          <Col
            xs={12}
            xl={4}
            className='bg-warning-subtle p-2 rounded-3 d-flex flex-column gap-2'
          >
            <h4 className='text-center fs-4'>
              Ordens Fechadas
              {hasClosedOrders && (
                <Badge bg='secondary' pill className='ms-1 align-top fs-6'>
                  {closedOrdersByDate.length}
                </Badge>
              )}
            </h4>
            {hasNoClosedOrders && (
              <Alert variant='info' className='text-center'>
                Nenhum registro encontrado.
              </Alert>
            )}
            {hasClosedOrders &&
              closedOrdersByDate.map((os) => (
                <Card key={os.id} className='border-light shadow-sm'>
                  <Card.Header className=''>
                    OS {os.numero_os} - {os.descricao_localizacao_nivel1} /
                    {os.assunto_principal}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{os.ativo}</Card.Title>
                    <Card.Text>
                      <strong>Solicitante:</strong> {os.solicitante_ss || '-'}
                      <br />
                      <strong>Número SS:</strong> {os.numero_ss || '-'}
                      <br />
                      <strong>Localização:</strong> {os.descricao_localizacao_nivel3} -{' '}
                      {os.descricao_localizacao_nivel2}
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
                      <strong>Data da Abertura</strong> {os.data_criacao} - {os.hora_criacao}
                      <br />
                      <strong>Status:</strong>{' '}
                      {os.status_id === OS_Status.CLOSED ? (
                        <Badge bg='danger'>Fechada</Badge>
                      ) : (
                        <Badge bg='warning'>{os.status}</Badge>
                      )}
                      <br />
                      <strong>Responsável:</strong> {os.responsavel_manutencao || '-'}
                      <br />
                      <strong>Fechamento: </strong> {os.data_conclusao} - {os.hora_conclusao}
                      <br />
                      <strong>Histórico:</strong>{' '}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(os.historico_servico_executado),
                        }}
                      />
                      <br />
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className='text-center'>
                    <strong>Tempo Estimado:</strong>{' '}
                    {formatHourDecimal(os.tempo_estimado_trabalho)}
                    <br />
                    <strong>Tempo Realizado:</strong>{' '}
                    {formatHourDecimal(os.tempo_trabalho_realizado)}
                    <br />
                  </Card.Footer>
                </Card>
              ))}
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
};

export default Manusis;
