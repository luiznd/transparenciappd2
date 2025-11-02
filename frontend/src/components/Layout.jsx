import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout moderno e responsivo para páginas protegidas
const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Skip link para acessibilidade */}
      <a href="#conteudo" className="sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:text-black focus:rounded focus:shadow" aria-label="Pular para o conteúdo principal">Pular para conteúdo</a>
      <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-primary to-accent text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Marca "Portais Transparência" */}
            <div className="flex items-center gap-3">
              <Link to="/list" className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/15 text-white font-bold">T</span>
                <div className="leading-tight">
                  <div className="font-semibold">Portais Transparência</div>
                  <div className="text-xs opacity-80">monitoramento & envio</div>
                </div>
              </Link>
            </div>
            {/* Navegação principal */}
            <nav className="hidden md:flex items-center gap-4" aria-label="Navegação principal">
              {isAuthenticated && (
                <>
                  <Link to="/list" className="inline-flex items-center gap-1.5 text-sm hover:opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Zm2.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V6.75a.25.25 0 0 0-.25-.25H6.75Z"/></svg>
                    Lista
                  </Link>
                  <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm hover:opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a1 1 0 0 1 1 1v1.09a7.002 7.002 0 0 1 5.91 5.91H20a1 1 0 1 1 0 2h-1.09a7.002 7.002 0 0 1-5.91 5.91V21a1 1 0 1 1-2 0v-1.09a7.002 7.002 0 0 1-5.91-5.91H4a1 1 0 1 1 0-2h1.09a7.002 7.002 0 0 1 5.91-5.91V3a1 1 0 0 1 1-1Z"/></svg>
                    Admin
                  </Link>
                </>
              )}
            </nav>
            {/* Usuário e ações */}
            <div className="flex items-center gap-3">
              {/* Toggle mobile */}
              <button
                className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10"
                aria-label="Abrir menu"
                aria-expanded={mobileOpen}
                aria-controls="mobileMenu"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 1 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 1 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 1 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              </button>
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:inline text-sm text-white/90">{user?.username || user?.email || 'Usuário'}</span>
                  <button onClick={handleLogout} className="px-3 py-1.5 text-sm rounded-full bg-white/15 hover:bg-white/25 border border-white/20">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm text-white hover:opacity-90">Entrar</Link>
                  <Link to="/register" className="text-sm text-primary bg-white px-3 py-1.5 rounded-full hover:bg-white/90">Criar conta</Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Painel mobile */}
        {isAuthenticated && mobileOpen && (
          <div id="mobileMenu" className="md:hidden border-t border-white/20 bg-gradient-to-r from-primary to-accent">
            <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-4 text-white">
              <Link to="/list" className="inline-flex items-center gap-1.5 text-sm hover:opacity-90" onClick={() => setMobileOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Zm2.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V6.75a.25.25 0 0 0-.25-.25H6.75Z"/></svg>
                Lista
              </Link>
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm hover:opacity-90" onClick={() => setMobileOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a1 1 0 0 1 1 1v1.09a7.002 7.002 0 0 1 5.91 5.91H20a1 1 0 1 1 0 2h-1.09a7.002 7.002 0 0 1-5.91 5.91V21a1 1 0 1 1-2 0v-1.09a7.002 7.002 0 0 1-5.91-5.91H4a1 1 0 1 1 0-2h1.09a7.002 7.002 0 0 1 5.91-5.91V3a1 1 0 0 1 1-1Z"/></svg>
                Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="conteudo" className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {children}
      </main>
      <footer className="border-t bg-white/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs sm:text-sm text-gray-600">
          <div className="flex justify-between">
            <span>© {new Date().getFullYear()} Transparência</span>
            <span className="hidden sm:inline">Feito com React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;