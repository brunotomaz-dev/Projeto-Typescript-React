import React from 'react';
import { Alert, Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { useAppSelector } from '../../../redux/store/hooks';
import { iDescartes } from '../interface/Descartes.interface';

interface iDescartesData {
  linha: number;
  valor: number;
  produto: string;
}

const MaxDiscardsTable: React.FC = () => {
  /* ------------------------------------------- REDUX ------------------------------------------ */
  // Recuperar dados do Redux
  const discardData = useAppSelector((state) => state.discards.discardData) as iDescartes[];

  /* ------------------------------------------ Funções ----------------------------------------- */
  // Obter os N principais descartes para um determinado tipo de descarte
  const getTopDiscards = (data: iDescartes[], key: keyof iDescartes, topN: number = 3) => {
    if (!data || data.length === 0) {
      return [];
    }

    // Filtrar apenas itens com valor maior que zero
    const validItems = data.filter((item) => Number(item[key] || 0) > 0);

    // Ordenar os itens pelo valor de descarte em ordem decrescente
    const sortedItems = validItems
      .map((item) => ({
        linha: item.linha,
        valor: Number(item[key] || 0),
        produto: item.produto, // Incluir o produto pode ser útil para exibição
      }))
      .sort((a, b) => b.valor - a.valor);

    // Retornar os top N itens ou menos se não houver itens suficientes
    return sortedItems.slice(0, topN);
  };

  // Obter os 3 maiores valores de descarte para cada tipo de descarte
  const topPastaDiscards = getTopDiscards(discardData, 'descartePasta', 3);
  const topPaesDiscards = getTopDiscards(discardData, 'descartePaes', 3);
  const topPaesPastaDiscards = getTopDiscards(discardData, 'descartePaesPasta', 3);
  const topBdjDiscards = getTopDiscards(discardData, 'descarteBdj', 3);
  const topReprocessoDiscards = getTopDiscards(discardData, 'reprocessoBdj', 3);

  /* ---------------------------------------- Constantes ---------------------------------------- */
  const hasPastaDiscards = topPastaDiscards.length > 0;
  const hasPaesDiscards = topPaesDiscards.length > 0;
  const hasPaesPastaDiscards = topPaesPastaDiscards.length > 0;
  const hasBdjDiscards = topBdjDiscards.length > 0;
  const hasReprocessoDiscards = topReprocessoDiscards.length > 0;

  const hasAnyDiscards =
    hasPastaDiscards ||
    hasPaesDiscards ||
    hasPaesPastaDiscards ||
    hasBdjDiscards ||
    hasReprocessoDiscards;

  /* ---------------------------------- Componente Interno --------------------------------- */
  interface iDiscardCardProps {
    discardedItems: iDescartesData[];
    un?: string;
  }

  const DiscardCard: React.FC<iDiscardCardProps> = ({ discardedItems, un = 'kg' }) => {
    return (
      <>
        {discardedItems.map((item, index) => (
          <Col className='p-1' key={`discard-${index}`}>
            <OverlayTrigger
              placement='top'
              overlay={<Tooltip id={`tooltip-${index}`}>{item.produto}</Tooltip>}
            >
              <Card key={`discard-${index}`} className='h-100 shadow border-0 action-card'>
                <Card.Body>
                  <Card.Text className='mb-0 text-muted fs-5'>Linha {item.linha}</Card.Text>
                  <Card.Text className='text-center fs-3 text-truncate'>
                    {item.valor.toLocaleString('pt-BR')} {un}
                  </Card.Text>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          </Col>
        ))}
      </>
    );
  };

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <Card className='border-0 h-100 shadow'>
      <Card.Header>
        <h5 className='text-center fs-5 mb-0'>Top 3 Linhas com Maior Descarte</h5>
      </Card.Header>
      <Card.Body>
        {hasPastaDiscards && (
          <>
            <h6 className='text-center'>
              <em>Descarte de Pasta</em>
            </h6>
            <Row>
              <DiscardCard discardedItems={topPastaDiscards} />
            </Row>
            <hr />
          </>
        )}
        {hasPaesDiscards && (
          <>
            <h6 className='text-center'>
              <em>Descarte de Pães</em>
            </h6>
            <Row>
              <DiscardCard discardedItems={topPaesDiscards} />
            </Row>
            <hr />
          </>
        )}
        {hasPaesPastaDiscards && (
          <>
            <h6 className='text-center'>
              <em>Descarte de Pães com Pasta</em>
            </h6>
            <Row>
              <DiscardCard discardedItems={topPaesPastaDiscards} />
            </Row>
            <hr />
          </>
        )}
        {hasBdjDiscards && (
          <>
            <h6 className='text-center'>
              <em>Descarte de Bandeja</em>
            </h6>
            <Row>
              <DiscardCard discardedItems={topBdjDiscards} un='un' />
            </Row>
            <hr />
          </>
        )}
        {hasReprocessoDiscards && (
          <>
            <h6 className='text-center'>
              <em>Reprocesso de Bandeja</em>
            </h6>
            <Row>
              <DiscardCard discardedItems={topReprocessoDiscards} un='un' />
            </Row>
          </>
        )}
        {!hasAnyDiscards && (
          <Alert variant='warning' className='text-center'>
            Nenhum descarte encontrado para o dia selecionado.
            <br />
            Verifique se os dados estão corretos ou se houve algum erro no apontamento.
            <br />
            Caso tenha dúvidas, entre em contato com o suporte.
            <br />
            <strong>Equipe de Automação</strong>
            <br />
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MaxDiscardsTable;
