import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import DateTurnFilter from '../../components/DateTurnFilter';
import { getTurnoName, TurnoID } from '../../helpers/constants';
import { useIndicatorsQuery } from '../../hooks/queries/useIndicatorsQuery';
import { setLineMachine } from '../../redux/store/features/homeSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import HomeAbsence from './components/home.absence';
import HomeCartCountCart from './components/home.cartCount';
import HomeEstoqueCard from './components/home.estoque';
import HomeIndicatorsCard from './components/home.indicatorsCard';
import HomeLinesCard from './components/home.lines';
import HomeProductionCard from './components/home.production';

//cSpell: words eficiencia

const Home: React.FC = () => {
  /* ------------------------------------------------- Hook's ------------------------------------------------ */
  const dispatch = useAppDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const { date, turn } = useAppSelector((state) => state.home.filters);

  // Usar o hook de indicadores com TanStack Query
  const { lineMachineMap, isLoading, isFetching } = useIndicatorsQuery();

  // Determina se estão sendo aplicados filtros não-padrão
  const hasActiveFilters = useAppSelector((state) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    return state.home.filters.date !== today || state.home.filters.turn !== 'ALL';
  });

  /* ------------------------------------------------- Effect ------------------------------------------------ */
  // Sincronizar o mapa de máquinas/linhas com o Redux
  useEffect(() => {
    if (Object.keys(lineMachineMap).length > 0) {
      dispatch(setLineMachine(lineMachineMap));
    }
  }, [lineMachineMap, dispatch]);

  /* ----------------------------------------------------------------------------------------------------------- */
  /*                                                    LAYOUT                                                   */
  /* ----------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <header className='mb-3'>
        <h1 className='text-center'>
          Dados do dia
          {isFetching && !isLoading && <Spinner animation='border' size='sm' variant='primary' />}
        </h1>
      </header>

      <section className='container-fluid'>
        <Button
          variant={showFilters ? 'secondary' : 'outline-secondary'}
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='d-flex align-items-center mb-2'
        >
          <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
        {hasActiveFilters && !showFilters && (
          <span className='badge bg-info text-dark ms-2'>Filtros ativos</span>
        )}

        <Row className='p-1'>
          <DateTurnFilter show={showFilters} />
        </Row>

        {/* Exibir resumo dos filtros aplicados quando os filtros estão escondidos mas ativos */}
        {!showFilters && hasActiveFilters && (
          <div className='alert alert-info d-flex align-items-center mb-3'>
            <i className='bi bi-info-circle-fill me-2'></i>
            <span>
              Exibindo dados de:{' '}
              <strong>{format(parse(date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}</strong>
              {turn !== 'ALL' && (
                <>
                  {' '}
                  - Turno: <strong>{getTurnoName(turn as TurnoID)}</strong>
                </>
              )}
            </span>
          </div>
        )}
      </section>

      <section className='container-fluid'>
        <Row>
          <Col className='p-1' xs={12} md={8}>
            <HomeIndicatorsCard className='mb-2' />
            <HomeAbsence />
            <Container fluid>
              <Row className='gap-2 mt-2'>
                <Col xs={12} md className='p-0'>
                  <HomeProductionCard />
                </Col>
                <Col xs={12} md className='p-0'>
                  <HomeCartCountCart />
                </Col>
              </Row>
            </Container>
          </Col>
          <Col xs={12} md className='p-1'>
            <HomeEstoqueCard />
            <HomeLinesCard />
          </Col>
        </Row>
      </section>
    </>
  );
};

export default Home;
