import React, { useMemo } from 'react';
import { Alert, Button, Card, Row, Table } from 'react-bootstrap';
import useDiscardsData from '../../../hooks/useDiscardsData';
import { iQualDescartesGroupedByLine } from '../../../interfaces/QualidadeIHM.interface';
import { setIsModalOpen } from '../../../redux/store/features/discardsSlice';
import { useAppDispatch } from '../../../redux/store/hooks';
import DiscardsModalCreate from './superv.DiscardsModalCreate';

// Interface para representar os dados agrupados por linha
interface iLineDiscard extends iQualDescartesGroupedByLine {
  total: number;
}

// Definição dos tipos para as métricas
type DataType = 'descarte' | 'reprocesso';
interface TableDataProps {
  type: DataType;
  data: iLineDiscard[];
  totals: any;
  filter?: (item: iLineDiscard) => boolean;
}

const DiscardsPerLine: React.FC = () => {
  const dispatch = useAppDispatch();

  const { isLoading, error, isFetching, data: discardData } = useDiscardsData('supervision');

  /* ------------------------------------------ PROCESSAMENTO ----------------------------------------- */
  // Agrupar os dados por linha de produção
  const discardsPerLine = useMemo(() => {
    if (!discardData || discardData.length === 0) return [];

    // Criar um objeto para armazenar os descartes por linha
    const lineDiscards: Record<string, iLineDiscard> = {};

    // Processar cada item de descarte
    discardData.forEach((item) => {
      // Se a linha não existir no objeto, cria um novo registro
      if (!lineDiscards[item.linha]) {
        lineDiscards[item.linha] = {
          linha: item.linha,
          data_registro: item.data_registro,
          maquina_id: item.maquina_id,
          descartePasta: 0,
          descartePaes: 0,
          descartePaesPasta: 0,
          descarteBdj: 0,
          reprocessoBdj: 0,
          reprocessoPaes: 0,
          reprocessoPaesPasta: 0,
          reprocessoPasta: 0,
          total: 0,
        };
      }

      // Soma os descartes para a linha
      lineDiscards[item.linha].descartePasta += item.descartePasta || 0;
      lineDiscards[item.linha].descartePaes += item.descartePaes || 0;
      lineDiscards[item.linha].descartePaesPasta += item.descartePaesPasta || 0;
      lineDiscards[item.linha].descarteBdj += item.descarteBdj || 0;
      lineDiscards[item.linha].reprocessoBdj += item.reprocessoBdj || 0;
      lineDiscards[item.linha].reprocessoPaes += item.reprocessoPaes || 0;
      lineDiscards[item.linha].reprocessoPaesPasta += item.reprocessoPaesPasta || 0;
      lineDiscards[item.linha].reprocessoPasta += item.reprocessoPasta || 0;
    });

    // Calcular o total por linha
    Object.values(lineDiscards).forEach((line) => {
      line.total = line.descartePasta + line.descartePaes + line.descartePaesPasta;
      // Não incluímos descarteBdj e reprocessoBdj no total pois são medidos em unidades, não em kg
    });

    // Converter para array e ordenar por linha (crescente)
    return Object.values(lineDiscards)
      .filter((line) => line.total > 0 || line.descarteBdj > 0 || line.reprocessoBdj > 0) // Remover linhas sem descarte ou reprocesso
      .sort((a, b) => a.linha - b.linha);
  }, [discardData]);

  // Calcular totais gerais para a linha de rodapé da tabela
  const totals = useMemo(() => {
    if (discardsPerLine.length === 0) return null;

    return discardsPerLine.reduce(
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
  }, [discardsPerLine]);

  // Verificar se há algum dado de reprocesso para mostrar a tabela
  const hasReprocessData = useMemo(() => {
    return discardsPerLine.some(
      (line) =>
        line.reprocessoBdj > 0 ||
        line.reprocessoPaes > 0 ||
        line.reprocessoPasta > 0 ||
        line.reprocessoPaesPasta > 0
    );
  }, [discardsPerLine]);

  // Verificar se há algum dado de descarte para mostrar a tabela
  const hasDiscardData = useMemo(() => {
    return discardsPerLine.some(
      (line) =>
        line.descartePasta > 0 || line.descartePaes > 0 || line.descartePaesPasta > 0 || line.descarteBdj > 0
    );
  }, [discardsPerLine]);

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
            <th className='text-end'>Bandejas (un)</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((line) => (
            <tr key={`${type}-${line.linha}`}>
              <td>{line.linha}</td>
              <td className='text-end'>
                {type === 'descarte' ? line.descartePasta.toFixed(3) : line.reprocessoPasta.toFixed(3)}
              </td>
              <td className='text-end'>
                {type === 'descarte' ? line.descartePaes.toFixed(3) : line.reprocessoPaes.toFixed(3)}
              </td>
              <td className='text-end'>
                {type === 'descarte'
                  ? line.descartePaesPasta.toFixed(3)
                  : line.reprocessoPaesPasta.toFixed(3)}
              </td>
              <td className='text-end'>{type === 'descarte' ? line.descarteBdj : line.reprocessoBdj}</td>
            </tr>
          ))}
          {totals && (
            <tr className='table-secondary'>
              <td className='fw-bold'>Total</td>
              <td className='text-end fw-bold'>
                {type === 'descarte' ? totals.descartePasta.toFixed(3) : totals.reprocessoPasta.toFixed(3)}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte' ? totals.descartePaes.toFixed(3) : totals.reprocessoPaes.toFixed(3)}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte'
                  ? totals.descartePaesPasta.toFixed(3)
                  : totals.reprocessoPaesPasta.toFixed(3)}
              </td>
              <td className='text-end fw-bold'>
                {type === 'descarte' ? totals.descarteBdj : totals.reprocessoBdj}
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
                <MetricsTable type='descarte' data={discardsPerLine} totals={totals} />
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
                <MetricsTable
                  type='reprocesso'
                  data={discardsPerLine}
                  totals={totals}
                  filter={(line) =>
                    line.reprocessoBdj > 0 ||
                    line.reprocessoPaes > 0 ||
                    line.reprocessoPasta > 0 ||
                    line.reprocessoPaesPasta > 0
                  }
                />
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
