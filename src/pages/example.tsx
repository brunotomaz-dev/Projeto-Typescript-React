import React from 'react';
import { increment } from '../redux/store/features/homeSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/hooks';
import { RootState } from '../redux/store/store';

const HomeFake: React.FC = () => {
  // Criar um contador simples com um botão de incremento e usando o state do store do Redux
  const dispatch = useAppDispatch();
  const storeCount = useAppSelector((state: RootState) => state.home.count);
  const isCollapsed = useAppSelector((state: RootState) => state.sidebar.isCollapsed);

  const incrementCount = () => {
    dispatch(increment());
  };

  return (
    <>
      <main className={`p-2 w-100 main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <h1>Count Page</h1>
        <p>Store Count: {storeCount}</p>
        <button onClick={incrementCount}>Increment</button>
      </main>
    </>
  );
};

export default HomeFake;
