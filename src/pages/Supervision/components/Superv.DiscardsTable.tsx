// cSpell: words superv
import React from 'react';
import { Col } from 'react-bootstrap';
import MaxDiscardsTable from './superv.MaxDiscardsTable';
import NoDiscardsTable from './superv.NoDIscardsTable';
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
        <NoDiscardsTable />
      </Col>
    </>
  );
};

export default SupervDiscardsTable;
