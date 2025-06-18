import React, { useState } from 'react';
import { Button, Card, Form, Table } from 'react-bootstrap';
import { BsCheck2, BsFillPeopleFill, BsX } from 'react-icons/bs';

import { useAbsenceMutation } from '../../../hooks/queries/useAbsenceMutation';
import { useAbsenceQuery } from '../../../hooks/queries/useAbsenceQuery';
import { useToast } from '../../../hooks/useToast';
import { iPresence, iPresenceSectors } from '../../../interfaces/Absence.interface';

// cSpell: words panificacao lideranca usuario

const PresenceTable: React.FC = () => {
  /* ------------------------------------------------- Hooks ------------------------------------------------- */
  const { updatePresence } = useAbsenceMutation('supervision');
  const { presenceData } = useAbsenceQuery('supervision');
  const { showToast, ToastDisplay } = useToast();

  /* -------------------------------------------------- Maps ------------------------------------------------- */
  // Mapeamento dos setores para exibição mais legível
  const setorMap = {
    panificacao: 'Panificação',
    forno: 'Forno',
    pasta: 'Pasta',
    recheio: 'Recheio',
    embalagem: 'Embalagem',
    lideranca: 'Liderança',
  };

  // Chaves dos setores tipadas para garantir acesso seguro
  const setorKeys: (keyof iPresenceSectors)[] = [
    'panificacao',
    'forno',
    'pasta',
    'recheio',
    'embalagem',
    'lideranca',
  ];

  // Verificar se há dados
  const hasData = presenceData && presenceData.length > 0;
  const presence = hasData ? presenceData[0] : null;

  /* ---------------------------------------- ESTADO LOCAL ---------------------------------------- */
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<iPresence | null>(null);

  /* ------------------------------------------- HANDLES ------------------------------------------ */
  // Inicializa o modo de edição com os dados atuais
  const handleEdit = () => {
    if (presence) {
      setEditData({ ...presence });
      setIsEditing(true);
    }
  };

  // Cancela a edição e restaura o estado original
  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };
  // Atualiza o estado do formulário quando um valor é alterado
  const handleChange = (key: keyof iPresenceSectors, value: string) => {
    // Garante que o valor é um número não-negativo
    const numValue = parseInt(value) || 0;
    const validValue = numValue >= 0 ? numValue : 0;

    setEditData((prev) => (prev ? { ...prev, [key]: validValue } : null));
  };

  // Salva as alterações no banco de dados
  const handleSave = async () => {
    if (!editData || !presence) return;

    // Adicionamos o recno para garantir que estamos atualizando o registro correto
    const dataToUpdate = {
      ...editData,
      recno: presence.recno,
    };

    // Enviar os dados para a API
    updatePresence(dataToUpdate, {
      onSuccess: () => {
        // Mensagem de sucesso
        showToast('Dados atualizados com sucesso!', 'success');
        // Sair do modo de edição
        handleCancel();
      },
      onError: () => {
        // Mensagem de erro
        showToast('Erro ao atualizar dados. Tente novamente.', 'danger');
      },
    });
  };

  /* ---------------------------------------------------------------------------------------------- */
  /*                                             Layout                                             */
  /* ---------------------------------------------------------------------------------------------- */
  return (
    <>
      <Card className='bg-transparent border-0 py-2 h-100'>
        <h5 className='text-center fs-5'>Presenças por Setor</h5>
        <Card className='shadow border-0 p-2 h-100'>
          {isEditing && (
            <div className='d-flex justify-content-end align-items-center mb-3'>
              <Button
                size='sm'
                variant='outline-secondary'
                className='me-2 d-inline-flex align-items-center'
                onClick={handleCancel}
              >
                <BsX className='me-1' /> Cancelar
              </Button>
              <Button
                size='sm'
                variant='success'
                className='d-inline-flex align-items-center'
                onClick={handleSave}
              >
                <BsCheck2 className='me-1' /> Salvar
              </Button>
            </div>
          )}
          <Table className='table table-striped table-hover table-responsive'>
            <thead>
              <tr>
                <th>Setor</th>
                <th className='text-center'>
                  {hasData && !isEditing ? (
                    <div className='d-flex justify-content-end gap-1 align-items-center'>
                      Presentes{' '}
                      <Button
                        size='sm'
                        variant='link'
                        onClick={handleEdit}
                        className='d-flex align-items-center'
                      >
                        <i className='me-1 bi bi-pencil-square' />
                      </Button>
                    </div>
                  ) : (
                    <span>Presentes</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {hasData && presence ? (
                setorKeys.map((key) => (
                  <tr key={key}>
                    <td>
                      <div className='d-flex align-items-center'>
                        {/* React Icons */}
                        <BsFillPeopleFill className='me-2 text-secondary' /> {setorMap[key]}
                      </div>
                    </td>
                    <td className='text-center fw-bold'>
                      {isEditing ? (
                        <Form.Control
                          type='number'
                          min='0'
                          value={editData?.[key] || 0}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className='text-center form-control-sm'
                          style={{ maxWidth: '80px', margin: '0 auto' }}
                        />
                      ) : (
                        presence[key]
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className='text-center text-muted py-3'>
                    Nenhum registro de presença encontrado.
                  </td>
                </tr>
              )}
            </tbody>
            {hasData && (
              <tfoot className='table-light'>
                <tr>
                  <td className='fw-bold'>Total</td>
                  <td className='text-center fw-bold'>
                    {isEditing
                      ? setorKeys.reduce((total, key) => total + (editData?.[key] || 0), 0)
                      : setorKeys.reduce((total, key) => total + (presence?.[key] || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </Card>
      </Card>
      <ToastDisplay />
    </>
  );
};

export default PresenceTable;
