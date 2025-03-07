import React from 'react';
import { useAppSelector } from '../redux/store/hooks';
import { RootState } from '../redux/store/store';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const isCollapsed = useAppSelector((state: RootState) => state.sidebar.isCollapsed);

  return <main className={`p-2 w-100 main-content ${isCollapsed ? 'collapsed' : ''}`}>{children}</main>;
};

export default PageLayout;
