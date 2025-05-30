import React from 'react';

import { Card, Col } from 'react-bootstrap';

interface iCardsProps {
  title: string;
  value: number;
  onClick?: () => void;
}

const SuperCardsAbsence: React.FC<iCardsProps> = ({ title, value, onClick }) => {
  return (
    <Col className='p-1 align-content-center'>
      <Card
        className='shadow border-0 fs-responsive action-card'
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      >
        <Card.Body className='p-2'>
          <Card.Title className='fs-6 fw-light text-truncate' title={title}>
            {title}
          </Card.Title>
          <Card.Text className='text-center fs-1'>{value}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default SuperCardsAbsence;
