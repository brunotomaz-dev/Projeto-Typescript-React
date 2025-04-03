import React, { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Offcanvas } from 'react-bootstrap';

interface ManagementLinePickerProps {
  onChange?: (selectedLines: number[]) => void;
  initialValue?: number[];
}

const ManagementLinePicker: React.FC<ManagementLinePickerProps> = ({
  onChange,
  initialValue,
}) => {
  /* ----------------------------------------- Constantes ----------------------------------------- */
  // Um array de linhas que é um range de 1 a 14
  const allLines = Array.from({ length: 14 }, (_, i) => i + 1);
  // Linhas da fábrica 1 (1-9)
  const factory1Lines = allLines.filter((line) => line <= 9);
  // Linhas da fábrica 2 (10-14)
  const factory2Lines = allLines.filter((line) => line >= 10);

  // Texto do botão (padrão: "Selecionar Linhas")
  const buttonLabel = 'Selecionar Linhas';

  // Título do drawer (padrão: "Selecione as Linhas")
  const drawerTitle = 'Selecione as Linhas';

  /* ----------------------------------------- Local State ---------------------------------------- */
  // Estado confirmado (usado externamente)
  const [confirmedSelection, setConfirmedSelection] = useState<number[]>(
    initialValue || [...allLines]
  );
  // Estado temporário (usado durante a edição no drawer)
  const [tempSelection, setTempSelection] = useState<number[]>(confirmedSelection);
  // Estado para controlar a exibição do drawer
  const [showDrawer, setShowDrawer] = useState(false);

  /* ------------------------------------------- Funções ------------------------------------------ */
  // Verificar se todas as linhas estão selecionadas
  const allLinesSelected = tempSelection.length === allLines.length;
  // Verificar se todas as linhas da fábrica 1 estão selecionadas
  const allFactory1Selected = factory1Lines.every((line) => tempSelection.includes(line));
  // Verificar se todas as linhas da fábrica 2 estão selecionadas
  const allFactory2Selected = factory2Lines.every((line) => tempSelection.includes(line));

  // Verificar se a linha específica está selecionada
  const isLineSelected = (line: number) => tempSelection.includes(line);

  // Alternar seleção de todas as linhas (temporário)
  const toggleAllLines = () => {
    setTempSelection(allLinesSelected ? [] : [...allLines]);
  };

  // Selecionar/desmarcar linhas da fábrica 1
  const toggleFactory1Lines = () => {
    let newSelection: number[];

    if (allFactory1Selected) {
      // Se todas as linhas da fábrica 1 já estão selecionadas, removê-las
      newSelection = tempSelection.filter((line) => !factory1Lines.includes(line));
    } else {
      // Adicionar todas as linhas da fábrica 1 e manter outras seleções
      const currentNonFactory1 = tempSelection.filter(
        (line) => !factory1Lines.includes(line)
      );
      newSelection = [...currentNonFactory1, ...factory1Lines];
    }

    setTempSelection(newSelection);
  };

  // Selecionar/desmarcar linhas da fábrica 2
  const toggleFactory2Lines = () => {
    let newSelection: number[];

    if (allFactory2Selected) {
      // Se todas as linhas da fábrica 2 já estão selecionadas, removê-las
      newSelection = tempSelection.filter((line) => !factory2Lines.includes(line));
    } else {
      // Adicionar todas as linhas da fábrica 2 e manter outras seleções
      const currentNonFactory2 = tempSelection.filter(
        (line) => !factory2Lines.includes(line)
      );
      newSelection = [...currentNonFactory2, ...factory2Lines];
    }

    setTempSelection(newSelection);
  };

  // Alternar seleção de uma linha específica
  const toggleLine = (line: number) => {
    let newSelection: number[];

    if (isLineSelected(line)) {
      // Remover a linha da seleção
      newSelection = tempSelection.filter((l) => l !== line);
    } else {
      // Adicionar a linha à seleção
      newSelection = [...tempSelection, line];
    }

    setTempSelection(newSelection);
  };

  // Função para formatar a exibição das linhas selecionadas
  const getSelectedLinesLabel = () => {
    if (confirmedSelection.length === 0) return 'Nenhuma linha';
    if (confirmedSelection.length === allLines.length) return 'Todas as linhas';
    if (confirmedSelection.length <= 3 && confirmedSelection.length > 1)
      return `Linhas: ${confirmedSelection.map((l) => `L${l}`).join(', ')}`;
    if (confirmedSelection.length === 1) return `Linha: L${confirmedSelection[0]}`;
    return `${confirmedSelection.length} linhas selecionadas`;
  };

  // Verifica se há mudanças na seleção
  const hasChanges = () => {
    if (tempSelection.length !== confirmedSelection.length) return true;
    return tempSelection.some((line) => !confirmedSelection.includes(line));
  };

  /* ------------------------------------------- Handles ------------------------------------------ */
  // Abrir o drawer
  const handleOpenDrawer = () => setShowDrawer(true);

  // Fechar o drawer
  const handleCloseDrawer = () => setShowDrawer(false);

  // Aplicar seleção e fechar o drawer
  const handleApplySelection = () => {
    // Atualizar a seleção confirmada com a seleção temporária
    setConfirmedSelection([...tempSelection]);
    // Chamar a função de callback, se fornecida
    onChange?.(tempSelection);
    // Fechar o drawer
    handleCloseDrawer();
  };

  /* ------------------------------------------- Effects ------------------------------------------ */
  // Reiniciar a seleção temporária quando o drawer é aberto
  useEffect(() => {
    if (showDrawer) {
      setTempSelection([...confirmedSelection]);
    }
  }, [showDrawer, confirmedSelection]);

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             LAYOUT                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      {/* Botão para abrir o drawer */}
      <Button
        variant='light'
        onClick={handleOpenDrawer}
        className='d-flex align-items-center text-dark'
      >
        <i className='bi bi-grid-3x3 me-2'></i>
        <span>{buttonLabel}</span>
        <span className='ms-2 badge bg-primary'>{getSelectedLinesLabel()}</span>
      </Button>

      {/* Drawer com o seletor de linhas */}
      <Offcanvas
        show={showDrawer}
        onHide={handleCloseDrawer}
        placement='end'
        className='line-picker-drawer'
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{drawerTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Grupo de botões para seleção rápida */}
          <div className='mb-4'>
            <h6 className='mb-2 fw-bold'>Seleção Rápida</h6>
            <ButtonGroup className='w-100'>
              <Button
                variant={allLinesSelected ? 'light-grey' : 'outline-secondary'}
                onClick={toggleAllLines}
                className='flex-grow-1'
              >
                <div className='d-flex align-items-center'>
                  <i
                    className={`bi ${allLinesSelected ? 'bi-check-all me-2' : 'bi-grid-3x3 me-2'}`}
                  ></i>
                  {allLinesSelected ? 'Desmarcar Todas' : 'Todas as Linhas'}
                </div>
              </Button>
              <Button
                variant={allFactory1Selected ? 'light-grey' : 'outline-secondary'}
                onClick={toggleFactory1Lines}
                className='flex-grow-1'
              >
                <div className='d-flex align-items-center'>
                  <i
                    className={`bi ${allFactory1Selected ? 'bi-check-lg me-2' : 'bi-1-square me-2'}`}
                  ></i>
                  Fábrica 1 (L1-L9)
                </div>
              </Button>
              <Button
                variant={allFactory2Selected ? 'light-grey' : 'outline-secondary'}
                onClick={toggleFactory2Lines}
                className='flex-grow-1'
              >
                <div className='d-flex align-items-center'>
                  <i
                    className={`bi ${allFactory2Selected ? 'bi-check-lg me-2' : 'bi-2-square me-2'}`}
                  ></i>
                  Fábrica 2 (L10-L14)
                </div>
              </Button>
            </ButtonGroup>
          </div>

          <div className='mb-4'>
            <h6 className='mb-2 fw-bold'>Seleção Individual de Linhas</h6>
            <div className='line-buttons-container'>
              {/* Fábrica 1 */}
              <div className='factory-section'>
                <div className='factory-label mb-2'>Fábrica 1</div>
                <div className='d-flex flex-wrap gap-2'>
                  {factory1Lines.map((line) => (
                    <Button
                      key={line}
                      variant={isLineSelected(line) ? 'light-grey' : 'outline-secondary'}
                      onClick={() => toggleLine(line)}
                      className={`line-button ${isLineSelected(line) ? 'selected' : ''}`}
                      size='lg'
                    >
                      L{line}
                    </Button>
                  ))}
                </div>
              </div>

              <hr className='my-3' />

              {/* Fábrica 2 */}
              <div className='factory-section'>
                <div className='factory-label mb-2'>Fábrica 2</div>
                <div className='d-flex flex-wrap gap-2'>
                  {factory2Lines.map((line) => (
                    <Button
                      key={line}
                      variant={isLineSelected(line) ? 'light-grey' : 'outline-secondary'}
                      onClick={() => toggleLine(line)}
                      className={`line-button ${isLineSelected(line) ? 'selected' : ''}`}
                      size='lg'
                    >
                      L{line}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 line-selection-info text-center'>
            {tempSelection.length === 0 && (
              <Alert variant='danger'>
                <i className='bi bi-exclamation-triangle me-2'></i>
                Nenhuma linha selecionada
              </Alert>
            )}
            {tempSelection.length > 0 && tempSelection.length < allLines.length && (
              <Alert variant='info'>
                <i className='bi bi-info-circle me-2'></i>
                {tempSelection.length}{' '}
                {tempSelection.length === 1 ? 'linha selecionada' : 'linhas selecionadas'}
              </Alert>
            )}
            {tempSelection.length === allLines.length && (
              <Alert variant='success'>
                <i className='bi bi-check-circle me-2'></i>
                Todas as linhas selecionadas
              </Alert>
            )}
          </div>

          <div className='d-grid gap-2 mt-4'>
            <Button
              variant='primary'
              size='lg'
              onClick={handleApplySelection}
              disabled={!hasChanges()}
            >
              {hasChanges() ? 'Aplicar Seleção' : 'Confirmar Seleção'}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default ManagementLinePicker;
