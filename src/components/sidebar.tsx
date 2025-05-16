import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaTools } from 'react-icons/fa';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';
import STMLogoPxB from '../assets/Login_pxb.png';
import STMLogoH from '../assets/Logo Horizontal.png';
import STMLogo from '../assets/Logo Santa Massa.png';
import { usePermissions } from '../hooks/usePermissions';
import { SidebarState, toggleCollapsed } from '../redux/store/features/sidebarSlice';
import { UserState } from '../redux/store/features/userSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import ChangePasswordModal from './changePasswordModal';

const Sidebar: React.FC = () => {
  /* ---------------------------------------- Gerenciamento de estado --------------------------------------- */
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isCollapsed } = useAppSelector((state: { sidebar: SidebarState }) => state.sidebar);
  const {
    isLoggedIn,
    fullName: userName,
    groups: userGroups,
  } = useAppSelector((state: { user: UserState }) => state.user);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Ref para o elemento do dropdown
  const dropdownRef = useRef<HTMLAnchorElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    dispatch(toggleCollapsed());
  };

  /* -------------------------------------------- HOOK -------------------------------------------- */
  const { hasPageAccess, userRole } = usePermissions();

  /* ----------------------------------------- RolesMap ----------------------------------------- */
  const roleMap: Record<string, string> = {
    Lideres: 'Liderança',
    Supervisores: 'Supervisão',
    Gerentes: 'Gerência',
    Analistas: 'Supervisão',
    Coordenadores: 'Coordenação',
  };

  /* ------------------------------------- Gerenciamento de ciclo do app ------------------------------------ */
  useEffect(() => {
    const pills = document.querySelectorAll('.nav-link');
    pills.forEach((pill) => {
      pill.classList.remove('active');
      pill.classList.add('text-black');
    });
    const activePill = document.querySelector(`.nav-link[href='${location.pathname}']`);
    if (activePill) {
      activePill.classList.add('active');
      activePill.classList.remove('text-black');
    }
  }, [location.pathname, userGroups]);

  /* ---------------------------------------------- Nav Itens ---------------------------------------------- */
  const navItems = [
    location.pathname === '/login' && {
      label: 'Login',
      icon: 'bi bi-box-arrow-in-right',
      href: '/login',
    },
    { label: 'Home', icon: 'bi bi-house', href: '/' },
    hasPageAccess('supervision') && {
      label: userRole?.some((role) => Object.keys(roleMap).includes(role))
        ? roleMap[userRole[0]]
        : 'Supervisão',
      icon: 'bi bi-eye',
      href: '/supervision',
    },
    hasPageAccess('shop_floor') && {
      label: 'Shop Floor Management',
      icon: 'bi bi-graph-up',
      href: '/sfm',
    },
    hasPageAccess('hour_production') && {
      label: 'Produção por hora',
      icon: 'bi bi-box-seam',
      href: '/p-live',
    },
    hasPageAccess('live_lines') && {
      label: 'Linhas do Recheio',
      icon: 'bi bi-speedometer2',
      href: '/live',
    },
    hasPageAccess('management') && {
      label: 'Gestão',
      icon: 'bi bi-gear',
      href: '/management',
    },
  ];

  const manusisItems = [
    hasPageAccess('manusis') && {
      label: 'Solicitações "Ao vivo"',
      icon: 'bi bi-file-earmark-text',
      href: '/manusis',
    },
    hasPageAccess('preventive') && {
      label: 'Preventivas',
      icon: 'bi bi-wrench-adjustable-circle',
      href: '/preventive',
    },
  ];

  const hasMaintananceAccess = manusisItems.some((item) => item !== false);

  /* ------------------------------------------------ Layout ------------------------------------------------ */
  return (
    <>
      <aside id='sidebar' className={`${!isCollapsed ? 'expand' : ''}`}>
        {/* -------------------------------------------- Header -------------------------------------------- */}
        <section className='sidebar-header'>
          <Link
            to='/init'
            className='text-black mx-auto mt-3 logo-container d-flex justify-content-center'
          >
            <div className='logo-wrapper'>
              <img src={STMLogo} alt='Logo Colorido Santa Massa' className='logo-square' />
              <img src={STMLogoH} alt='Logo Colorido Santa Massa' className='logo-horizontal' />
            </div>
          </Link>
          <hr />
        </section>
        {/* ------------------------------------------- Navegação ------------------------------------------ */}
        <ul className='nav nav-pills sidebar-nav'>
          {navItems.map(
            (item) =>
              item && (
                <li key={item.label} className='nav-item side-pill-h'>
                  <Link to={item.href} className='sidebar-link nav-link text-black'>
                    {typeof item.icon === 'string' ? (
                      <i className={`${item.icon}`}></i>
                    ) : (
                      <i>{item.icon}</i>
                    )}
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
          )}
          {/* ----------------------------------------- Adicionais ----------------------------------------- */}
          {hasMaintananceAccess && (
            <>
              <hr />
              <li className='sidebar-item nav-item side-pill-h'>
                <a
                  ref={dropdownRef}
                  href='#'
                  className='sidebar-link has-dropdown collapsed nav-link text-black'
                  data-bs-toggle='collapse'
                  data-bs-target='#Manutenção'
                  aria-controls='Manutenção'
                >
                  <i>
                    <FaTools />
                  </i>
                  <span>Manutenção</span>
                </a>
                <ul
                  className='sidebar-dropdown list-unstyled collapse'
                  id='Manutenção'
                  data-bs-parent='sidebar'
                >
                  {manusisItems.map(
                    (item) =>
                      item && (
                        <li key={item.label} className='sidebar-item nav-item side-pill-h'>
                          <Link to={item.href} className='sidebar-link nav-link text-black'>
                            {typeof item.icon === 'string' ? (
                              <i className={`${item.icon}`}></i>
                            ) : (
                              <i>{item.icon}</i>
                            )}
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                  )}
                </ul>
              </li>
            </>
          )}
        </ul>

        {/* ----------------------------------------- User Dropdown ---------------------------------------- */}
        <div className='dropdown sidebar-footer'>
          <hr />
          <Link
            to='/'
            className='d-flex align-items-center text-black text-decoration-none dropdown-toggle'
            data-bs-toggle='dropdown'
            aria-expanded='false'
          >
            <img
              src={STMLogoPxB}
              alt=''
              width='32'
              height='32'
              className='rounded-circle me-2'
            ></img>
            {!isCollapsed && <strong>{userName.length > 0 ? userName : 'Entrar'}</strong>}
          </Link>
          <ul className='dropdown-menu dropdown-menu-light text-small shadow'>
            {isLoggedIn ? (
              <>
                <li>
                  <Link className='dropdown-item' to='#'>
                    Mensagens
                  </Link>
                </li>
                <li>
                  <Link
                    className='dropdown-item'
                    to='#'
                    onClick={(e) => {
                      e.preventDefault();
                      setShowChangePassword(true);
                    }}
                  >
                    Alterar a Senha
                  </Link>
                </li>
                <li>
                  <hr className='dropdown-divider'></hr>
                </li>
                <li>
                  <Link className='dropdown-item' to='/' onClick={handleLogout}>
                    Log out
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link className='dropdown-item' to='/login'>
                  Log in
                </Link>
              </li>
            )}
          </ul>
        </div>
      </aside>
      {/* Modal de Password */}
      <ChangePasswordModal show={showChangePassword} onHide={() => setShowChangePassword(false)} />
      <Button
        onClick={toggleSidebar}
        variant='link'
        size='lg'
        aria-label='Toggle sidebar'
        id='toggle-btn'
        className='shadow'
      >
        {isCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
      </Button>
    </>
  );
};

export default Sidebar;
