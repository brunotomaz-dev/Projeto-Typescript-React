import React from 'react';
import Sidebar from './sidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <main className='wrapper'>
      <Sidebar />
      <section className='main p-3'>{children}</section>
    </main>
  );
};

export default PageLayout;
