import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import './LoginPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    username: '',
    senha: '',
    confirmSenha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (!formData.nome || !formData.email || !formData.username || !formData.senha) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando dados de registro:', {
        nome: formData.nome,
        email: formData.email,
        username: formData.username,
        senha: '******' // Não logamos a senha real
      });
      
      const response = await axios.post('/api/auth/register', {
        nome: formData.nome,
        email: formData.email,
        username: formData.username,
        senha: formData.senha
      });
      
      console.log('Registro bem-sucedido:', response.data);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      console.error('Detalhes do erro:', error.response?.data);
      
      // Mensagens de erro mais específicas
      if (error.response) {
        if (error.response.data?.message) {
          setError(error.response.data.message);
        } else if (error.response.status === 400) {
          setError('Email ou nome de usuário já cadastrado');
        } else if (error.response.status === 500) {
          setError('Erro no servidor. Tente novamente mais tarde.');
        } else {
          setError('Erro ao criar conta');
        }
      } else {
        setError('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/list');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Criar Conta</h1>
          <p>Preencha os dados para criar sua conta</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu nome de usuário"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmSenha"
              name="confirmSenha"
              value={formData.confirmSenha}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="divider">
          <span>ou</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-button"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <div className="login-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className="register-link">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;