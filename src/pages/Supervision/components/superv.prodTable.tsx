import React, { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { getProduction } from '../../../api/apiRequests';
import { TurnoID } from '../../../helpers/constants';
import { iProduction } from '../../ProductionLive/interfaces/production.interface';
import { iDescartes } from '../interface/Descartes.interface';
//cSpell: words paes
interface iProductionTotal {
  [key: string]: number;
}

interface iProductionTableProps {
  shift: TurnoID;
  todayString: string;
  totalProduction: (total: number) => void;
  descartes: (data: iDescartes[]) => void;
}

type iProductionProduct = 'Bolinha' | 'Baguete';

const ProductionTable: React.FC<iProductionTableProps> = ({
  shift,
  todayString,
  totalProduction,
  descartes,
}) => {
  /* ----------------------------------------- LOCAL STATE ---------------------------------------- */
  const [allBagProduction, setAllBagProduction] = useState<iProductionTotal>({});
  const [allBolProduction, setAllBolProduction] = useState<iProductionTotal>({});
  const [totalByProduct, setTotalByProduct] = useState<number>(0);
  const [totalByProductBol, setTotalByProductBol] = useState<number>(0);
  const [totalByProductBag, setTotalByProductBag] = useState<number>(0);

  /* --------------------------------------------------------------------------------- Funções ---- */
  const calcAndSetProduction = (
    data: iProductionTotal,
    productType: iProductionProduct
  ) => {
    const isBolinha = productType === 'Bolinha';

    const setProduct = isBolinha ? setAllBolProduction : setAllBagProduction;
    const setTotalByProduct = isBolinha ? setTotalByProductBol : setTotalByProductBag;

    // Filtra removendo os produtos com descrição ' BOL'
    const selectedProductionItems = Object.entries(data).reduce((acc, [key, value]) => {
      const isKey = isBolinha ? key.includes(' BOL') : !key.includes(' BOL');
      if (isKey) {
        acc[key] = value;
      }
      return acc;
    }, {} as iProductionTotal);

    if (selectedProductionItems && Object.keys(selectedProductionItems).length > 0) {
      setProduct(selectedProductionItems);
      setTotalByProduct(
        Object.values(selectedProductionItems).reduce((acc, curr) => acc + curr, 0)
      );
    } else {
      setProduct({});
      setTotalByProduct(0);
    }
  };
  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  useEffect(() => {
    void getProduction(todayString).then((data: iProduction[]) => {
      // Filtra os produtos de acordo com o turno
      const filteredData = data.filter((prod) => prod.turno === shift);

      /* ------------------------------------------------------------------------------- Descartes ---- */
      // Mantém apenas as colunas relevantes
      const discardsData = filteredData.map((item: iProduction): iDescartes => {
        return {
          linha: item.linha,
          produto: item.produto.trim(),
          descartePaesPasta: item.descarte_paes_pasta,
          descartePaes: item.descarte_paes,
          descartePasta: item.descarte_pasta,
          descarteBdj: item.bdj_vazias,
          reprocessoBdj: item.bdj_retrabalho,
        };
      });

      descartes(discardsData);

      /* -------------------------------------------------------------------------------- Produção ---- */
      // Calcula a produção total por produto e transforma em caixas
      const calculateShiftProduction = filteredData.reduce((acc, curr) => {
        const produto = curr.produto.trim();
        acc[produto] = (acc[produto] || 0) + curr.total_produzido / 10;
        return acc;
      }, {} as iProductionTotal);

      // Produção de Baguete
      calcAndSetProduction(calculateShiftProduction, 'Baguete');
      // Produção de Bolinha
      calcAndSetProduction(calculateShiftProduction, 'Bolinha');
    });
  }, [todayString, shift]);

  useEffect(() => {
    setTotalByProduct(totalByProductBag + totalByProductBol);
    totalProduction(totalByProductBag + totalByProductBol);
  }, [totalByProductBag, totalByProductBol]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <Card className='bg-transparent border-0 h-100'>
      <h5 className='text-center fs-5'>Caixas Produzidas</h5>
      <Card className='shadow border-0 p-2 h-100'>
        <Table striped responsive>
          <thead>
            <tr>
              <th>Produto</th>
              <th className='text-end'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(allBagProduction)
              .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
              .map(([produto, total]) => (
                <tr key={produto}>
                  <td>{produto}</td>
                  <td className='text-end'>
                    {Math.floor(total).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            {totalByProductBag > 0 && (
              <tr>
                <td>
                  <strong>Total de Baguete</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProductBag).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            )}
            {Object.entries(allBolProduction)
              .sort(([prodA], [prodB]) => prodA.localeCompare(prodB))
              .map(([produto, total]) => (
                <tr key={produto}>
                  <td>{produto}</td>
                  <td className='text-end'>
                    {Math.floor(total).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            {totalByProductBol > 0 && (
              <tr>
                <td>
                  <strong>Total de Bolinha</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProductBol).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            )}
            {totalByProduct > 0 && totalByProductBag > 0 && totalByProductBol > 0 && (
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className='text-end'>
                  <strong>{Math.floor(totalByProduct).toLocaleString('pt-BR')}</strong>
                </td>
              </tr>
            )}
            {totalByProduct === 0 && (
              <tr>
                <td colSpan={6} className='text-center py-3 text-muted'>
                  Nenhum registro encontrado para este turno.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Card>
  );
};

export default ProductionTable;
