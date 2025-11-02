import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('sessionToken'));

  // Compatível com CRA (process.env.REACT_APP_API_URL) e Vite (import.meta.env.VITE_API_URL)
  const API_BASE_URL = (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : null) ||
    '/api'
  );

  // Configurar axios para incluir o token de sessão em todas as requisições
  useEffect(() => {
    if (sessionToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [sessionToken]);

  // Verificar se o usuário está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      if (sessionToken) {
        try {
          // Buscar o usuário completo (inclui role/aprovado) para suportar gating no frontend
          await getCurrentUser();
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [sessionToken, API_BASE_URL]);

  // Registro de novo usuário
  const register = async (userData) => {
    try {
      console.log('Enviando dados:', JSON.stringify(userData));
      // Usando a rota correta conforme configurado no backend
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { token } = response.data;
      // Garantir que o usuário do contexto tenha todos os campos (role/aprovado)
      setSessionToken(token);
      localStorage.setItem('sessionToken', token);
      // Evitar condição de corrida com axios.defaults: enviar Authorization explicitamente
      await getCurrentUser(token);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erro ao criar conta';
      throw new Error(errorMessage);
    }
  };

  // Login tradicional
  const login = async (username, senha) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        senha
      });
      const { token } = response.data;
      // Salvar token e carregar dados completos do usuário (inclui role)
      setSessionToken(token);
      localStorage.setItem('sessionToken', token);
      // Evitar condição de corrida com axios.defaults: enviar Authorization explicitamente
      await getCurrentUser(token);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      // Obter URL de autenticação do Google
      const authUrlResponse = await axios.get(`${API_BASE_URL}/auth/google`);
      const authUrl = authUrlResponse.data.auth_url;
      
      // Redirecionar para o Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao conectar com Google';
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (sessionToken) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setSessionToken(null);
      setUser(null);
      localStorage.removeItem('sessionToken');
    }
  };

  // Obter URL de autenticação do Google (mantido para compatibilidade)
  const getGoogleAuthUrl = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/google`);
      return response.data.auth_url;
    } catch (error) {
      console.error('Erro ao obter URL de autenticação do Google:', error);
      throw error;
    }
  };

  // Validar token de sessão
  const validateToken = async (token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/validate`, {
        token: token || sessionToken
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      throw error;
    }
  };

  // Obter informações do usuário atual
  const getCurrentUser = async (tokenOverride) => {
    try {
      const tok = tokenOverride || sessionToken;
      if (!tok) {
        throw new Error('Token de sessão ausente ao obter usuário atual');
      }
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      setUser(response.data.user || response.data);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      logout();
      throw error;
    }
  };

  const value = {
    user,
    sessionToken,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    getGoogleAuthUrl,
    validateToken,
    getCurrentUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};