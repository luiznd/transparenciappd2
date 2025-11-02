// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login_background.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    username: '',
    senha: '',
    confirmarSenha: ''
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validações básicas
    if (!formData.nome || !formData.email || !formData.username || !formData.senha) {
      setMessage('Todos os campos são obrigatórios');
      return;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      setMessage('As senhas não coincidem');
      return;
    }
    
    if (formData.senha.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    // Validação de email básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Por favor, insira um email válido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          username: formData.username,
          senha: formData.senha
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Usuário cadastrado com sucesso! Redirecionando para login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.error || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
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
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-center text-2xl font-bold mb-6 text-blue-800">Cadastro - Portal Transparência Itaú</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded text-center ${
            message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          
          <input
            type="text"
            name="username"
            placeholder="Nome de usuário"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          
          <input
            type="password"
            name="senha"
            placeholder="Senha (mínimo 6 caracteres)"
            value={formData.senha}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            disabled={isLoading}
          />
          
          <input
            type="password"
            name="confirmarSenha"
            placeholder="Confirmar senha"
            value={formData.confirmarSenha}
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
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 underline"
            disabled={isLoading}
          >
            Já tem uma conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;