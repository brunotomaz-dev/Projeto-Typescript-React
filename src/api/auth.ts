/**
 * Arquivo responsável por lidar com a autenticação do usuário.
 * Inclui funções para registro, login, logout e verificação de expiração do token.
 * Utiliza a biblioteca axios para fazer requisições HTTP e a biblioteca jwt-decode para decodificar tokens JWT.
 */

import { AxiosError, isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { clearUser, setUser } from '../redux/store/features/userSlice';
// import { useAppDispatch } from '../redux/store/hooks';
import { functionalLevelMap, sectorAccessMap } from '../hooks/usePermissions';
import { store } from '../redux/store/store';
import axios from './axiosConfig';

// const dispatch = useAppDispatch();
const dispatch = store.dispatch;

/**
 * Interface que representa um token JWT decodificado.
 * Contém o ID do usuário e a data de expiração.
 */
export interface DecodedToken {
  user_id: string;
  exp: number;
}

/**
 * Interface que representa a resposta do servidor após um login bem-sucedido.
 * Contém os tokens de acesso e refresh, além de informações do usuário.
 * @property access - Token de acesso.
 * @property refresh - Token de refresh.
 * @property first_name - Primeiro nome do usuário.
 * @property last_name - Último nome do usuário.
 * @property groups - Grupos do usuário.
 */
interface LoginResponse {
  access: string;
  refresh: string;
  first_name: string;
  last_name: string;
  groups: string[];
}

/**
 * Função para registrar um novo usuário.
 * @param username - Nome de usuário.
 * @param password - Senha.
 * @param email - Email.
 * @param firstName - Primeiro nome.
 * @param lastName - Último nome.
 */
export const register = async (
  username: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  try {
    const response = await axios.post('/api/register/', {
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

/**
 * Função para verificar se um token JWT expirou.
 * @param token - Token JWT.
 * @returns True se o token expirou, false caso contrário.
 */
export const checkTokenExpiration = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

/**
 * Função para realizar o login de um usuário.
 * @param username - Nome de usuário.
 * @param password - Senha.
 */
export const login = async (username: string, password: string): Promise<DecodedToken> => {
  try {
    // Faz a requisição para obter o token
    const response = await axios.post<LoginResponse>('/api/token/', { username, password });
    // Recebe o token e outros dados do usuário
    const { access, refresh, first_name, last_name, groups } = response.data;

    // Salva o token no localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('username', `${first_name} ${last_name}`);
    localStorage.setItem('groups', JSON.stringify(groups));

    const decoded = jwtDecode<DecodedToken>(access);

    const functionalGroups = groups.filter((g) => Object.keys(functionalLevelMap).includes(g));
    const sectorGroups = groups.filter((g) => Object.keys(sectorAccessMap).includes(g));

    dispatch(
      setUser({
        fullName: `${first_name} ${last_name}`,
        groups: groups,
        userId: decoded.user_id,
        functionalRole: functionalGroups,
        functionalLevel: Math.max(
          0,
          ...functionalGroups.map(
            (group) => functionalLevelMap[group as keyof typeof functionalLevelMap] || 0
          )
        ),
        sectors: sectorGroups,
      })
    );

    // Retorna o token decodificado
    return decoded;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const errorDetail = (axiosError.response?.data as { detail?: string })?.detail;
      throw new Error('Erro ao Logar: ' + (errorDetail || axiosError.message));
    } else {
      throw new Error('Falha ao realizar Login' + error);
    }
  }
};

/** Função para realizar o logout de um usuário. */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  localStorage.removeItem('groups');
  dispatch(clearUser());
};

/**
 * Função para inicializar a autenticação. Verifica se existe um token válido no localStorage.
 */
export const initAuth = (): boolean => {
  const token = localStorage.getItem('access_token');

  if (token && !checkTokenExpiration(token)) {
    const username = localStorage.getItem('username') || '';
    const groups = JSON.parse(localStorage.getItem('groups') || '[]') as string[];
    const decoded = jwtDecode<DecodedToken>(token);

    const functionalGroups = groups.filter((g) => Object.keys(functionalLevelMap).includes(g));
    const sectorGroups = groups.filter((g) => Object.keys(sectorAccessMap).includes(g));

    dispatch(
      setUser({
        fullName: username,
        groups,
        userId: decoded.user_id,
        functionalRole: functionalGroups,
        functionalLevel: Math.max(
          0,
          ...functionalGroups.map(
            (group) => functionalLevelMap[group as keyof typeof functionalLevelMap] || 0
          )
        ),
        sectors: sectorGroups,
      })
    );
    return true;
  } else {
    logout();
    return false;
  }
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  try {
    await axios.post('/api/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  } catch (error) {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const errorDetail = (axiosError.response?.data as { detail?: string })?.detail;
      throw new Error(errorDetail || 'Erro ao alterar senha');
    }
    throw new Error('Falha ao alterar senha');
  }
};
