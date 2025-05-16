import { getOrdemServico } from '../../../api/apiRequests';
import {
  clearPreventiva,
  clearProgress,
  clearProgressOS,
  setAssetIdentifier,
  setCorretiveOnly,
  setLoading,
  setPreventiva,
  setProgress,
  setProgressOS,
} from '../../../redux/store/features/preventivaSlice';
import { AppDispatch } from '../../../redux/store/store';
import { iMaintenanceOrders, OS_Status, Service_Type } from '../interfaces/MaintenanceOrders';

// Função para buscar dados preventivos
export const fetchPreventive = async (asset_id: string, dispatch: AppDispatch) => {
  // Inicializa o progresso
  dispatch(clearProgress());
  dispatch(setLoading(true));
  dispatch(setProgress(10));
  dispatch(clearPreventiva());
  dispatch(setProgress(50));

  try {
    // O resto do seu código...
    Promise.allSettled([
      getOrdemServico({
        status_id: OS_Status.CLOSED,
        tipo_manutencao: Service_Type.PREVENTIVA,
        cod_ativo: asset_id,
      }),
      getOrdemServico({
        status_id: OS_Status.CLOSED,
        tipo_manutencao: Service_Type.PREVENTIVA_PONTUAL,
        cod_ativo: asset_id,
      }),
    ]).then((results) => {
      // Atualiza o progresso
      dispatch(setProgress(60));

      // Verifica se as promessas foram resolvidas com sucesso
      const [preventiva, preventivaPontual] = results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error('Error fetching data:', result.reason);
          return [];
        }
      });

      // Mantém apenas planos de inspeção e preventiva
      const filteredPreventiva = preventiva.filter((item: iMaintenanceOrders) => {
        if (!item.descricao) return false;
        return item.descricao.startsWith('PREV') || item.descricao.startsWith('PINSP');
      });

      // Atualiza o progresso
      dispatch(setProgress(70));

      // Separar preventiva(PREV) e Inspeção(PINSP)
      const preventiveData = filteredPreventiva.filter((item: iMaintenanceOrders) =>
        item.descricao.startsWith('PREV')
      );
      const inspectionData = filteredPreventiva.filter((item: iMaintenanceOrders) =>
        item.descricao.startsWith('PINSP')
      );

      // Filtrar preventiva pontual
      const filteredPreventivaPontual = preventivaPontual.filter((item: iMaintenanceOrders) => {
        if (!item.criado_por || !item.responsavel_manutencao) return false;
        return item.criado_por.includes('GUILHERMONI') || item.responsavel_manutencao.includes('GONCALVES');
      });

      // Atualiza o progresso
      dispatch(setProgress(80));

      const orderByDate = (data: iMaintenanceOrders[]) => {
        return data.sort((a, b) => {
          const dateA = new Date(a.data_conclusao);
          const dateB = new Date(b.data_conclusao);
          return dateB.getTime() - dateA.getTime();
        });
      };

      // Combina e ordena os dados
      let allData: iMaintenanceOrders[] = [...preventiveData, ...filteredPreventivaPontual];

      if (allData.length > 0) {
        allData = orderByDate(allData);
        allData.splice(5);
      }
      let inspectionDataSorted = [] as iMaintenanceOrders[];

      if (inspectionData.length > 0) {
        inspectionDataSorted = orderByDate(inspectionData);
        inspectionDataSorted.splice(5);
      }

      // Atualiza o progresso
      dispatch(setProgress(90));

      // Atualiza o estado com os dados filtrados
      dispatch(
        setPreventiva({
          preventive: allData,
          inspection: inspectionDataSorted,
          corretive: [],
        })
      );

      // Depois de processar as preventivas e inspeções
      if (allData.length > 0) {
        // Armazena apenas o identificador do ativo para uso futuro
        dispatch(
          setAssetIdentifier({
            codigo_ativo: allData[0].codigo_ativo,
            data_conclusao: allData[0].data_conclusao,
            ativo: allData[0].ativo,
          })
        );
      } else if (inspectionDataSorted.length > 0) {
        // Armazena apenas o identificador do ativo para uso futuro
        dispatch(
          setAssetIdentifier({
            codigo_ativo: inspectionDataSorted[0].codigo_ativo,
            data_conclusao: inspectionDataSorted[0].data_conclusao,
            ativo: inspectionDataSorted[0].ativo,
          })
        );
      }

      // Finaliza o processo
      dispatch(setProgress(100));
      dispatch(setLoading(false));
    });
  } catch (error) {
    console.error('Erro ao buscar dados preventivos:', error);
    dispatch(setLoading(false));
    dispatch(clearProgress());
  }
};

// Função separada para buscar dados corretivos
export const fetchServicesOrders = async (
  assetInfo: { codigo_ativo: string; data_conclusao: string },
  dispatch: AppDispatch
) => {
  dispatch(setLoading(true));
  dispatch(clearProgressOS());
  dispatch(setProgressOS(10));

  try {
    dispatch(setProgressOS(50));

    const response = await getOrdemServico({
      cod_ativo: assetInfo.codigo_ativo,
      data_criacao__gt: assetInfo.data_conclusao,
      tipo_manutencao: Service_Type.CORRETIVA,
    });

    dispatch(setProgressOS(75));

    if (response.length > 0) {
      // Processamento dos dados...
      response.sort((a: iMaintenanceOrders, b: iMaintenanceOrders) => {
        const dateA = new Date(a.data_conclusao);
        const dateB = new Date(b.data_conclusao);
        return dateB.getTime() - dateA.getTime();
      });

      // Atualiza APENAS os dados corretivos
      dispatch(setCorretiveOnly(response));
    }

    dispatch(setProgressOS(100));
    dispatch(setLoading(false));
    dispatch(clearProgressOS());
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    dispatch(setLoading(false));
    dispatch(clearProgressOS());
  }
};
