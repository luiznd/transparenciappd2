import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Página Admin seguindo o mesmo padrão visual das demais (Layout via ProtectedRoute)
const AdminPage = () => {
  const { user } = useAuth();

  return (
    <div className="w-full space-y-4">
      {/* Cabeçalho local da página */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-soft rounded-xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Painel Administrativo</h1>
            <p className="text-sm text-gray-600">Gerencie configurações e recursos do sistema</p>
          </div>
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm text-gray-700">Logado como</span>
              <span className="text-sm font-medium text-gray-900">{user.name || user.email || 'Usuário'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-md bg-primary/15 text-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a1 1 0 0 1 1 1v1.09a7.002 7.002 0 0 1 5.91 5.91H20a1 1 0 1 1 0 2h-1.09a7.002 7.002 0 0 1-5.91 5.91V21a1 1 0 1 1-2 0v-1.09a7.002 7.002 0 0 1-5.91-5.91H4a1 1 0 1 1 0-2h1.09a7.002 7.002 0 0 1 5.91-5.91V3a1 1 0 0 1 1-1Z"/></svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Configurações</div>
              <div className="text-xs text-gray-600">Preferências globais do sistema</div>
            </div>
          </div>
          <Link to="/admin/settings" className="px-4 py-1.5 rounded-full bg-primary text-white shadow hover:bg-primary/90 text-sm inline-block">Abrir</Link>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-md bg-secondary/15 text-secondary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 9a7 7 0 0 1 14 0v1H5v-1Z"/></svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Usuários</div>
              <div className="text-xs text-gray-600">Gerenciamento de contas e acesso</div>
            </div>
          </div>
          <Link to="/admin/users" className="px-4 py-1.5 rounded-full bg-secondary text-white shadow hover:bg-secondary/90 text-sm inline-block">Abrir</Link>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.5 3.75A1.75 1.75 0 0 1 6.25 2h11.5A1.75 1.75 0 0 1 19.5 3.75v16.5a.75.75 0 0 1-1.08.67L12 17.403l-6.42 3.565a.75.75 0 0 1-1.08-.67V3.75Z"/></svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Portais</div>
              <div className="text-xs text-gray-600">Acompanhar status e editar</div>
            </div>
          </div>
          <Link to="/list" className="px-4 py-1.5 rounded-full bg-gray-200 text-gray-800 shadow hover:bg-gray-300 text-sm inline-block">Ir para lista</Link>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-sm text-gray-700">
          <p>
            Esta página segue o mesmo padrão de layout das demais e está pronta para integrar recursos administrativos.
            Caso precise restringir o acesso apenas para administradores, podemos adicionar uma verificação de papel (role) assim que a API tiver esse retorno.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;