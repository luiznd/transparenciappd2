// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login_background.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    senha: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!formData.username || !formData.senha) {
      setMessage('Username e senha são obrigatórios');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          senha: formData.senha
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage('Login realizado com sucesso!');
        setTimeout(() => {
          navigate('/list');
        }, 1000);
      } else {
        setMessage(data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h2 className="text-center text-2xl font-bold mb-6 text-blue-800">Portal Transparência Itaú</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded text-center ${
            message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          <input
            type="password"
            name="senha"
            placeholder="Password"
            value={formData.senha}
            onChange={handleInputChange}
            className="w-full mb-6 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded transition duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isLoading ? 'Entrando...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 underline"
            disabled={isLoading}
          >
            Não tem uma conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
