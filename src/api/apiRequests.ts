//cSpell: words movimentacao absenteismo conclusao maquinaihm
import { format, startOfDay } from 'date-fns';
import { iPresence } from '../interfaces/Absence.interface';
import { iActionPlan } from '../interfaces/ActionPlan.interface';
import { iCartCount } from '../interfaces/Carrinhos.interface';
import { iMaquinaIHM } from '../pages/LiveLines/interfaces/maquinaIhm.interface';
import { iAbsenceForm } from '../pages/Supervision/interface/AbsenceForm.interface';
import api from './axiosConfig';
type DateParam = string | string[];

interface iParams {
  data: DateParam;
  turno?: string;
  maquina_id?: string | string[];
  status?: string;
}

interface iBaseParams {
  [key: string]: any;
}

const createDateFilter = (data: DateParam) => {
  if (Array.isArray(data)) {
    return data.length > 1
      ? { data_registro__gte: data[0], data_registro__lte: data[1] }
      : { data_registro__gte: data[0] };
  }
  return { data_registro: data };
};

export const getIndicator = async (
  indicator: string,
  data: DateParam,
  fields?: string[]
) => {
  // Cria o filtro de data
  const dateFilter = createDateFilter(data);
  // Define os parâmetros caso a data possua 2 valores
  const params = { ...dateFilter, ...(fields && { fields: fields.join(',') }) };

  try {
    const response = await api.get(`api/${indicator}/`, { params: params });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar dados de ${indicator}`, error);
    throw error;
  }
};

export const getProduction = async (data: DateParam, fields?: string[]) => {
  // Cria o filtro de data
  const dateFilter = createDateFilter(data);
  // Define os parâmetros caso a data possua 2 valores
  const params = { ...dateFilter, ...(fields && { fields: fields.join(',') }) };

  try {
    const response = await api.get('api/qual_prod/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de produção', error);
    throw error;
  }
};

export const getInfoIHM = async <
  T extends DateParam | (iBaseParams & { data: DateParam }),
>(
  baseParams: T,
  fields?: string[]
) => {
  // Verifica se é apenas a data ou se possui outros parâmetros
  const isDateOnly =
    typeof baseParams === 'string' || Array.isArray(baseParams);

  // Cria os parâmetros
  const params = {
    ...(isDateOnly
      ? createDateFilter(baseParams as DateParam)
      : {
          ...createDateFilter((baseParams as iBaseParams).data),
          ...Object.entries(baseParams as iBaseParams)
            .filter(([key]) => key !== 'data')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        }),
    ...(fields && { fields: fields.join(',') }),
  };

  try {
    const response = await api.get('api/info_ihm/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de máquina', error);
    throw error;
  }
};

export const getMaquinaInfo = async (
  { data, turno, maquina_id, status }: iParams,
  fields?: string[]
) => {
  // Cria o filtro de data
  const dateFilter = createDateFilter(data);
  // Define os parâmetros caso a data possua 2 valores
  const params = {
    ...dateFilter,
    ...(maquina_id && { maquina_id }),
    ...(turno && { turno }),
    ...(status && { status }),
    ...(fields && { fields: fields.join(',') }),
  };

  try {
    const response = await api.get('api/maquinainfo/', { params: params }); // cSpell: disable-line
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de máquina', error);
    throw error;
  }
};

export const getEstoqueAtual = async () => {
  try {
    const response = await api.get('api/caixas_cf/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de estoque', error);
    throw error;
  }
};

export const getEstoqueMovimentacao = async () => {
  try {
    const response = await api.get('api/productionByDay/');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de movimentação de estoque', error);
    throw error;
  }
};

export const getCarrinhosCount = async (
  data_inicial: string,
  data_final: string
) => {
  try {
    const period = `${data_inicial},${data_final}`;
    const response = await api.get('api/cart_count/', {
      params: { period },
    });
    if (response.status === 200 && response.data.results) {
      return response.data.results as iCartCount[];
    }
    throw new Error('Não foram encontrados dados para a data selecionada');
  } catch (error) {
    console.error('Erro ao buscar contagem de carrinhos', error);
    throw error;
  }
};

export const getHourProduction = async (data: string) => {
  try {
    const response = await api.get('api/maq_info_hour_prod/', {
      params: { data_registro: data },
    });

    // Verifica se a resposta foi bem sucedida e tem dados
    if (response.status === 200 && response.data) {
      return response.data;
    }

    throw new Error('Não há dados para a data selecionada');
  } catch (error: any) {
    // Verifica se é um erro de API com status 500
    if (error.response?.status === 500) {
      throw new Error('Não há dados para a data selecionada');
    }

    // Para outros erros, mantém a mensagem original
    console.error('Erro ao buscar produção por hora:', error);
    throw new Error('Erro ao buscar dados de produção');
  }
};

export const getAbsenceData = async (data: DateParam) => {
  const params = { data_occ: data };

  try {
    const response = await api.get('api/absenteismo/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de ausência', error);
    throw error;
  }
};

export const getAbsenceNames = async (nome: string, fields?: string[]) => {
  try {
    const response = await api.get('api/absenteismo/', {
      params: { nome: nome, ...(fields && { fields: fields.join(',') }) },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar nomes de ausência', error);
    throw error;
  }
};

export const createAbsenceData = async (formData: iAbsenceForm) => {
  try {
    const response = await api.post('api/absenteismo/', {
      ...formData,
      data_registro: format(startOfDay(new Date()), 'yyyy-MM-dd'),
      hora_registro: new Date().toLocaleTimeString(),
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar registro de ausência', error);
    throw error;
  }
};

export const deleteAbsenceData = async (recno: number) => {
  try {
    const response = await api.delete(`/api/absenteismo/${recno}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir registro de ausência:', error);
    throw error;
  }
};

export const getPresenceData = async (data: DateParam) => {
  const dateFilter = createDateFilter(data);
  const params = { ...dateFilter };

  try {
    const response = await api.get('api/presence_log/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de presença', error);
    throw error;
  }
};

export const createPresenceData = async (data: iPresence) => {
  try {
    const response = await api.post('api/presence_log/', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar registro de presença', error);
    throw error;
  }
};

export const updatePresenceData = async (data: iPresence) => {
  try {
    const response = await api.put(`api/presence_log/${data.recno}/`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar registro de presença', error);
    throw error;
  }
};

export const getActionPlan = async (data: DateParam, conclusao?: number) => {
  const dateFilter = createDateFilter(data);
  const params = { ...dateFilter, ...(conclusao !== undefined && { conclusao }) };

  console.log('params', params, conclusao);

  try {
    const response = await api.get('api/action_plan/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de plano de ação', error);
    throw error;
  }
};

// Criar plano de ação
export const createActionPlan = async (
  actionPlanData: Omit<iActionPlan, 'recno'>
) => {
  console.log(actionPlanData);
  try {
    const response = await api.post('/api/action_plan/', actionPlanData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar plano de ação:', error);
    throw error;
  }
};

// Atualizar plano de ação
export const updateActionPlan = async (actionPlanData: iActionPlan) => {
  try {
    const response = await api.put(
      `/api/action_plan/${actionPlanData.recno}/`,
      actionPlanData
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar plano de ação:', error);
    throw error;
  }
};

// Excluir plano de ação
export const deleteActionPlan = async (recno: number) => {
  try {
    const response = await api.delete(`/api/action_plan/${recno}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir plano de ação:', error);
    throw error;
  }
};

export const getMaquinaIHM = async <
  T extends DateParam | (iBaseParams & { data: DateParam }),
>(
  baseParams: T,
  fields?: string[]
) => {
  // Verifica se é apenas a data ou se possui outros parâmetros
  const isDateOnly =
    typeof baseParams === 'string' || Array.isArray(baseParams);

  // Cria os parâmetros
  const params = {
    ...(isDateOnly
      ? createDateFilter(baseParams as DateParam)
      : {
          ...createDateFilter((baseParams as iBaseParams).data),
          ...Object.entries(baseParams as iBaseParams)
            .filter(([key]) => key !== 'data')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        }),
    ...(fields && { fields: fields.join(',') }),
  };

  try {
    const response = await api.get('api/maquinaihm/', { params: params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados de máquina IHM', error);
    throw error;
  }
};

export const updateMaquinaIHM = async (data: iMaquinaIHM) => {
  try {
    const response = await api.put(`api/maquinaihm/${data.recno}/`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar registro de máquina IHM', error);
    throw error;
  }
};

export const insertMaquinaIHM = async (data: iMaquinaIHM) => {
  try {
    const response = await api.post('api/maquinaihm/', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao inserir registro de máquina IHM', error);
    throw error;
  }
};

export const deleteMaquinaIHM = async (recno: number) => {
  try {
    const response = await api.delete(`api/maquinaihm/${recno}/`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir registro de máquina IHM', error);
    throw error;
  }
};

export const updateHistoricalAppointmentRecord = async (data: iMaquinaIHM) => {
  try {
    // Apenas os campos editáveis são enviados para a API
    const editableFields = {
      recno: data.recno,
      motivo: data.motivo,
      equipamento: data.equipamento,
      problema: data.problema,
      causa: data.causa,
      os_numero: data.os_numero,
      afeta_eff: data.afeta_eff,
    };

    // Enviar apenas os campos editáveis
    const response = await api.patch(
      `api/info_ihm/${data.recno}/`,
      editableFields
    );

    // Atualiza os indicadores
    await api.post('/api/reprocess_indicators/', {
      data_registro: data.data_registro,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar registro histórico:', error);
    throw error;
  }
};
