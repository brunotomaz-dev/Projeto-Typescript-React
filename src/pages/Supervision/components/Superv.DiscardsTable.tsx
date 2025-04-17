// cSpell: words superv
import React, { useMemo } from 'react';
import { Card, Col, Table } from 'react-bootstrap';
import {
  extrairTipoPao,
  extrairTipoPasta,
  toTitleCase,
} from '../../../helpers/helper.functions';
import { iDescartes } from '../interface/Descartes.interface';

interface iDiscardsTableProps {
  discardData: iDescartes[];
}

const SupervDiscardsTable: React.FC<iDiscardsTableProps> = ({ discardData }) => {
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
        paesPastaAgregado[chave] =
          (paesPastaAgregado[chave] || 0) + item.descartePaesPasta;
      }
    });

    const resultado = Object.entries(paesPastaAgregado).map(
      ([paoComPasta, quantidade]) => ({
        nome: paoComPasta,
        quantidade,
      })
    );

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
        const chave = `Bandejas com bobina (${toTitleCase(tipoProduto)}/${tipoBdj})`;
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

  // Processamento dos dados para a tabela de Reprocesso de bandejas
  const reprocessoBdjData = useMemo(() => {
    const bdjAgregado: Record<string, number> = {};

    discardData.forEach((item) => {
      if (item.reprocessoBdj > 0) {
        const tipoProduto = item.produto.split(' ')[1] || 'Produto';
        const tipoBdj = item.produto.split('/')[1] || 'GR';
        const chave = `Bandejas com bobina (${toTitleCase(tipoProduto)}/${tipoBdj})`;
        bdjAgregado[chave] = (bdjAgregado[chave] || 0) + item.reprocessoBdj;
      }
    });

    const resultado = Object.entries(bdjAgregado).map(([bandeja, quantidade]) => ({
      nome: bandeja,
      quantidade,
    }));

    const total = resultado.reduce((acc, curr) => acc + curr.quantidade, 0);

    return { dados: resultado, total };
  }, [discardData]);

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
      <Table striped bordered hover size='sm' className='mb-0'>
        <thead className='bg-light'>
          <tr>
            <th>{title}</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.nome}</td>
              <td>
                {item.quantidade.toFixed(2)}
                {unit}
              </td>
            </tr>
          ))}
          <tr className='table-secondary fw-bold'>
            <td>Total</td>
            <td>
              {total.toFixed(2)}
              {unit}
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <>
      <pre>{JSON.stringify(discardData, null, 2)}</pre>
      <Col xl={4}>
        <Card className='bg-transparent border h-100 shadow'>
          <Card.Header className='bg-light'>
            <h5 className='text-center fs-5 mb-0'>Descarte Total</h5>
          </Card.Header>
          <Card.Body className='p-0'>
            <DescarteTable
              title='Descarte de Pasta'
              data={descartePastaData.dados}
              total={descartePastaData.total}
              unit='kg'
            />

            <DescarteTable
              title='Descarte de Pães'
              data={descartePaesData.dados}
              total={descartePaesData.total}
              unit='kg'
            />

            <DescarteTable
              title='Descarte de Pães com pasta'
              data={descartePaesPastaData.dados}
              total={descartePaesPastaData.total}
              unit='kg'
            />

            <DescarteTable
              title='Descarte de Bandeja'
              data={descarteBdjData.dados}
              total={descarteBdjData.total}
              unit='un'
            />

            <DescarteTable
              title='Reprocesso de bandejas'
              data={reprocessoBdjData.dados}
              total={reprocessoBdjData.total}
              unit='un'
            />
          </Card.Body>
        </Card>
      </Col>
      <Col xl={4}>
        <Card className='bg-transparent border-0 h-100 shadow'>
          <h5 className='text-center fs-5'>Linhas com maior descarte</h5>
        </Card>
      </Col>
      <Col xl={4}>
        <Card className='bg-transparent border-0 h-100 shadow'>
          <h5 className='text-center fs-5'>Linhas que não apontaram descartes</h5>
        </Card>
      </Col>
    </>
  );
};

export default SupervDiscardsTable;
