import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserState } from '../redux/store/features/userSlice';
import { useAppSelector } from '../redux/store/hooks';

interface PrivateRouteProps {
  element: React.ReactElement;
  allowedGroups?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, allowedGroups }) => {
  const { groups: userGroups, isLoggedIn } = useAppSelector((state: { user: UserState }) => state.user);
  const isAuthenticated = isLoggedIn;

  const hasRequiredGroup = !allowedGroups || userGroups.some((group) => allowedGroups.includes(group));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedGroups && !hasRequiredGroup) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;
