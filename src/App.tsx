import { Route, Routes } from 'react-router-dom';
import './styles/main.scss';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { initAuth } from './api/auth';
import PrivateRoute from './api/PrivateRoute';
import PageLayout from './components/pageLayout';
import { useTokenManager } from './hooks/useTokenManager';
import { queryClient } from './lib/react-query';
import Home from './pages/Home/home';
import LiveLines from './pages/LiveLines/liveLines';
import LoginPage from './pages/Login/login';
import ActionPlanMGMT from './pages/Management/MGMT.ActionPlan';
import ManagementDashboards from './pages/Management/MGMT.Dashboards';
import ManagementProduction from './pages/Management/MGMT.Production';
import Manusis from './pages/Manusis/Manusis';
import Preventivas from './pages/Preventivas/Preventivas';
import ProductionLive from './pages/ProductionLive/productionLive';
import ShopFloor from './pages/ShopFloor/sfm';
import SupervisionPage from './pages/Supervision/supervision';

function App() {
  // Hook para gerenciar o token de autenticação
  useTokenManager();

  // Inicializa a autenticação ao carregar o aplicativo
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PageLayout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='sfm' element={<PrivateRoute element={<ShopFloor />} requiredPage='shop_floor' />} />
          <Route
            path='p-live'
            element={<PrivateRoute element={<ProductionLive />} requiredPage='hour_production' />}
          />
          <Route path='live' element={<PrivateRoute element={<LiveLines />} requiredPage='live_lines' />} />
          <Route path='management'>
            <Route
              path='dashboards'
              element={<PrivateRoute element={<ManagementDashboards />} requiredPage='management' />}
            />
            <Route
              path='production'
              element={<PrivateRoute element={<ManagementProduction />} requiredPage='management' />}
            />
            <Route
              path='action-plan'
              element={<PrivateRoute element={<ActionPlanMGMT />} requiredPage='action_plan_management' />}
            />
          </Route>
          <Route
            path='supervision'
            element={<PrivateRoute element={<SupervisionPage />} requiredPage='supervision' />}
          />
          <Route path='manusis' element={<PrivateRoute element={<Manusis />} requiredPage='manusis' />} />
          <Route
            path='preventive'
            element={<PrivateRoute element={<Preventivas />} requiredPage='preventive' />}
          />
        </Routes>
      </PageLayout>
    </QueryClientProvider>
  );
}

export default App;
