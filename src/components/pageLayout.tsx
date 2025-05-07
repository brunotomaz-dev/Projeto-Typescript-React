import React from 'react';
import { Button } from 'react-bootstrap';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { toggleCollapsed } from '../redux/store/features/sidebarSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import { RootState } from '../redux/store/store';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  /* --------------------------------------------------------------------------------------- HOOK - Redux - */
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state: RootState) => state.sidebar.isCollapsed);

  /* ----------------------------------------------- Handles ---------------------------------------------- */
  const toggleSidebar = () => {
    dispatch(toggleCollapsed());
  };

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <main className={`p-2 w-100 main-content ${isCollapsed ? 'collapsed' : ''}`}>
      <Button
        onClick={toggleSidebar}
        variant='link'
        size='lg'
        className='text-dark p-0'
        aria-label='Toggle sidebar'
      >
        {isCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
      </Button>
      {children}
    </main>
  );
};

export default PageLayout;
