import { Route, Routes } from 'react-router-dom';
import './styles/main.scss';

import { useEffect } from 'react';
import { initAuth } from './api/auth';
import PrivateRoute from './api/PrivateRoute';
import Sidebar from './components/sidebar';
import { groupLevels } from './helpers/constants';
import HomeFake from './pages/example';
import Home from './pages/Home/home';
import LiveLines from './pages/LiveLines/liveLines';
import LoginPage from './pages/Login/login';
import Management from './pages/Management/management';
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
          <Route path='/' element={<Home />} />
          <Route path='login' element={<LoginPage />} />
          <Route
            path='sfm'
            element={
              <PrivateRoute
                element={<ShopFloor />}
                allowedGroups={[...groupLevels[10]]}
              />
            }
          />
          <Route
            path='p-live'
            element={
              <PrivateRoute
                element={<ProductionLive />}
                allowedGroups={[...groupLevels[9]]}
              />
            }
          />
          <Route
            path='live'
            element={
              <PrivateRoute
                element={<LiveLines />}
                allowedGroups={[...groupLevels[10]]}
              />
            }
          />
          <Route
            path='management'
            element={
              <PrivateRoute
                element={<Management />}
                allowedGroups={[...groupLevels[9]]}
              />
            }
          />
          <Route path='init' element={<HomeFake />} />
          <Route
            path='supervision'
            element={
              <PrivateRoute
                element={<SupervisionPage />}
                allowedGroups={[...groupLevels[4]]}
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
