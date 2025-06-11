import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect } from 'react';
import { DecodedToken } from '../api/auth';
import axios from '../api/axiosConfig';
import { setTokenRefreshed, setTokenRefreshing } from '../redux/store/features/userSlice';
import { useAppDispatch } from '../redux/store/hooks';

// Tempo em segundos antes da expiração para tentar renovar o token (5 minutos)
const REFRESH_THRESHOLD = 300;

export const useTokenManager = () => {
  const dispatch = useAppDispatch();

  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token || !refreshToken) {
        return false;
      }

      // Verificar se o token precisa ser renovado
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;

      // Se o token expira em menos de REFRESH_THRESHOLD segundos, renová-lo
      if (decoded.exp - currentTime < REFRESH_THRESHOLD) {
        dispatch(setTokenRefreshing(true));

        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        dispatch(setTokenRefreshed(true));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      dispatch(setTokenRefreshed(false));
      return false;
    }
  }, [dispatch]);

  // Verificar token periodicamente (a cada 4 minutos)
  useEffect(() => {
    const checkInterval = setInterval(refreshToken, 4 * 60 * 1000);

    // Executar uma verificação inicial
    refreshToken();

    return () => {
      clearInterval(checkInterval);
    };
  }, [refreshToken]);

  return { refreshToken };
};
