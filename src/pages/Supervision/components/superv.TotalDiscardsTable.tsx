import React, { useMemo } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { extrairTipoPao, extrairTipoPasta, toTitleCase } from '../../../helpers/helper.functions';
import { useProductionAndDiscardsQuery } from '../../../hooks/queries/useProductionAndDiscardsQuery';
import { useAppSelector } from '../../../redux/store/hooks';
import { iDescartes } from '../interface/Descartes.interface';

const TotalDiscardsTable: React.FC = () => {
  /* ------------------------------------------- REDUX ------------------------------------------ */
  // Recuperar dados do Redux
  const discardData = useAppSelector((state) => state.production.descartes) as iDescartes[];
  useProductionAndDiscardsQuery('supervision'); // NOTE - Ainda em uso por causa do redux e compatibilidade

  /* ------------------------------------------ Funções ----------------------------------------- */
  // Processamento dos dados para a tabela de Descarte de Pasta
  const descartePastaData = useMemo(() => {
    const pastaAgregado: Record<string, number> = {};

    discardData.forEach((item) => {
      if (item.descartePasta > 0) {
        const tipoPasta = extrairTipoPasta(item.produto);
        pastaAgregado[tipoPasta] = (pastaAgregado[tipoPasta] || 0) + item.descartePasta;
      }
    });

    const resultado = Object.entries(pastaAgregado).map(([pasta, quantidade]) => ({
      nome: pasta,
      quantidade,
    }));

    const total = resultado.reduce((acc, curr) => acc + curr.quantidade, 0);

    return { dados: resultado, total };
  }, [discardData]);

  // Processamento dos dados para a tabela de Descarte de Pães
  const descartePaesData = useMemo(() => {
    const paesAgregado: Record<string, number> = {};

    discardData.forEach((item) => {
      if (item.descartePaes > 0) {
        const tipoPao = extrairTipoPao(item.produto);
        paesAgregado[tipoPao] = (paesAgregado[tipoPao] || 0) + item.descartePaes;
      }
    });

    const resultado = Object.entries(paesAgregado).map(([pao, quantidade]) => ({
      nome: pao,
      quantidade,
    }));

    const total = resultado.reduce((acc, curr) => acc + curr.quantidade, 0);

    return { dados: resultado, total };
  }, [discardData]);

  // Processamento dos dados para a tabela de Descarte de Pães com pasta
  const descartePaesPastaData = useMemo(() => {
    const paesPastaAgregado: Record<string, number> = {};

    discardData.forEach((item) => {
      if (item.descartePaesPasta > 0) {
        const tipoPao = extrairTipoPao(item.produto);
        const tipoPasta = extrairTipoPasta(item.produto);
        const chave = `${tipoPao} (${tipoPasta})`;
        paesPastaAgregado[chave] = (paesPastaAgregado[chave] || 0) + item.descartePaesPasta;
      }
    });

    const resultado = Object.entries(paesPastaAgregado).map(([paoComPasta, quantidade]) => ({
      nome: paoComPasta,
      quantidade,
    }));

    const total = resultado.reduce((acc, curr) => acc + curr.quantidade, 0);

    return { dados: resultado, total };
  }, [discardData]);

  // Processamento dos dados para a tabela de Descarte de Bandejas
  const descarteBdjData = useMemo(() => {
    const bdjAgregado: Record<string, number> = {};

    discardData.forEach((item) => {
      if (item.descarteBdj > 0) {
        const tipoProduto = item.produto.split(' ')[1] || '?';
        const tipoBdj = item.produto.split('/')[1] || 'GR';
        const chave = `Bandejas com bobina ${toTitleCase(tipoProduto)}/${tipoBdj}`;
        bdjAgregado[chave] = (bdjAgregado[chave] || 0) + item.descarteBdj;
      }
    });

    const resultado = Object.entries(bdjAgregado).map(([bandeja, quantidade]) => ({
      nome: bandeja,
      quantidade,
    }));

    const total = resultado.reduce((acc, curr) => acc + curr.quantidade, 0);

    return { dados: resultado, total };
  }, [discardData]);

  /* --------------------------------- Componentes Reutilizáveis -------------------------------- */
  // Componente de tabela reutilizável
  const DescarteTable = ({
    title,
    data,
    total,
    unit,
  }: {
    title: string;
    data: { nome: string; quantidade: number }[];
    total: number;
    unit: string;
  }) => {
    return (
      <Table responsive hover size='sm' className='mb-0'>
        <thead className='bg-light'>
          <tr>
            <th className='bg-body-secondary'>{title}</th>
            <th className='text-end bg-body-secondary'>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.nome}</td>
              <td className='text-end'>
                {item.quantidade.toLocaleString('pt-BR')} {unit}
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>TOTAL</strong>
            </td>
            <td className='text-end'>
              <strong>
                {total.toLocaleString('pt-BR')} {unit}
              </strong>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  /* ----------------------------------------- Constantes ---------------------------------------- */
  const hasDescartePasta = descartePastaData.dados.length > 0;
  const hasDescartePaes = descartePaesData.dados.length > 0;
  const hasDescartePaesPasta = descartePaesPastaData.dados.length > 0;
  const hasDescarteBdj = descarteBdjData.dados.length > 0;

  const hasAnyDescarte = hasDescartePasta || hasDescartePaes || hasDescartePaesPasta || hasDescarteBdj;

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */

  return (
    <Card className='border h-100 shadow bg-light'>
      <h5 className='text-center fs-5 p-2 mb-0'>Descarte Total</h5>
      {hasAnyDescarte ? (
        <Card.Body className='p-2'>
          <DescarteTable
            title='Descarte de Pasta'
            data={descartePastaData.dados}
            total={descartePastaData.total}
            unit='kg'
          />
          <hr />
          <DescarteTable
            title='Descarte de Pães'
            data={descartePaesData.dados}
            total={descartePaesData.total}
            unit='kg'
          />
          <hr />
          <DescarteTable
            title='Descarte de Pães com pasta'
            data={descartePaesPastaData.dados}
            total={descartePaesPastaData.total}
            unit='kg'
          />
          <hr />
          <DescarteTable
            title='Descarte de Bandeja'
            data={descarteBdjData.dados}
            total={descarteBdjData.total}
            unit='un'
          />
          <hr />
        </Card.Body>
      ) : (
        <Alert variant='warning' className='text-center p-2 mx-2 mt-3'>
          <strong>Nenhum descarte encontrado!</strong>
        </Alert>
      )}
    </Card>
  );
};

export default TotalDiscardsTable;
