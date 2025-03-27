import React from 'react';
import { Navigate } from 'react-router-dom';
import { PermissionPage, usePermissions } from '../hooks/usePermissions';
import { UserState } from '../redux/store/features/userSlice';
import { useAppSelector } from '../redux/store/hooks';

interface PrivateRouteProps {
  element: React.ReactElement;
  requiredPage?: PermissionPage;
  requiredLevel?: number;
  requiredMinLevel?: number;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  element,
  requiredPage,
  requiredLevel,
  requiredMinLevel,
}) => {
  // Estado de autenticação do usuário
  const { isLoggedIn } = useAppSelector((state: { user: UserState }) => state.user);

  // Permissões do usuário
  const { hasPageAccess, hasMinLevel, hasLevel, isSuperUser } = usePermissions();

  // Verificar se está autenticado
  if (!isLoggedIn) {
    return <Navigate to='/login' replace />;
  }

  // Super usuário tem acesso a tudo
  if (isSuperUser) {
    return element;
  }

  // Verificar nível mínimo requerido
  if (requiredMinLevel !== undefined && !hasMinLevel(requiredMinLevel)) {
    return <Navigate to='/' replace />;
  }

  // Verificar nível específico requerido
  if (requiredLevel !== undefined && !hasLevel(requiredLevel)) {
    return <Navigate to='/' replace />;
  }

  // Verificar permissão de página específica
  if (requiredPage && !hasPageAccess(requiredPage)) {
    return <Navigate to='/' replace />;
  }

  // Se passou por todas as verificações, permite o acesso
  return element;
};

export default PrivateRoute;
