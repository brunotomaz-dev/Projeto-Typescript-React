import { Route, Routes } from 'react-router-dom';
import './styles/main.scss';

import { useEffect } from 'react';
import { initAuth } from './api/auth';
import PrivateRoute from './api/PrivateRoute';
import PageLayout from './components/pageLayout';
import HomeFake from './pages/example';
import Home from './pages/Home/home';
import LiveLines from './pages/LiveLines/liveLines';
import LoginPage from './pages/Login/login';
import ManagementDashboards from './pages/Management/components/management.dashboards';
import ManagementProduction from './pages/Management/components/management.Production';
import Manusis from './pages/Manusis/Manusis';
import Preventivas from './pages/Preventivas/Preventivas';
import ProductionLive from './pages/ProductionLive/productionLive';
import ShopFloor from './pages/ShopFloor/sfm';
import SupervisionPage from './pages/Supervision/supervision';

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <PageLayout>
      <Routes>
        <Route path='init' element={<HomeFake />} />
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
  );
}

export default App;
