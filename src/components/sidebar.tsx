import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaTools } from 'react-icons/fa';
import { GiGears } from 'react-icons/gi';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { VscGithubAction } from 'react-icons/vsc';
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

// Interface para o mapeamento de funções (roleMap)
interface RoleMapping {
  [key: string]: string;
}

// Interface para subitens de navegação
interface NavSubItem {
  label: string;
  icon: React.ReactNode | string;
  href: string;
  hasAccess: boolean;
}

// Interface unificada para elementos de navegação
interface NavElement {
  type: 'item' | 'group';
  label: string;
  icon: React.ReactNode | string;
  href?: string; // Opcional para grupos
  hasAccess: boolean; // Agora obrigatório para todos os elementos
  items?: NavSubItem[]; // Somente para grupos
}

const Sidebar: React.FC = () => {
  /* ---------------------------------------- Gerenciamento de estado e hooks --------------------------------------- */
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
  const roleMap: RoleMapping = {
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

  /* ---------------------------------------------- Navegação Unificada ---------------------------------------------- */
  const navigation: NavElement[] = [
    // Itens de navegação individual
    {
      type: 'item',
      label: 'Login',
      icon: 'bi bi-box-arrow-in-right',
      href: '/login',
      hasAccess: location.pathname === '/login',
    },
    {
      type: 'item',
      label: 'Home',
      icon: 'bi bi-house',
      href: '/',
      hasAccess: true, // Home sempre acessível
    },
    {
      type: 'item',
      label: 'Shop Floor Management',
      icon: 'bi bi-graph-up',
      href: '/sfm',
      hasAccess: hasPageAccess('shop_floor'),
    },
    {
      type: 'item',
      label: 'Produção por hora',
      icon: 'bi bi-box-seam',
      href: '/p-live',
      hasAccess: hasPageAccess('hour_production'),
    },
    {
      type: 'item',
      label: 'Linhas do Recheio',
      icon: 'bi bi-speedometer2',
      href: '/live',
      hasAccess: hasPageAccess('live_lines'),
    },
    {
      type: 'item',
      label: userRole?.some((role) => Object.keys(roleMap).includes(role))
        ? roleMap[userRole[0]]
        : 'Supervisão',
      icon: 'bi bi-eye',
      href: '/supervision',
      hasAccess: hasPageAccess('supervision'),
    },
    {
      type: 'group',
      label: 'Gestão',
      icon: <GiGears />,
      hasAccess: true, // A visibilidade será controlada pelos itens filhos
      items: [
        {
          label: 'Dashboards',
          icon: 'bi bi-bar-chart',
          href: '/management/dashboards',
          hasAccess: hasPageAccess('management'),
        },
        {
          label: 'Produção',
          icon: 'bi bi-box',
          href: '/management/production',
          hasAccess: hasPageAccess('management'),
        },
        {
          label: 'Planos de Ação',
          icon: <VscGithubAction />,
          href: '/management/action-plan',
          hasAccess: hasPageAccess('action_plan_management'),
        },
      ],
    },
    {
      type: 'group',
      label: 'Manutenção',
      icon: <FaTools />,
      hasAccess: true, // A visibilidade será controlada pelos itens filhos
      items: [
        {
          label: 'Solicitações "Ao vivo"',
          icon: 'bi bi-file-earmark-text',
          href: '/manusis',
          hasAccess: hasPageAccess('manusis'),
        },
        {
          label: 'Preventivas',
          icon: 'bi bi-wrench-adjustable-circle',
          href: '/preventive',
          hasAccess: hasPageAccess('preventive'),
        },
      ],
    },
  ];

  /* ---------------------------------------------------------------------------------------------------------------- */
  /*                                                      LAYOUT                                                      */
  /* ---------------------------------------------------------------------------------------------------------------- */
  return (
    <>
      <aside id='sidebar' className={`${!isCollapsed ? 'expand' : ''}`}>
        {/* -------------------------------------------- Header -------------------------------------------- */}
        <section className='sidebar-header'>
          <Link to='/init' className='text-black mx-auto mt-3 logo-container d-flex justify-content-center'>
            <div className='logo-wrapper'>
              <img src={STMLogo} alt='Logo Colorido Santa Massa' className='logo-square' />
              <img src={STMLogoH} alt='Logo Colorido Santa Massa' className='logo-horizontal' />
            </div>
          </Link>
          <hr />
        </section>

        {/* ------------------------------------------- Navegação Unificada ------------------------------------------ */}
        <ul className='nav nav-pills sidebar-nav'>
          {navigation.map((navElement) => {
            // Verifica se o item tem permissão para ser exibido
            if (!navElement.hasAccess) return null;

            // Para itens simples
            if (navElement.type === 'item') {
              return (
                <li key={navElement.label} className='nav-item side-pill-h'>
                  <Link to={navElement.href || '#'} className='sidebar-link nav-link text-black'>
                    {typeof navElement.icon === 'string' ? (
                      <i className={`${navElement.icon}`}></i>
                    ) : (
                      <i>{navElement.icon}</i>
                    )}
                    <span>{navElement.label}</span>
                  </Link>
                </li>
              );
            }

            // Para grupos
            if (navElement.type === 'group') {
              // Verificar se pelo menos um item do grupo tem acesso
              const groupHasAccess = navElement.items?.some((item) => item.hasAccess) || false;

              if (!groupHasAccess) return null;

              return (
                <React.Fragment key={navElement.label}>
                  <li className='sidebar-item nav-item side-pill-h'>
                    <a
                      href='#'
                      className='sidebar-link has-dropdown collapsed nav-link text-black'
                      data-bs-toggle='collapse'
                      data-bs-target={`#${navElement.label}`}
                      aria-controls={navElement.label}
                    >
                      <i>
                        {typeof navElement.icon === 'string' ? (
                          <i className={navElement.icon}></i>
                        ) : (
                          navElement.icon
                        )}
                      </i>
                      <span>{navElement.label}</span>
                    </a>
                    <ul
                      className='sidebar-dropdown list-unstyled collapse'
                      id={navElement.label}
                      data-bs-parent='sidebar'
                    >
                      {navElement.items
                        ?.filter((item) => item.hasAccess)
                        .map((item) => (
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
                        ))}
                    </ul>
                  </li>
                </React.Fragment>
              );
            }

            return null;
          })}
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
            <img src={STMLogoPxB} alt='' width='32' height='32' className='rounded-circle me-2'></img>
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
