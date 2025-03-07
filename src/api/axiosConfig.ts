import axios from 'axios';
import { logout } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8000', // URL do backend
  headers: {
    'Content-Type': 'application/json',
  },
});


/**
 * Interceptador de requisições para adicionar o token de acesso ao cabeçalho.
 * @param config - A configuração da requisição.
 * @returns A configuração da requisição com o token de acesso adicionado.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  /**
   * Interceptador de erros de requisição.
   * @param error - O erro da requisição.
   * @returns Uma Promise rejeitada com o erro.
   */
  (error) => {
    return Promise.reject(error);
  }
);



/**
 * Interceptador de respostas para tratar erros de autenticação.
 * @param response - A resposta da requisição.
 * @param error - O erro da requisição.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
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

    return Promise.reject(error);  
  }
);

export default api;
