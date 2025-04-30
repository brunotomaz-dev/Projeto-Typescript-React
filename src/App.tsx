import { Route, Routes } from 'react-router-dom';
import './styles/main.scss';

import { useEffect } from 'react';
import { initAuth } from './api/auth';
import PrivateRoute from './api/PrivateRoute';
import Sidebar from './components/sidebar';
import HomeFake from './pages/example';
import Home from './pages/Home/home';
import LiveLines from './pages/LiveLines/liveLines';
import LoginPage from './pages/Login/login';
import Management from './pages/Management/management';
import Manusis from './pages/Manusis/Manusis';
import ProductionLive from './pages/ProductionLive/productionLive';
import ShopFloor from './pages/ShopFloor/sfm';
import SupervisionPage from './pages/Supervision/supervision';

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <>
      <main className='w-100 d-flex'>
        <Sidebar />
        <Routes>
          <Route path='init' element={<HomeFake />} />
          <Route path='/' element={<Home />} />
          <Route path='login' element={<LoginPage />} />
          <Route
            path='sfm'
            element={<PrivateRoute element={<ShopFloor />} requiredPage='shop_floor' />}
          />
          <Route
            path='p-live'
            element={
              <PrivateRoute element={<ProductionLive />} requiredPage='hour_production' />
            }
          />
          <Route
            path='live'
            element={<PrivateRoute element={<LiveLines />} requiredPage='live_lines' />}
          />
          <Route
            path='management'
            element={<PrivateRoute element={<Management />} requiredPage='management' />}
          />
          <Route
            path='supervision'
            element={<PrivateRoute element={<SupervisionPage />} requiredPage='supervision' />}
          />
          <Route
            path='manusis'
            element={<PrivateRoute element={<Manusis />} requiredPage='manusis' />}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
