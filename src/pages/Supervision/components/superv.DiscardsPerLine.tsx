import React, { useMemo } from 'react';
import { Alert, Button, Card, Row, Table } from 'react-bootstrap';
import useDiscardsData from '../../../hooks/useDiscardsData';
import { iQualDescartesGroupedByLine } from '../../../interfaces/QualidadeIHM.interface';
import { setIsModalOpen } from '../../../redux/store/features/discardsSlice';
import { useAppDispatch } from '../../../redux/store/hooks';
import DiscardsModalCreate from './superv.DiscardsModalCreate';

// Definição dos tipos para as métricas
type DataType = 'descarte' | 'reprocesso';
interface TableDataProps {
  type: DataType;
  data: iQualDescartesGroupedByLine[];
  totals: {
    descartePasta: number;
    descartePaes: number;
    descartePaesPasta: number;
    descarteBdj: number;
    reprocessoBdj: number;
    reprocessoPaes: number;
    reprocessoPaesPasta: number;
    reprocessoPasta: number;
  } | null;
  filter?: (item: iQualDescartesGroupedByLine) => boolean;
}

const DiscardsPerLine: React.FC = () => {
  const dispatch = useAppDispatch();

  const { isLoading, error, isFetching, data: discardData } = useDiscardsData('supervision');

  /* ------------------------------------------ PROCESSAMENTO ----------------------------------------- */

  // Calcular totais gerais para a linha de rodapé da tabela
  const totals = useMemo(() => {
    if (discardData.length === 0) return null;

    return discardData.reduce(
      (acc, curr) => {
        acc.descartePasta += curr.descartePasta;
        acc.descartePaes += curr.descartePaes;
        acc.descartePaesPasta += curr.descartePaesPasta;
        acc.descarteBdj += curr.descarteBdj;
        acc.reprocessoBdj += curr.reprocessoBdj;
        acc.reprocessoPaes += curr.reprocessoPaes;
        acc.reprocessoPaesPasta += curr.reprocessoPaesPasta;
        acc.reprocessoPasta += curr.reprocessoPasta;
        return acc;
      },
      {
        descartePasta: 0,
        descartePaes: 0,
        descartePaesPasta: 0,
        descarteBdj: 0,
        reprocessoBdj: 0,
        reprocessoPaes: 0,
        reprocessoPaesPasta: 0,
        reprocessoPasta: 0,
      }
    );
  }, [discardData]);

  // Verificar se há algum dado de reprocesso para mostrar a tabela
  const hasReprocessData = useMemo(() => {
    return discardData.some(
      (line) =>
        line.reprocessoBdj > 0 ||
        line.reprocessoPaes > 0 ||
        line.reprocessoPasta > 0 ||
        line.reprocessoPaesPasta > 0
    );
  }, [discardData]);

  // Verificar se há algum dado de descarte para mostrar a tabela
  const hasDiscardData = useMemo(() => {
    return discardData.some(
      (line) =>
        line.descartePasta > 0 || line.descartePaes > 0 || line.descartePaesPasta > 0 || line.descarteBdj > 0
    );
  }, [discardData]);

  // Filtro de dados de descarte
  const discardFilter = useMemo(() => {
    return (line: iQualDescartesGroupedByLine) =>
      line.descarteBdj > 0 || line.descartePaes > 0 || line.descartePasta > 0 || line.descartePaesPasta > 0;
  }, []);

  // Filtro de dados de reprocesso
  const reprocessFilter = useMemo(() => {
    return (line: iQualDescartesGroupedByLine) =>
      line.reprocessoBdj > 0 ||
      line.reprocessoPaes > 0 ||
      line.reprocessoPasta > 0 ||
      line.reprocessoPaesPasta > 0;
  }, []);

  // Componente de tabela reutilizável
  const MetricsTable: React.FC<TableDataProps> = ({ type, data, totals, filter }) => {
    // Filtrar dados se necessário
    const filteredData = filter ? data.filter(filter) : data;

    // Verificar se há dados para exibir
    if (filteredData.length === 0) return null;

    return (
      <Table striped hover responsive size='sm'>
        <thead>
          <tr className='bg-light'>
            <th>Linha</th>
            <th className='text-end'>Pasta (kg)</th>
            <th className='text-end'>Pães (kg)</th>
            <th className='text-end'>Pães c/ Pasta (kg)</th>
            <th className='text-end'>Bandejas {type === 'descarte' ? '(kg)' : '(un)'}</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((line) => (
            <tr key={`${type}-${line.linha}`}>
              <td>{line.linha}</td>
              <td className='text-end'>
                {type === 'descarte'
                  ? line.descartePasta.toLocaleString('pt-BR')
                  : line.reprocessoPasta.toLocaleString('pt-BR')}
              </td>
              <td className='text-end'>
                {type === 'descarte'
                  ? line.descartePaes.toLocaleString('pt-BR')
                  : line.reprocessoPaes.toLocaleString('pt-BR')}
              </td>
              <td className='text-end'>
                {type === 'descarte'
                  ? line.descartePaesPasta.toLocaleString('pt-BR')
                  : line.reprocessoPaesPasta.toLocaleString('pt-BR')}
              </td>
              <td className='text-end'>
                {type === 'descarte'
                  ? line.descarteBdj.toLocaleString('pt-BR')
                  : line.reprocessoBdj.toLocaleString('pt-BR')}
              </td>
            </tr>
          ))}
          {totals && (
            <tr className='table-secondary'>
              <td className='fw-bold'>Total</td>
              <td className='text-end fw-bold'>
                {type === 'descarte'
                  ? totals.descartePasta.toLocaleString('pt-BR')
                  : totals.reprocessoPasta.toLocaleString('pt-BR')}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte'
                  ? totals.descartePaes.toLocaleString('pt-BR')
                  : totals.reprocessoPaes.toLocaleString('pt-BR')}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte'
                  ? totals.descartePaesPasta.toLocaleString('pt-BR')
                  : totals.reprocessoPaesPasta.toLocaleString('pt-BR')}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte'
                  ? totals.descarteBdj.toLocaleString('pt-BR')
                  : totals.reprocessoBdj.toLocaleString('pt-BR')}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  const isRefreshing = isLoading || isFetching;

  if (error) {
    return (
      <Card className='h-100 bg-light border-0 shadow'>
        <Card.Body>
          <Alert variant='danger'>{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className='h-100 bg-light border-0 shadow'>
      {isRefreshing && (
        <Row className='position-absolute top-0 end-0 m-2'>
          <div className={`spinner-border ${isLoading ? 'text-secondary' : 'text-light-grey'}`} role='status'>
            <span className='visually-hidden'>Atualizando...</span>
          </div>
        </Row>
      )}
      <Button
        variant='link'
        onClick={() => dispatch(setIsModalOpen(true))}
        size='sm'
        className='position-absolute top-0 end-0 rounded-5'
      >
        <i className='bi bi-plus-circle fs-4'></i>
      </Button>
      <DiscardsModalCreate />
      {!isLoading && (
        <Card.Body className='p-2'>
          <>
            <h5 className='text-center mb-2'>Descartes por Linha</h5>
            {/* Tabela de Descartes */}
            {hasDiscardData ? (
              <>
                <MetricsTable type='descarte' data={discardData} totals={totals} filter={discardFilter} />
              </>
            ) : (
              <Alert variant='warning' className='text-center p-2 mx-2 mt-3'>
                <strong>Não há dados de descarte para o período selecionado</strong>
              </Alert>
            )}

            <h5 className='text-center my-2'>Reprocesso por Linha</h5>
            {/* Tabela de Reprocesso */}
            {hasReprocessData ? (
              <>
                <MetricsTable type='reprocesso' data={discardData} totals={totals} filter={reprocessFilter} />
              </>
            ) : (
              <Alert variant='warning' className='text-center p-2 mx-2 mt-3 text-muted'>
                <strong>Não há dados de reprocesso para o período selecionado</strong>
              </Alert>
            )}
          </>
        </Card.Body>
      )}
    </Card>
  );
};

export default DiscardsPerLine;
