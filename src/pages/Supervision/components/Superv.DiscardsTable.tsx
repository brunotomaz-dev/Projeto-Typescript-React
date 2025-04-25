// cSpell: words superv
import React from 'react';
import { Card, Col } from 'react-bootstrap';
import MaxDiscardsTable from './superv.MaxDiscardsTable';
import TotalDiscardsTable from './superv.TotalDiscardsTable';

const SupervDiscardsTable: React.FC = () => {
  /* -------------------------------------------------------------------------------------------- */
  /*                                            LAYOUT                                            */
  /* -------------------------------------------------------------------------------------------- */
  return (
    <>
      <Col xl={4}>
        <TotalDiscardsTable />
      </Col>
      <Col xl={4}>
        <MaxDiscardsTable />
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
