import React, { useMemo } from 'react';
import { Alert, Button, Card, Col, Spinner, Table } from 'react-bootstrap';
import { useDetectorQuery } from '../../../hooks/queries/useDetectorQuery';
import { useFilters } from '../../../hooks/useFilters';
import { setDetectorModal } from '../../../redux/store/features/supervisionSlice';
import { useAppDispatch } from '../../../redux/store/hooks';
import DetectorModal from './superv.DetectorModal';

const DetectorTable: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  // Hooks para buscar dados do detector
  const { data, isLoading, isFetching } = useDetectorQuery('supervision');
  const { turn } = useFilters('supervision');
  const dispatch = useAppDispatch();

  const filteredData = useMemo(() => {
    if (!data) return [];
    // Ordena pelo detector_id
    [...data].sort((a, b) => a.detector_id - b.detector_id);

    // Filtra pelo turno
    const filteredDetectorData = data.filter((item) => item.turno === turn);

    return filteredDetectorData;
  }, [data, turn]);

  const hasData = useMemo(() => filteredData && filteredData.length > 0, [filteredData]);
  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <Col className='mb-3'>
      <Card className='border shadow bg-light'>
        <Button
          variant='link'
          size='sm'
          onClick={() => dispatch(setDetectorModal({ detectorModalVisible: true }))}
          className='position-absolute top-0 end-0'
        >
          <i className='bi bi-plus-circle fs-4'></i>
        </Button>
        <DetectorModal />
        <h5 className='text-center fs5 p-2 mb-0'>
          Detector de Metais
          {(isFetching || isLoading) && (
            <Spinner
              animation='border'
              role='status'
              size='sm'
              className={`position-absolute ms-2 mt-1 ${isLoading ? 'text-secondary' : 'text-light-grey'}`}
            >
              <span className='visually-hidden'>Carregando...</span>
            </Spinner>
          )}
        </h5>
        {hasData ? (
          <Card.Body className='p-2'>
            <Table hover responsive striped bordered size='sm' className='m-0'>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className='text-center'>Detector</th>
                  <th className='text-center'>Bdjs c/ Metal Detectado</th>
                  <th className='text-center'>Bdjs c/ Peso Alto</th>
                  <th className='text-center'>Bdjs c/ Peso Ok</th>
                  <th className='text-center'>Bdjs c/ Peso Baixo</th>
                  <th className='text-center'>Peso Alto Média</th>
                  <th className='text-center'>Peso Ok Média</th>
                  <th className='text-center'>Peso Baixo Média</th>
                  <th className='text-center'>Bdjs c/ Peso Alto %</th>
                  <th className='text-center'>Bdjs c/ Peso Ok %</th>
                  <th className='text-center'>Bdjs c/ Peso Baixo %</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((item, index) => (
                  <tr key={index} className={item.metal_detectado ? 'table-danger' : ''}>
                    <td>{item.produto}</td>
                    <td className='text-center align-middle'>Linha {item.detector_id}</td>
                    <td className='text-center align-middle'>{item.metal_detectado}</td>
                    <td className='text-center align-middle'>{item.peso_alto_bandejas}</td>
                    <td className='text-center align-middle'>{item.peso_ok_bandejas}</td>
                    <td className='text-center align-middle'>{item.peso_baixo_bandejas}</td>
                    <td className='text-center align-middle'>{item.peso_alto_media} gr</td>
                    <td className='text-center align-middle'>{item.peso_ok_media} gr</td>
                    <td className='text-center align-middle'>{item.peso_baixo_media} gr</td>
                    <td className='text-center align-middle'>{item.peso_alto_porcentagem}%</td>
                    <td className='text-center align-middle'>{item.peso_ok_porcentagem}%</td>
                    <td className='text-center align-middle'>{item.peso_baixo_porcentagem}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        ) : (
          <Alert variant='warning' className='text-center p-2 mx-2 mt-3'>
            {isLoading ? 'Carregando dados do detector...' : 'Nenhum dado encontrado.'}
          </Alert>
        )}
      </Card>
    </Col>
  );
};

export default DetectorTable;
