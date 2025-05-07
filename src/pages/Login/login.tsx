import React, { useState } from 'react';
import { Button, Col, Container, FloatingLabel, Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import stmLogo from '../../assets/Logo Santa Massa.png';
import PageLayout from '../../components/pageLayout';

const LoginPage = () => {
  /* ---------------------------------------------------------------------------------------- Local State - */
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /* -------------------------------------------------------------------------------------------- Handles - */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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

  /* ------------------------------------------------------------------------------------------------------ */
  /*                                                 LAYOUT                                                 */
  /* ------------------------------------------------------------------------------------------------------ */
  return (
    <PageLayout>
      <Container className='m-auto' style={{ maxWidth: '400px' }}>
        <Col className='p-2 d-flex flex-column justify-content-center align-items-center'>
          <img className='mb-4' src={stmLogo} alt='Logo Santa Massa' width='100' />
          <h1 className='h3 fw-normal'>Por favor, faça login</h1>
        </Col>
        <Form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <Form.Group className='mb-3' controlId='formBasicUser'>
            <FloatingLabel label='Usuário' className='mb-3'>
              <Form.Control
                type='text'
                placeholder='Usuário'
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </FloatingLabel>
            <InputGroup>
              <FloatingLabel label='Senha'>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Senha'
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </FloatingLabel>
              <Button
                className='bg-white text-black border-1 border-light-grey border-start-0'
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {!showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
            <Button variant='primary' type='submit' className='mt-3 w-100' size='lg'>
              Entrar
            </Button>
          </Form.Group>
        </Form>
      </Container>
    </PageLayout>
  );
};

export default LoginPage;
