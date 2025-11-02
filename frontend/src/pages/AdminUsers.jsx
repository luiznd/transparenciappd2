import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Página de gestão de usuários (apenas visível para quem tem acesso; o backend restringe admin)
const AdminUsers = () => {
  const { user, sessionToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const [query, setQuery] = useState('');
  const [filterAprovado, setFilterAprovado] = useState('all'); // all | true | false
  const [actionLoading, setActionLoading] = useState({}); // { [userId]: boolean }
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState('nome'); // nome | email | username | role | aprovado
  const [sortDirection, setSortDirection] = useState('asc');

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const res = await axios.get('/api/users', {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setForbidden(true);
        setError('Acesso negado: esta seção requer privilégios de administrador.');
      } else {
        setError(err?.response?.data?.error || err.message || 'Erro ao buscar usuários');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (sessionToken) fetchUsers(); }, [sessionToken]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const aprovadoMatch = filterAprovado === 'all' ? true : (String(u.aprovado) === filterAprovado);
      const nome = (u.nome || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const textMatch = !q || nome.includes(q) || email.includes(q) || username.includes(q) || role.includes(q);
      return aprovadoMatch && textMatch;
    });
  }, [users, query, filterAprovado]);

  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers];
    const getVal = (u) => {
      switch (sortKey) {
        case 'email': return (u.email || '').toLowerCase();
        case 'username': return (u.username || '').toLowerCase();
        case 'role': return (u.role || '').toLowerCase();
        case 'aprovado': return u.aprovado ? 1 : 0;
        case 'nome':
        default: return (u.nome || u.name || '').toLowerCase();
      }
    };
    arr.sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDirection === 'asc' ? av - bv : bv - av;
      }
      return sortDirection === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filteredUsers, sortKey, sortDirection]);

  const totalUsers = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = useMemo(() => sortedUsers.slice(startIndex, startIndex + itemsPerPage), [sortedUsers, startIndex, itemsPerPage]);

  const toggleApprove = async (u) => {
    const id = u.id || u._id; // backend pode retornar id ou _id
    if (!id) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(`/api/users/${id}/approve`, { aprovado: !u.aprovado }, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
      });
      setUsers(prev => prev.map(x => (x.id === id || x._id === id) ? { ...x, aprovado: !u.aprovado } : x));
      showToast(!u.aprovado ? 'Usuário aprovado' : 'Aprovação revogada', 'success');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erro ao atualizar aprovação', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const updateRole = async (u, newRole) => {
    const id = u.id || u._id;
    if (!id) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axios.put(`/api/users/${id}/role`, { role: newRole }, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
      });
      setUsers(prev => prev.map(x => (x.id === id || x._id === id) ? { ...x, role: newRole } : x));
      showToast('Papel atualizado', 'success');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Erro ao atualizar papel', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Toast status */}
      {toast && (
        <div className={`p-3 rounded border text-sm ${toast.tone === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`} aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Cabeçalho e ações */}
      <div className="w-full">
        <div className="bg-white shadow-soft rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Usuários</h1>
            <p className="text-sm text-gray-600">Gerencie contas, aprovação e papéis de acesso</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="userSearch">Buscar usuários</label>
            <input
              id="userSearch"
              type="search"
              className="rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary px-2.5 py-1 text-sm"
              placeholder="Buscar por nome, e-mail ou username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label className="sr-only" htmlFor="filterAprovado">Filtrar por aprovação</label>
            <select
              id="filterAprovado"
              value={filterAprovado}
              onChange={(e) => setFilterAprovado(e.target.value)}
              className="rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 py-1 text-sm"
            >
              <option value="all">Todos</option>
              <option value="true">Aprovados</option>
              <option value="false">Pendentes</option>
            </select>
            <label className="sr-only" htmlFor="itemsPerPage">Itens por página</label>
            <div className="relative inline-block">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => { setCurrentPage(1); setItemsPerPage(parseInt(e.target.value, 10)); }}
                className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 pr-7 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <label className="sr-only" htmlFor="sortKey">Ordenar por</label>
            <div className="relative inline-block">
              <select
                id="sortKey"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 pr-7 py-1 text-sm"
              >
                <option value="nome">Nome</option>
                <option value="email">E-mail</option>
                <option value="username">Username</option>
                <option value="role">Papel</option>
                <option value="aprovado">Aprovado</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm border border-gray-300"
              title="Alternar ordem"
              aria-label="Alternar direção da ordenação"
            >
              {sortDirection === 'asc' ? 'Asc ▲' : 'Desc ▼'}
            </button>
            <button onClick={fetchUsers} className="px-4 py-1.5 rounded-full bg-primary text-white shadow hover:bg-primary/90 transition-colors" aria-label="Atualizar lista">Atualizar</button>
            <Link to="/admin" className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors">Voltar</Link>
          </div>
        </div>
      </div>

      {/* Mensagens de erro/estado */}
      {loading && (
        <div className="flex items-center mb-2 p-3 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm font-medium text-gray-700">Carregando usuários...</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded border bg-red-50 border-red-200 text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Listagem */}
      {!loading && !forbidden && (
        <div className="w-full bg-white shadow-lg rounded-xl overflow-x-auto">
          <table className="table-auto w-full border-collapse text-xs md:text-sm lg:text-base">
            <caption className="sr-only">Gerenciamento de usuários</caption>
            <thead>
              <tr className="bg-primary/15 text-primary text-left">
                <th colSpan={8} className="p-4 text-2xl font-semibold">Total de Usuários: {totalUsers}</th>
              </tr>
              <tr className="bg-primary text-white">
                <th scope="col" className="p-2 font-semibold">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(currentUsers.map(u => u.id || u._id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    checked={currentUsers.length > 0 && currentUsers.every(u => selectedIds.has(u.id || u._id))}
                  />
                </th>
                <th scope="col" className="p-2 font-semibold">Usuário</th>
                <th scope="col" className="p-2 font-semibold">E-mail</th>
                <th scope="col" className="p-2 font-semibold">Username</th>
                <th scope="col" className="p-2 font-semibold">Provedor</th>
                <th scope="col" className="p-2 font-semibold">Papel</th>
                <th scope="col" className="p-2 font-semibold">Aprovado</th>
                <th scope="col" className="p-2 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(u => {
                const id = u.id || u._id;
                const loadingRow = !!actionLoading[id];
                return (
                  <tr key={id} className={`border-b hover:bg-primary/10 ${u.aprovado ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        aria-label="Selecionar usuário"
                        checked={selectedIds.has(id)}
                        onChange={(e) => {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(id); else next.delete(id);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {u.picture ? (
                          <img src={u.picture} alt={(u.nome || u.name || 'Usuário') + ' avatar'} className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">{(u.nome || u.name || 'U').slice(0,1).toUpperCase()}</div>
                        )}
                        <div className="leading-tight">
                          <div className="font-medium text-gray-900">{u.nome || u.name || 'Usuário'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-gray-800">{u.email || '-'}</td>
                    <td className="p-2 text-gray-800">{u.username || '-'}</td>
                    <td className="p-2 text-gray-800">{u.authProvider || '-'}</td>
                    <td className="p-2">
                      <label className="sr-only" htmlFor={`role-${id}`}>Papel do usuário</label>
                      <div className="relative inline-block">
                        <select
                          id={`role-${id}`}
                          disabled={loadingRow}
                          value={u.role || 'user'}
                          onChange={(e) => updateRole(u, e.target.value)}
                          className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 pr-7 py-1 text-sm"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full border ${u.aprovado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {u.aprovado ? 'Aprovado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleApprove(u)}
                        disabled={loadingRow}
                        className={`px-4 py-1.5 rounded-full text-white shadow transition-colors ${u.aprovado ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} ${loadingRow ? 'opacity-70 cursor-not-allowed' : ''}`}
                        aria-label={u.aprovado ? 'Revogar aprovação' : 'Aprovar usuário'}
                      >
                        {u.aprovado ? 'Revogar' : 'Aprovar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-3 text-center text-gray-600">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota sobre acesso */}
      {forbidden && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-3">
          Você não possui permissão para visualizar esta página. Se precisar de acesso, contate um administrador.
        </div>
      )}

      {/* Ações em massa + paginação */}
      {!loading && !forbidden && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const ids = Array.from(selectedIds);
                if (ids.length === 0) return;
                for (const id of ids) {
                  setActionLoading(prev => ({ ...prev, [id]: true }));
                  try {
                    await axios.put(`/api/users/${id}/approve`, { aprovado: true }, {
                      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
                    });
                    setUsers(prev => prev.map(x => (x.id === id || x._id === id) ? { ...x, aprovado: true } : x));
                  } catch (err) {
                    console.error('Erro aprovando usuário', id, err);
                  } finally {
                    setActionLoading(prev => ({ ...prev, [id]: false }));
                  }
                }
                showToast('Aprovados os selecionados', 'success');
              }}
              className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Aprovar selecionados
            </button>
            <button
              onClick={async () => {
                const ids = Array.from(selectedIds);
                if (ids.length === 0) return;
                for (const id of ids) {
                  setActionLoading(prev => ({ ...prev, [id]: true }));
                  try {
                    await axios.put(`/api/users/${id}/approve`, { aprovado: false }, {
                      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
                    });
                    setUsers(prev => prev.map(x => (x.id === id || x._id === id) ? { ...x, aprovado: false } : x));
                  } catch (err) {
                    console.error('Erro revogando usuário', id, err);
                  } finally {
                    setActionLoading(prev => ({ ...prev, [id]: false }));
                  }
                }
                showToast('Revogados os selecionados', 'success');
              }}
              className="px-3 py-1 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600"
            >
              Revogar selecionados
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="navigation" aria-label="Paginação de usuários">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full border ${currentPage === i + 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'} shadow-sm text-sm`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;