import React, { useEffect, useMemo } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import ActionPlanCards from '../../components/actionPlanCards';
import DateTurnFilter from '../../components/DateTurnFilter';
import PersonalizedTransition from '../../components/PersonalizedTransition';
import { ActionPlanStatus, TurnoID, superTurns } from '../../helpers/constants';
import { useActionPlansQuery } from '../../hooks/queries/useActionPlanQuery';
import { useFilters } from '../../hooks/useFilters';
import { useFiltersVisibility } from '../../hooks/useFiltersVisibility';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../hooks/useToast';
import { setTotalPresentes } from '../../redux/store/features/supervisionSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store/hooks';
import { RootState } from '../../redux/store/store';
import SupervActionCards from './components/super.ActionCards';
import SupervAbsence from './components/superv.Absence';
import CardGauges from './components/Superv.CardGauges';
import CaixasPessoa from './components/superv.CxsPessoa';
import DetectorTable from './components/superv.DetectorTable';
import SupervDiscardsTable from './components/Superv.DiscardsTable';
import ProductionTable from './components/superv.prodTable';

/**
 * Página de Supervisão
 * Exibe dados de supervisão, incluindo ausências, presenças, produção e planos de ação.
 * Utiliza Redux para gerenciar estado global e hooks personalizados para lógica de negócios.
 */
const SupervisionPage: React.FC = () => {
  /* -------------------------------------------- REDUX ------------------------------------------- */
  const dispatch = useAppDispatch();
  // User
  const userName = useAppSelector((state: RootState) => state.user.fullName);

  /* -------------------------------------------- HOOK -------------------------------------------- */
  const { userFunctionalLevel } = usePermissions();
  const { ToastDisplay } = useToast();

  // Hooks para gerenciar filtros através do Redux
  const {
    isVisible: showFilters,
    toggle: toggleFilters,
    resetVisibility,
  } = useFiltersVisibility('supervision');
  const { turn: shift, setTurnFilter } = useFilters('supervision');

  // Status filter para planos de ação
  const statusFilter = useMemo(() => [ActionPlanStatus.Aberto, ActionPlanStatus.PDCA], []);

  // Hook para gerenciar os planos de ação (usando Redux)
  const { fetchActionPlans, setActionPlanData } = useActionPlansQuery(statusFilter);

  const handlePresentesTotal = (total: number) => {
    dispatch(setTotalPresentes(total));
  };

  /* -------------------------------------------- MEMOS ------------------------------------------- */
  // Valores derivados memoizados
  const isLeadership = useMemo(() => userFunctionalLevel === 1, [userFunctionalLevel]);
  const isSupervisor = useMemo(() => userFunctionalLevel === 2, [userFunctionalLevel]);

  /* ------------------------------------------- EFFECTS ------------------------------------------ */
  // Efeito para definir o turno padrão com base no usuário
  useEffect(() => {
    if (userName in superTurns) {
      setTurnFilter(superTurns[userName]);
    }
  }, [userName, setTurnFilter, superTurns]);

  // Efeito para carregar dados quando muda a data ou turno
  useEffect(() => {
    fetchActionPlans();
  }, [fetchActionPlans]);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      resetVisibility();
    };
  }, [resetVisibility]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <h4 className='text-center fs-3'>
        {isSupervisor ? 'Supervisão - ' : isLeadership ? 'Liderança - ' : ''}
        {userName}
      </h4>
      <Container fluid>
        {/* Botão para mostrar/ocultar filtros */}
        <Row className='mb-1'>
          <Col>
            <Button
              variant={showFilters ? 'secondary' : 'outline-secondary'}
              size='sm'
              onClick={toggleFilters}
              className='d-flex align-items-center mb-1'
            >
              <i className={`bi ${showFilters ? 'bi-funnel-fill' : 'bi-funnel'} me-2`}></i>
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </Col>
        </Row>

        {/* DateTurnFilter com o escopo supervision */}
        <Row className='mb-1'>
          <DateTurnFilter show={showFilters} scope='supervision' all={false} disabled={{}} />
          <PersonalizedTransition scope='supervision' />
        </Row>

        <SupervActionCards />

        <Row className='my-3'>
          <Col xs={12} xl={4}>
            <ProductionTable />
          </Col>
          <Col>
            <CaixasPessoa />
          </Col>
          <Col xs={12} xl={5}>
            <CardGauges />
          </Col>
        </Row>

        <Row>
          <DetectorTable />
        </Row>

        <Row className='mb-3'>
          <SupervDiscardsTable />
        </Row>

        <SupervAbsence onPresenceChange={handlePresentesTotal} />

        <Row>
          <ActionPlanCards status={statusFilter} shift={shift as TurnoID} onDataChange={setActionPlanData} />
        </Row>
      </Container>
      {ToastDisplay && <ToastDisplay />}
    </>
  );
};

export default SupervisionPage;
