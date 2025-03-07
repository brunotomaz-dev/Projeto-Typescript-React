import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import stmLogo from '../../assets/Logo Santa Massa.png';
import PageLayout from '../../components/pageLayout';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Tenta logar
      await login(username, password);
      // Vai para a pagina inicial
      navigate('/');
      // window.location.reload();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Login failed');
      }
    }
  };

  return (
    <PageLayout>
      <section className='form-signin m-auto w-25'>
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <img className='mb-4' src={stmLogo} alt='Logo Santa Massa' width='72' />
          <h1 className='h3 mb-3 fw-normal'>Por favor, faça login</h1>
          <div className='form-floating mb-2'>
            <input
              type='text'
              className='form-control'
              id='floatingInput'
              placeholder='Usuário'
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <label htmlFor='floatingInput'>Usuário</label>
          </div>
          <div className='form-floating mb-2'>
            <input
              type='password'
              className='form-control'
              id='floatingPassword'
              placeholder='Senha'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <label htmlFor='floatingPassword'>Senha</label>
          </div>
          <button className='w-100 btn btn-lg btn-primary' type='submit'>
            Entrar
          </button>
        </form>
      </section>
    </PageLayout>
  );
};

export default LoginPage;
