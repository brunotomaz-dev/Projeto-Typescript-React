import React from 'react';

/* -------------------------------------------------------------------------------------------------------- */
/*                                                Interfaces                                                */
/* -------------------------------------------------------------------------------------------------------- */
interface ProductionTableProps {
  data: Array<{
    maquina_id: string;
    intervalo: string;
    total: number;
    linha?: number;
  }>;
}

interface TableRow {
  intervalo: string;
  [key: `linha${number}`]: number | string;
}

/* -------------------------------------------------------------------------------------------------------- */
/*                                                Componente                                                */
/* -------------------------------------------------------------------------------------------------------- */

const ProductionLiveTable: React.FC<ProductionTableProps> = ({ data }) => {
  // Separar dados regulares e totais
  const regularData = data.filter((item) => item.intervalo !== 'Total');
  const totalsData = data.filter((item) => item.intervalo === 'Total');

  // Obter intervalos únicos (excluindo Total)
  const intervals = [...new Set(regularData.map((item) => item.intervalo))];

  // Obter linhas únicas e ordenar
  const lines = [...new Set(regularData.map((item) => item.linha))]
    .filter((linha): linha is number => linha !== undefined)
    .sort((a, b) => a - b);

  // Criar estrutura da tabela
  const tableData = [
    // Dados regulares
    ...intervals.map((interval) => {
      const row: TableRow = { intervalo: interval };
      lines.forEach((line) => {
        const production = regularData.find((item) => item.intervalo === interval && item.linha === line);
        row[`linha${line}`] = production?.total === 0 ? '-' : production ? production.total : '-';
      });
      return row;
    }),
    // Linha de total
    {
      intervalo: 'Total',
      ...lines.reduce((acc, line) => {
        const total = totalsData.find((item) => item.linha === line);
        return { ...acc, [`linha${line}`]: total?.total === 0 ? '-' : total ? total.total : '-' };
      }, {}),
    },
  ];

  /* ------------------------------------------- Layout Componente ------------------------------------------ */

  return (
    <table className="table-responsive table-pLive">
      <thead>
        <tr>
          <th>Intervalo</th>
          {lines.map((line) => (
            <th key={line}>Linha {line}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, idx) => (
          <tr key={idx} className={row.intervalo === 'Total' ? 'table-secondary fw-bold' : ''}>
            <td>{row.intervalo}</td>
            {lines.map((line) => (
              <td key={`${row.intervalo}-${line}`}>{row[`linha${line}`]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductionLiveTable;
