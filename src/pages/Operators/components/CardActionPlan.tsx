import { format, parseISO, subMonths } from 'date-fns';
import React, { useMemo } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import {
  getMotivoColor,
  getMotivoIcon,
  getTurnoName,
  indicatorsActionPlan,
} from '../../../helpers/constants';
import { useActionPlanOperators } from '../../../hooks/queries/useActionPlanOperators';
import { useActionPlanModal } from '../../../hooks/useActionPlanModal';
import { useFilters } from '../../../hooks/useFilters';
import { iActionPlan } from '../../../interfaces/ActionPlan.interface';
import { useAppSelector } from '../../../redux/store/hooks';

// Constantes
const MONTHS_LOOKBACK = 6;
const COLOR_MIX_PERCENTAGE = 30;
const DEFAULT_ICON = 'bi-question-circle';

// Funções utilitárias fora do componente para evitar recriações
const extractLineNumber = (description: string): number | null => {
  const regex = /^Linha\s+(\d+)\s+-/i;
  const match = description.match(regex);
  return match ? parseInt(match[1], 10) : null;
};

const getMotivoFromDescription = (description: string): string => {
  const parts = description.split('-');
  return parts.length > 3 ? parts[3].trim() : '';
};

// Subcomponente para reutilização
const InfoCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = 'col-md-3 py-2 border-0 shadow-sm' }) => (
  <Card className={className}>
    <Card.Text className='text-muted text-center'>{children}</Card.Text>
  </Card>
);

interface iCardsActionPlanProps {
  scope: string;
}

/* ----------------------------------------------------------------------------------------------------------- */
/*                                             COMPONENTE PRINCIPAL                                            */
/* ----------------------------------------------------------------------------------------------------------- */
const CardActionPlan: React.FC<iCardsActionPlanProps> = ({ scope }) => {
  // Data de 6 meses
  const sixMonthsAgo = subMonths(new Date(), MONTHS_LOOKBACK);
  // Primeiro dia do mês
  const firstDayOfMonth = format(
    new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1),
    'yyyy-MM-dd'
  );

  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { selectedLines, turn } = useFilters(scope);
  const { data } = useActionPlanOperators({ data: [firstDayOfMonth], conclusao: [0, 3] });
  const { functionalLevel } = useAppSelector((state) => state.user);
  const { openModal } = useActionPlanModal(scope);

  /* ------------------------------------------------- Memos ------------------------------------------------- */
  // Filtrar dados por linha
  const filteredData = useMemo(() => {
    // Validação mais robusta
    if (!data?.length || !selectedLines?.length || !turn) {
      return [];
    }

    const targetLine = selectedLines[0];
    if (typeof targetLine !== 'number' || targetLine <= 0) {
      return [];
    }

    const levelFilteredData = data.filter((item) => item.lvl <= functionalLevel);

    if (levelFilteredData.length === 0) {
      return [];
    }

    return levelFilteredData.filter((item) => {
      const lineNumber = extractLineNumber(item.descricao);
      return lineNumber === targetLine && item.turno === turn;
    });
  }, [data, selectedLines, turn, functionalLevel]);

  const hasData = useMemo(() => {
    return filteredData && filteredData.length > 0;
  }, [filteredData]);

  /* ------------------------------------------------ Handles ------------------------------------------------ */
  const handleBtnClick = (item: iActionPlan) => {
    openModal({
      mode: 'edit',
      editData: item,
    });
  };

  /* --------------------------------------------------------------------------------------------------------- */
  /*                                                   LAYOUT                                                  */
  /* --------------------------------------------------------------------------------------------------------- */
  return (
    <>
      {hasData && (
        <>
          {filteredData.map((item) => {
            const motivo = getMotivoFromDescription(item.descricao);
            const motiveIcon = motivo ? getMotivoIcon(motivo) : DEFAULT_ICON;
            const motiveColor = motivo ? getMotivoColor(motivo) : '';
            // Se houver motivo cria um efeito subtle de cor
            const motiveColorSubtle = motiveColor
              ? `color-mix(in srgb, ${motiveColor} ${COLOR_MIX_PERCENTAGE}%, white ${100 - COLOR_MIX_PERCENTAGE}%)`
              : '';

            return (
              <Card
                key={item.recno}
                className={`${motivo ? 'text-dark' : 'text-muted'} shadow border-0 mt-4`}
                style={{ backgroundColor: motiveColorSubtle }}
              >
                <Card.Header
                  className='d-flex justify-content-between align-items-center'
                  style={{ backgroundColor: `${motiveColor}` }}
                >
                  <span className={`fs-5 ${motivo ? 'text-light' : 'text-muted'}`}>
                    <i className={`bi ${motiveIcon} me-2 fs-6`}></i>
                    <strong>Responsável:</strong> {item.responsavel} - {motivo}
                  </span>
                  <Button
                    variant='link'
                    className='text-light fs-5'
                    aria-label={`Editar plano de ação para ${item.responsavel}`}
                    onClick={() => handleBtnClick(item)}
                  >
                    <i className='bi bi-pencil-square'></i>
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row className='justify-content-around'>
                    <InfoCard>{getTurnoName(item.turno)}</InfoCard>
                    <InfoCard>Linha {selectedLines[0]}</InfoCard>
                    <InfoCard>{format(parseISO(item.data_registro), 'dd/MM/yyyy')}</InfoCard>
                  </Row>
                  <Row className='justify-content-around mt-3'>
                    <InfoCard>{indicatorsActionPlan[item.indicador]}</InfoCard>
                    <InfoCard>Prioridade: {item.prioridade}</InfoCard>
                    <InfoCard>Impacto: {item.impacto}%</InfoCard>
                  </Row>
                  <Row className='justify-content-around mt-3'>
                    <InfoCard className='col-md-5 py-2 border-0 shadow-sm'>
                      <strong>Descrição:</strong>
                      <br /> {item.descricao}
                    </InfoCard>
                    <Col md={5} className='p-0'>
                      <InfoCard className='py-2 border-0 shadow-sm mb-2'>
                        <strong>Contenção:</strong>
                        <br /> {item.contencao}
                      </InfoCard>
                      <InfoCard className='py-2 border-0 shadow-sm mb-2'>
                        <strong>Causa Raiz:</strong>
                        <br /> {item.causa_raiz}
                      </InfoCard>
                      <InfoCard className='py-2 border-0 shadow-sm'>
                        <strong>Solução:</strong>
                        <br /> {item.solucao}
                      </InfoCard>
                    </Col>
                  </Row>
                  <Row className='justify-content-around mt-3'>
                    <InfoCard className='col-md-11 py-2 border-0 shadow-sm'>
                      <strong>Feedback:</strong>
                      <br /> {item.feedback}
                    </InfoCard>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </>
      )}
    </>
  );
};

export default CardActionPlan;
