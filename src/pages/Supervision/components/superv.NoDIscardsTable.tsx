import React from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useAppSelector } from '../../../redux/store/hooks';
import { iDescartes } from '../interface/Descartes.interface';

const NoDiscardsTable: React.FC = () => {
  /* ------------------------------------------- REDUX ------------------------------------------ */
  // Recuperar dados do Redux
  const discardData = useAppSelector((state) => state.production.descartes) as iDescartes[];

  // Lista com linhas que não tiveram descarte
  const noDiscardLines = discardData.filter((item) => {
    return (
      item.descartePasta === 0 &&
      item.descartePaes === 0 &&
      item.descartePaesPasta === 0 &&
      item.descarteBdj === 0 &&
      item.reprocessoBdj === 0
    );
  });

  // Ordenar pelo número da linha
  noDiscardLines.sort((a, b) => a.linha - b.linha);

  /* ---------------------------------------- Constantes ---------------------------------------- */
  const hasNoDiscardLines = noDiscardLines.length > 0;
  const fullDiscardLines = noDiscardLines.length === discardData.length;
  const displayDiscardLines = hasNoDiscardLines && !fullDiscardLines;

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <Card className='border-0 h-100 shadow'>
      <Card.Header>
        <h5 className='text-center fs-5 mb-0'>Linhas sem Descarte/Reprocesso</h5>
      </Card.Header>
      <Card.Body>
        {displayDiscardLines ? (
          <Row>
            {noDiscardLines.map((item, index) => (
              <Col xl={6} xs={12} className='p-1' key={`discard-${index}`}>
                <Card className='h-100 shadow border-0'>
                  <Card.Body key={`discard-${index}`}>
                    <Card.Text className='mb-0 fs-3 text-center'>Linha {item.linha}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant={`${displayDiscardLines ? 'success' : 'warning'}`} className='text-center'>
            {fullDiscardLines ? 'Nenhum apontamento feito.' : 'Todas as linhas apontaram descarte.'}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default NoDiscardsTable;
