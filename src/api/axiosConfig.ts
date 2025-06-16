// cSpell: disable
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { logout } from './auth';

const HOME_APP_TOKEN = import.meta.env.VITE_HOME_APP_TOKEN;

// Lista de endpoints usados na página Home
const homeEndpoints = [
  'api/eficiencia/',
  'api/performance/',
  'api/repair/',
  'api/absenteismo/',
  'api/presence/',
  'api/caixas_cf/',
  'api/cart_count/',
  'api/maquinainfo/',
  'api/qual_prod/',
  // Adicione outros endpoints usados pelo componente Home
];

// Interface para o token decodificado
interface DecodedToken {
  user_id: string;
  exp: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // URL do backend
  headers: {
    'Content-Type': 'application/json',
  },
});

const isHomeEndpoint = (url = '') => {
  return homeEndpoints.some((endpoint) => url.includes(endpoint));
};

// Função para verificar se um token está próximo de expirar (menos de 5 minutos)
const isTokenAlmostExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < 300; // 5 minutos em segundos
  } catch {
    return true;
  }
};

// Função para renovar o token
const renewToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;
    localStorage.setItem('access_token', access);
    return access;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  }
};

/**
 * Interceptador de requisições para adicionar o token de acesso ao cabeçalho.
 * Também verifica proativamente se o token está próximo de expirar.
 */
api.interceptors.request.use(
  async (config) => {
    // Verifica se tem URL
    if (!config.url) return config;

    // Se for um endpoint da Home
    if (isHomeEndpoint(config.url)) {
      // Tenta usar o token do usuário se estiver disponível
      const userToken = localStorage.getItem('access_token');

      if (userToken) {
        // Verificar se o token está próximo de expirar
        if (isTokenAlmostExpired(userToken)) {
          // Tentar renovar o token silenciosamente
          const newToken = await renewToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            // Se não conseguiu renovar e é usuário logado, usa o token antigo
            config.headers.Authorization = `Bearer ${userToken}`;
          }
        } else {
          // Token ainda válido
          config.headers.Authorization = `Bearer ${userToken}`;
        }
      } else {
        // Se não tem usuário autenticado, usa o token específico para a Home
        config.headers.Authorization = `Bearer ${HOME_APP_TOKEN}`;
      }
    } else {
      // Para outros endpoints, exige token de usuário
      const token = localStorage.getItem('access_token');
      if (token) {
        // Verificar se o token está próximo de expirar
        if (isTokenAlmostExpired(token)) {
          // Tentar renovar o token silenciosamente
          const newToken = await renewToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          } else {
            // Se não conseguiu renovar, usa o token antigo
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else {
          // Token ainda válido
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// O interceptor de resposta modificado para tratar erros 401 e 403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Não tenta refresh token para endpoints da Home quando usados com HOME_APP_TOKEN
    if (error.config?.url && isHomeEndpoint(error.config.url) && !localStorage.getItem('access_token')) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Se o erro for 401 (Não Autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('Não há refresh token disponível');
        }

        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Atualiza o token na requisição original e tenta novamente
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, faz logout
        logout();
        return Promise.reject(refreshError);
      }
    }

    // Se o erro for 403 (Proibido)
    if (error.response?.status === 403) {
      console.warn('Acesso proibido:', error.config.url);

      // Verifica se o erro é devido à expiração ou invalidação do token
      const errorMessage = error.response.data?.detail || '';
      if (
        errorMessage.includes('token') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('credential')
      ) {
        try {
          // Tentar renovar o token em caso de erro que sugere problema de autenticação
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('Não há refresh token disponível');
          }

          const response = await axios.post('http://localhost:8000/api/token/refresh/', {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Atualiza o token na requisição original e tenta novamente
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Se o refresh falhar, faz logout
          logout();
          return Promise.reject(refreshError);
        }
      }

      // Se o 403 for por questões de permissão (não problema do token)
      // Apenas propaga o erro para que a aplicação possa lidar com ele
      // e possivelmente mostrar uma mensagem de "Sem permissão"
    }

    return Promise.reject(error);
  }
);

export default api;
