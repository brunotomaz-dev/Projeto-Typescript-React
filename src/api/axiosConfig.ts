// cSpell: disable
import axios from 'axios';
import { logout } from './auth';

const HOME_APP_TOKEN = import.meta.env.VITE_HOME_APP_TOKEN

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // URL do backend
  headers: {
    'Content-Type': 'application/json',
  },
});

const isHomeEndpoint = (url = '') => {
  return homeEndpoints.some(endpoint => url.includes(endpoint));
};


/**
 * Interceptador de requisições para adicionar o token de acesso ao cabeçalho.
 * @param config - A configuração da requisição.
 * @returns A configuração da requisição com o token de acesso adicionado.
 */
api.interceptors.request.use(
  (config) => {
   // Verifica se tem URL
   if (!config.url) return config;
    
   // Se for um endpoint da Home
   if (isHomeEndpoint(config.url)) {
     
     // Tenta usar o token do usuário se estiver disponível
     const userToken = localStorage.getItem('access_token');
     
     if (userToken) {
       // Se tem usuário autenticado, usa o token dele
       config.headers.Authorization = `Bearer ${userToken}`;
      } else {
       // Se não tem usuário autenticado, usa o token específico para a Home
       config.headers.Authorization = `Bearer ${HOME_APP_TOKEN}`;
     }
   } else {
     // Para outros endpoints, exige token de usuário como antes
     const token = localStorage.getItem('access_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
   }
   
   return config;
 },
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
    // Não tenta refresh token para endpoints da Home quando usados com HOME_APP_TOKEN
    if (error.config?.url && isHomeEndpoint(error.config.url) && !localStorage.getItem('access_token')) {
      return Promise.reject(error);
    }

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
