import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, FormSelect, ProgressBar, Row } from 'react-bootstrap';
import { getAssetsPreventive } from '../../api/apiRequests';
import { clearCorretiveOnly, clearPreventiva, setLoading } from '../../redux/store/features/preventivaSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import OrderServiceCards from '../Manusis/components/orderServiceCards';
import { fetchPreventive, fetchServicesOrders } from '../Manusis/functions/fetchPreventiveCorretive';
import { formatHourDecimal } from '../Manusis/functions/formatHourDecimal';
import { iMaintenanceOrders, OS_Status } from '../Manusis/interfaces/MaintenanceOrders';
import { iAtivosPreventiva } from './interfaces/Ativos.interface';

interface iDescriptionCardPreventiveProps {
  text: string;
  data: string;
}

interface iBasicCardPreventiveProps {
  text: string;
  data: string | number;
}

const Preventivas: React.FC = () => {
  /* ------------------------------------------------ Redux ----------------------------------------------- */
  const { corretive, preventive, inspection, isLoading, progress, progressOS, assetIdentifier } =
    useAppSelector((state) => state.preventiva);

  const lastPreventive = preventive.length > 0 ? preventive[0] : ({} as iMaintenanceOrders);
  const dispatch = useAppDispatch();

  /* --------------------------------------------- Local State -------------------------------------------- */
  const [selectedAsset, setSelectedAsset] = useState<string>(lastPreventive.ativo);
  const [assetsList, setAssetsList] = useState<iAtivosPreventiva[]>([]);
  const [uniqueAssetsList, setUniqueAssetsList] = useState<iAtivosPreventiva[]>([]);

  /* ---------------------------------------------- Component --------------------------------------------- */

  const BasicCardPreventive: React.FC<iBasicCardPreventiveProps> = ({ text, data }) => {
    return (
      <Card>
        <Card.Body>
          <Card.Title className='text-muted fs-6'>{text}</Card.Title>
          <Card.Text className='text-center fs-3 text-truncate'>{data}</Card.Text>
        </Card.Body>
      </Card>
    );
  };

  const DescriptionCardPreventive: React.FC<iDescriptionCardPreventiveProps> = ({ text, data }) => {
    return (
      <Card>
        <Card.Body>
          <Card.Title className='text-muted fs-6'>{text}</Card.Title>
          <Card.Text className='fs-4'>
            <span
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data),
              }}
            />
          </Card.Text>
        </Card.Body>
      </Card>
    );
  };

  /* ----------------------------------------------- Effect ----------------------------------------------- */
  // Carregar lista de ativos
  useEffect(() => {
    if (assetsList.length === 0) {
      dispatch(setLoading(true));
      void getAssetsPreventive().then((response: iAtivosPreventiva[]) => {
        if (response) {
          setAssetsList(response);
          // Remove duplicatas
          const uniqueAssets = response.filter(
            (asset, index, self) => index === self.findIndex((a) => a.codigo_ativo === asset.codigo_ativo)
          );
          setUniqueAssetsList(uniqueAssets);
          dispatch(setLoading(false));
        }
      });
    }
  }, []);

  // Recupera dados preventivos quando o ativo é alterado
  useEffect(() => {
    if (selectedAsset !== lastPreventive.ativo) {
      dispatch(setLoading(true));
      const asset_id = assetsList.find((asset) => asset.ativo === selectedAsset)?.codigo_ativo;

      if (!asset_id) {
        dispatch(setLoading(false));
        return;
      }
      fetchPreventive(asset_id, dispatch);
    }
  }, [selectedAsset]);

  // Busca os dados corretivos após os preventivos estarem carregados
  useEffect(() => {
    // Verificar se temos dados essenciais e se precisamos atualizar os corretivos
    if (
      assetIdentifier?.codigo_ativo &&
      assetIdentifier?.data_conclusao &&
      (corretive.length === 0 ||
        (corretive.length > 0 && corretive[0]?.codigo_ativo !== assetIdentifier.codigo_ativo))
    ) {
      // Chama apenas com as informações mínimas necessárias
      fetchServicesOrders(
        {
          codigo_ativo: assetIdentifier.codigo_ativo,
          data_conclusao: assetIdentifier.data_conclusao,
        },
        dispatch
      );
    } else if (
      preventive.length > 0 &&
      (corretive.length === 0 || corretive[0]?.codigo_ativo !== preventive[0].codigo_ativo)
    ) {
      // Fallback para manter compatibilidade
      fetchServicesOrders(
        {
          codigo_ativo: preventive[0].codigo_ativo,
          data_conclusao: preventive[0].data_conclusao,
        },
        dispatch
      );
    }
  }, [assetIdentifier, preventive.length]);

  // Se mudar a seleção para 'selecione um ativo', limpar os dados
  useEffect(() => {
    if (selectedAsset === '') {
      dispatch(setLoading(true));
      dispatch(clearPreventiva());
      dispatch(clearCorretiveOnly());
      dispatch(setLoading(false));
    }
  }, [selectedAsset]);

  /* ------------------------------------------------ Dados ----------------------------------------------- */
  let basicPreventive: { text: string; data: string | number; size?: { xl: number } }[] = [];

  if (lastPreventive.ativo) {
    basicPreventive = [
      {
        text: 'OS',
        data: lastPreventive.numero_os,
      },
      {
        text: 'Tipo',
        data: lastPreventive.tipo_manutencao,
      },
      {
        text: 'Aberta por',
        data: lastPreventive.criado_por || 'Programação',
      },
      {
        text: 'Concluída em',
        data: format(lastPreventive.data_conclusao, 'dd/MM/yyyy'),
        size: { xl: 2 },
      },
    ];
  }

  let inspectionCards: { text: string; data: string | number; size?: { xl: number } }[] = [];

  if (inspection.length > 0) {
    inspectionCards = [
      {
        text: 'Ativo',
        data: inspection[0].ativo,
        size: { xl: 3 },
      },
      {
        text: 'OS',
        data: inspection[0].numero_os,
      },
      {
        text: 'Tipo',
        data: inspection[0].tipo_manutencao,
      },
      {
        text: 'Aberta por',
        data: inspection[0].criado_por || 'Programação',
      },
      {
        text: 'Concluída em',
        data: format(inspection[0].data_conclusao, 'dd/MM/yyyy'),
        size: { xl: 2 },
      },
    ];
  }

  /* ---------------------------------------------- Constants --------------------------------------------- */
  const hasPreventive = lastPreventive.numero_os;
  const hasCorretive = corretive.length > 0;
  const hasInspection = inspection.length > 0;
  const renderPreventive = hasPreventive && !isLoading && selectedAsset !== '';
  const renderInspection = hasInspection && !isLoading && selectedAsset !== '';
  const renderCorretive = hasCorretive && !isLoading && selectedAsset !== '';
  const renderAlert = !isLoading && selectedAsset !== '';

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <Container fluid className='p-0'>
      <h1 className='text-center'>Preventiva</h1>
      {isLoading && (
        <>
          <p className='text-muted mb-0'>Carregando...</p>
          <ProgressBar className='mb-3'>
            <ProgressBar animated now={progress} key={1} label='Preventiva' />
            <ProgressBar animated now={progressOS} variant='success' key={2} label='OS Corretivas' />
          </ProgressBar>
        </>
      )}
      <Card className='bg-transparent shadow p-2 border-0'>
        <Row className='w-100 align-self-center'>
          <Col xl={3} className='p-1'>
            <Card className='h-100'>
              <Card.Title className='text-muted fs-6 px-3 pt-3'>Ativo</Card.Title>

              <FormSelect
                value={selectedAsset || 'Selecione um ativo'}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className='text-center fs-3 border-0'
              >
                <option className='fs-6' value={selectedAsset} disabled>
                  {selectedAsset}
                </option>
                <option className='fs-6' value=''>
                  Selecione um ativo
                </option>
                {uniqueAssetsList.map((asset) => (
                  <option
                    className='fs-5 text-start'
                    key={`${asset.codigo_ativo}-${asset.ativo}`}
                    value={asset.ativo}
                  >
                    {asset.ativo}
                  </option>
                ))}
              </FormSelect>
            </Card>
          </Col>
          {renderPreventive &&
            basicPreventive.map((item, index) => (
              <Col key={index + 'prev'} className='p-1' xl={item.size?.xl}>
                <BasicCardPreventive text={item.text} data={item.data} />
              </Col>
            ))}
        </Row>
        {renderPreventive ? (
          <Row className='mt-3 w-100 align-self-center'>
            <Col xl={6} className='p-0'>
              <Row className='mx-auto'>
                <Col xl={6} className='p-1'>
                  <BasicCardPreventive
                    text='Previsão de tempo'
                    data={formatHourDecimal(lastPreventive.tempo_estimado_trabalho)}
                  />
                </Col>
                <Col xl={6} className='p-1'>
                  <BasicCardPreventive
                    text='Tempo Realizado'
                    data={formatHourDecimal(lastPreventive.tempo_trabalho_realizado)}
                  />
                </Col>
              </Row>
              <Row className='mx-auto'>
                <Col className='p-1'>
                  <DescriptionCardPreventive text='Descrição' data={lastPreventive.descricao} />
                </Col>
              </Row>
            </Col>
            <Col xl={6} className='p-1'>
              <DescriptionCardPreventive
                text='Serviço Realizado'
                data={lastPreventive.historico_servico_executado}
              />
            </Col>
          </Row>
        ) : (
          renderAlert && (
            <Alert className='mt-3' variant='warning' style={{ width: '100%' }}>
              <Alert.Heading className='text-center'>Nenhum dado de preventiva encontrado</Alert.Heading>
              <p className='text-center'>
                Não há dados disponíveis para o ativo selecionado ou a OS não foi concluída.
              </p>
            </Alert>
          )
        )}
      </Card>
      {renderInspection && (
        <Card className='bg-transparent shadow p-2 mt-3 border-0'>
          <Card.Body>
            <Card.Title className='text-center fs-3'>Inspeção</Card.Title>
            <Row className='w-100 align-self-center'>
              {inspectionCards.map((item, index) => (
                <Col key={index} className='p-1' xl={item.size?.xl}>
                  <BasicCardPreventive text={item.text} data={item.data} />
                </Col>
              ))}
            </Row>
            <Row className='mt-3 w-100 align-self-center'>
              <Col xl={6} className='p-0'>
                <Row className='mx-auto'>
                  <Col xl={6} className='p-1'>
                    <BasicCardPreventive
                      text='Previsão de tempo'
                      data={formatHourDecimal(inspection[0].tempo_estimado_trabalho)}
                    />
                  </Col>
                  <Col xl={6} className='p-1'>
                    <BasicCardPreventive
                      text='Tempo Realizado'
                      data={formatHourDecimal(inspection[0].tempo_trabalho_realizado)}
                    />
                  </Col>
                </Row>
                <Row className='mx-auto'>
                  <Col className='p-1'>
                    <DescriptionCardPreventive text='Descrição' data={inspection[0].descricao} />
                  </Col>
                </Row>
              </Col>
              <Col xl={6} className='p-1'>
                <DescriptionCardPreventive
                  text='Serviço Realizado'
                  data={inspection[0].historico_servico_executado}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      {renderCorretive ? (
        <>
          <h3 className='text-center fs-3 mt-3 d-flex flex-row justify-content-center align-items-center'>
            {preventive.length > 0 ? 'Corretivas pós Preventiva' : 'Corretivas pós Inspeção'}
            <Badge bg='primary' className='ms-1 align-self-start' style={{ fontSize: '0.6rem' }} pill>
              {corretive.length}
            </Badge>
          </h3>
          <Col className='d-flex justify-content-between flex-wrap flex-row gap-3'>
            {corretive.map((os) => (
              <OrderServiceCards
                key={os.id}
                os={os}
                className={`shadow border border-1 border-light bg-${
                  os.status_id === OS_Status.CLOSED
                    ? 'success'
                    : os.status_id === OS_Status.COMPLETED_NOTES
                      ? 'warning'
                      : os.status_id === OS_Status.CANCELED
                        ? 'danger'
                        : 'light'
                }-subtle`}
                style={{ width: '520px' }}
              />
            ))}
          </Col>
        </>
      ) : (
        renderAlert && (
          <Alert className='mt-3' variant='warning' style={{ width: '100%' }}>
            <Alert.Heading className='text-center'>Nenhum dado de corretiva encontrado</Alert.Heading>
            <p className='text-center'>
              Não há dados disponíveis para o ativo selecionado ou a OS não foi concluída.
            </p>
          </Alert>
        )
      )}
    </Container>
  );
};

export default Preventivas;
