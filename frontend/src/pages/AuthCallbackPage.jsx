import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Opcional: validar sessão ou buscar usuário logado
        await axios.get('/api/auth/user');
        navigate('/list');
      } catch (e) {
        navigate('/login');
      }
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">Concluindo autenticação...</div>
    </div>
  );
};

export default AuthCallbackPage;