import React, { useEffect } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import DateTurnFilter from '../../components/DateTurnFilter';
import PersonalizedTransition from '../../components/PersonalizedTransition';
import { useIndicatorsQuery } from '../../hooks/queries/useIndicatorsQuery';
import { useFilters } from '../../hooks/useFilters';
import { useFiltersVisibility } from '../../hooks/useFiltersVisibility';
import { setLineMachine } from '../../redux/store/features/homeSlice';
import { useAppDispatch } from '../../redux/store/hooks';
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
  // Usar o hook com o escopo específico da página
  const { isDefault } = useFilters('home');
  // Hook de visibilidade do filtro
  const { isVisible: showFilters, toggle: toggleFilters, resetVisibility } = useFiltersVisibility('home');

  // Usar o hook de indicadores com TanStack Query
  const { lineMachineMap, isLoading, isFetching } = useIndicatorsQuery();

  /* ------------------------------------------------- Effect ------------------------------------------------ */
  // Sincronizar o mapa de máquinas/linhas com o Redux
  useEffect(() => {
    if (Object.keys(lineMachineMap).length > 0) {
      dispatch(setLineMachine(lineMachineMap));
    }
  }, [lineMachineMap, dispatch]);

  // Resetar o estado de visibilidade dos filtros quando desmontar o componente
  useEffect(() => {
    return () => {
      resetVisibility();
    };
  }, [resetVisibility]);

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

      <section className='container-fluid px-1'>
        <Button
          variant={showFilters ? 'secondary' : 'outline-secondary'}
          size='sm'
          onClick={toggleFilters}
          className='d-flex align-items-center mb-1'
        >
          <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
        {!isDefault && !showFilters && <span className='badge bg-info text-dark ms-2'>Filtros ativos</span>}

        <Row className='p-1'>
          <DateTurnFilter show={showFilters} scope='home' />
          <PersonalizedTransition scope='home' />
        </Row>
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
