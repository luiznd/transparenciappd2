// src/pages/ListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/fechar o menu
  const [portals, setPortals] = useState([]); // Dados da API
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [error, setError] = useState(null); // Estado de erro
  
  // Exibir o status exatamente como na planilha; cor verde para "OK" e "Sem novos dados"
  const getStatusMeta = (status) => {
    const raw = String(status || '').trim();
    const sUpper = raw.toUpperCase();
    if (sUpper === 'OK' || sUpper === 'SEM NOVOS DADOS') {
      return { label: raw || 'OK', badgeClass: 'bg-green-100 text-green-800', rowBg: 'bg-green-50' };
    }
    return { label: raw || '—', badgeClass: 'bg-red-100 text-red-800', rowBg: 'bg-red-50' };
  };

  // Definição de todas as colunas disponíveis com rótulos e renderização
  const allColumns = [
    { key: 'portal', label: 'Portal', render: (p) => p.portal },
    { key: 'esfera', label: 'Esfera', render: (p) => p.esfera },
    { key: 'mesAnoEnvio', label: 'Mês/Ano Envio', render: (p) => p.mesAnoEnvio },
    { key: 'mesAnoReferencia', label: 'Mês/Ano Referência', render: (p) => p.mesAnoReferencia },
    { key: 'volumeFonte', label: 'Volume Fonte', render: (p) => p.volumeFonte },
    { key: 'volumetriaDados', label: 'Volumetria Dados', render: (p) => p.volumetriaDados },
    { key: 'volumetriaServicos', label: 'Volumetria Serviços', render: (p) => p.volumetriaServicos },
    { key: 'indiceDados', label: 'Índice Dados', render: (p) => p.indiceDados },
    { key: 'indiceServicos', label: 'Índice Serviços', render: (p) => p.indiceServicos },
    { key: 'volumeCpfsUnicosDados', label: 'Volume CPFs Únicos (Dados)', render: (p) => p.volumeCpfsUnicosDados },
    { key: 'volumeCpfsUnicosServicos', label: 'Volume CPFs Únicos (Serviços)', render: (p) => p.volumeCpfsUnicosServicos },
    { key: 'mediaMovelCpfsUnicos', label: 'Média Móvel CPFs Únicos', render: (p) => p.mediaMovelCpfsUnicos },
    { key: 'ultimoMesEnviado', label: 'Último Mês Enviado', render: (p) => p.ultimoMesEnviado },
    { key: 'ultimaReferencia', label: 'Última Referência', render: (p) => p.ultimaReferencia },
    { key: 'ultimaVolumetriaEnviada', label: 'Última Volumetria Enviada', render: (p) => p.ultimaVolumetriaEnviada },
    { key: 'mediaMovelUltimos12Meses', label: 'Média Móvel (Últimos 12 Meses)', render: (p) => p.mediaMovelUltimos12Meses },
    { key: 'media', label: 'Média', render: (p) => p.media },
    { key: 'minimo', label: 'Mínimo', render: (p) => p.minimo },
    { key: 'mesCompetenciaMinimo', label: 'Mês Competência Mínimo', render: (p) => p.mesCompetenciaMinimo },
    { key: 'maximo', label: 'Máximo', render: (p) => p.maximo },
    { key: 'mesCompetenciaMaximo', label: 'Mês Competência Máximo', render: (p) => p.mesCompetenciaMaximo },
    { key: 'percentualVolumetriaUltima', label: '% Volumetria vs Última', render: (p) => p.percentualVolumetriaUltima != null ? `${p.percentualVolumetriaUltima}%` : '' },
    { key: 'percentualVolumetriaMediaMovel', label: '% Volumetria vs Média Móvel', render: (p) => p.percentualVolumetriaMediaMovel != null ? `${p.percentualVolumetriaMediaMovel}%` : '' },
    { key: 'percentualVolumetriaMedia', label: '% Volumetria vs Média', render: (p) => p.percentualVolumetriaMedia != null ? `${p.percentualVolumetriaMedia}%` : '' },
    { key: 'percentualVolumetriaMinimo', label: '% Volumetria vs Mínimo', render: (p) => p.percentualVolumetriaMinimo != null ? `${p.percentualVolumetriaMinimo}%` : '' },
    { key: 'percentualVolumetriaMaximo', label: '% Volumetria vs Máximo', render: (p) => p.percentualVolumetriaMaximo != null ? `${p.percentualVolumetriaMaximo}%` : '' },
    { key: 'pulouCompetencia', label: 'Pulou Competência?', render: (p) => (p.pulouCompetencia ? 'Sim' : 'Não') },
    { key: 'defasagemNosDados', label: 'Defasagem nos Dados?', render: (p) => (p.defasagemNosDados ? 'Sim' : 'Não') },
    { key: 'novosDados', label: 'Novos Dados?', render: (p) => (p.novosDados ? 'Sim' : 'Não') },
    { key: 'status', label: 'Status', render: (p) => { const meta = getStatusMeta(p.status); return (<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${meta.badgeClass}`}>{meta.label}</span>); } },
    { key: 'observacaoTimeDados', label: 'Observação Time Dados', render: (p) => p.observacaoTimeDados },
    { key: 'enviar', label: 'Enviar?', render: (p) => (p.enviar ? 'Sim' : 'Não') },
  ];

  // Seleção dinâmica de colunas com persistência em localStorage
  const [selectedColumns, setSelectedColumns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('list_selected_columns'));
      if (Array.isArray(saved) && saved.length) {
        const allowed = new Set(allColumns.map(c => c.key));
        return saved.filter(k => allowed.has(k));
      }
    } catch {}
    return allColumns.map(c => c.key);
  });
  const selectedCols = React.useMemo(() => allColumns.filter(c => selectedColumns.includes(c.key)), [selectedColumns]);
  useEffect(() => {
    try { localStorage.setItem('list_selected_columns', JSON.stringify(selectedColumns)); } catch {}
  }, [selectedColumns]);


  // Função para buscar dados da API
  const fetchApiData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar proxy do Nginx/React para compatibilidade em produção e dev
      const response = await axios.get('/api/portals');
      setPortals(response.data || []);
    } catch (err) {
      setError('Erro ao carregar dados da API: ' + err.message);
      console.error('Erro ao buscar dados da API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados da API na montagem (sem toggle)
  useEffect(() => {
    fetchApiData();
  }, []);

  // Normalizar data de entrega para formato dd/MM/yyyy
  const normalizeEntrega = (val) => {
    const s = String(val || '').trim();
    if (!s) return '';
    let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // dd/MM/yyyy
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    m = s.match(/^(\d{2})\/(\d{4})$/); // MM/yyyy -> usa dia 10
    if (m) return `10/${m[1]}/${m[2]}`;
    m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/); // dd-MM-yyyy -> converte para /
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    return s;
  };
  const getEntregaForPortal = (p) => normalizeEntrega(p.dataEntrega || p.referencia);
  // Abas dinâmicas baseadas em data de entrega normalizada
  const abaNames = React.useMemo(() => {
    const refs = Array.from(new Set((portals || []).map(p => getEntregaForPortal(p)).filter(Boolean)));
    refs.sort((a, b) => b.localeCompare(a));
    return refs;
  }, [portals]);
  const [selectedAba, setSelectedAba] = useState(''); // será definido ao carregar dados
  useEffect(() => {
    if (!selectedAba && abaNames.length > 0) {
      setSelectedAba(abaNames[0]);
    }
  }, [abaNames, selectedAba]);

  // Filtro por Mês/Ano Referência (opções derivadas da aba selecionada)
  const [referenciaFilter, setReferenciaFilter] = useState(''); // '' => todas
  // Barra de pesquisa por nome do portal (com persistência simples)
  const [portalSearch, setPortalSearch] = useState(() => {
    try { return localStorage.getItem('list_portal_search') || ''; } catch { return ''; }
  });
  useEffect(() => {
    try { localStorage.setItem('list_portal_search', portalSearch); } catch {}
  }, [portalSearch]);
  // Normalização para busca case/acentos-insensitive
  const normalizeStr = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const referenciaOptions = React.useMemo(() => {
    const base = (portals || []).filter(p => getEntregaForPortal(p) === selectedAba);
    const arr = Array.from(new Set(base.map(p => String(p.mesAnoReferencia || '').trim()).filter(Boolean)));
    arr.sort((a, b) => b.localeCompare(a));
    return arr;
  }, [portals, selectedAba]);

  // Contagens por data de entrega (aba selecionada)
  const filteredPortals = (portals || [])
    .filter(portal => getEntregaForPortal(portal) === selectedAba)
    .filter(portal => {
      if (!referenciaFilter) return true;
      const v = String(portal.mesAnoReferencia || '').trim().toUpperCase();
      return v === referenciaFilter.toUpperCase();
    })
    .filter(portal => {
      const q = portalSearch && portalSearch.trim();
      if (!q) return true;
      const needle = normalizeStr(q);
      const hay = normalizeStr(portal.portal || '');
      return hay.includes(needle);
    });
  const countSemNovosDadosAba = React.useMemo(() => {
    return filteredPortals.filter(p => String(p.mesAnoReferencia || '').trim().toUpperCase() === 'SEM NOVOS DADOS').length;
  }, [filteredPortals]);
  const totalAEnviar = React.useMemo(() => {
    // Total por data de entrega excluindo "Sem novos dados"
    return filteredPortals.filter(p => String(p.mesAnoReferencia || '').trim().toUpperCase() !== 'SEM NOVOS DADOS').length;
  }, [filteredPortals]);
  const totalAEnviarUnicos = React.useMemo(() => {
    // Contar nomes de portais únicos (case-insensitive), excluindo "Sem novos dados"
    const relevantes = filteredPortals.filter(p => String(p.mesAnoReferencia || '').trim().toUpperCase() !== 'SEM NOVOS DADOS');
    const nomes = new Set(relevantes.map(p => String(p.portal || '').trim().toUpperCase()));
    return nomes.size;
  }, [filteredPortals]);

  // Configurações de edição, paginação e modal
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('list_items_per_page');
    const n = saved ? parseInt(saved, 10) : 10;
    return isNaN(n) ? 10 : n;
  });
  useEffect(() => {
    try { localStorage.setItem('list_items_per_page', String(itemsPerPage)); } catch {}
  }, [itemsPerPage]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editableRow, setEditableRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Filtrar registros da aba selecionada (consumo exclusivo da API)
  // Já calculado acima com dataEntrega || referencia
  
  // Ordenação configurável (com persistência)
  const [sortKey, setSortKey] = useState(() => {
    try {
      const saved = localStorage.getItem('list_sort_key');
      const allowed = new Set(allColumns.map(c => c.key));
      return saved && allowed.has(saved) ? saved : 'portal';
    } catch { return 'portal'; }
  });
  const [sortDirection, setSortDirection] = useState(() => {
    try {
      const saved = localStorage.getItem('list_sort_dir');
      return saved === 'desc' ? 'desc' : 'asc';
    } catch { return 'asc'; }
  });
  useEffect(() => { try { localStorage.setItem('list_sort_key', sortKey); } catch {} }, [sortKey]);
  useEffect(() => { try { localStorage.setItem('list_sort_dir', sortDirection); } catch {} }, [sortDirection]);
  // Garantir que sortKey esteja entre as colunas selecionadas
  useEffect(() => {
    if (selectedCols.length > 0 && !selectedColumns.includes(sortKey)) {
      setSortKey(selectedCols[0].key);
    }
  }, [selectedColumns, selectedCols, sortKey]);
  const sortedPortals = React.useMemo(() => {
    const arr = [...filteredPortals];
    if (sortKey) {
      arr.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return sortDirection === 'asc' ? -1 : 1;
        if (bv == null) return sortDirection === 'asc' ? 1 : -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        return sortDirection === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }
    return arr;
  }, [filteredPortals, sortKey, sortDirection]);
  // Calcular o total de páginas com base nos dados ordenados
  const totalPortais = sortedPortals.length;
  const totalPages = Math.ceil(totalPortais / itemsPerPage);

  // Filtrar os registros da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPortals = sortedPortals.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (id) => {
    navigate(`/edit/${id}`);
  };

  // Removido fluxo de edição local (mock). Página apenas leitura.

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAbaChange = (event) => {
    setSelectedAba(event.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao trocar de aba
  };
  // Resetar paginação ao mudar busca
  useEffect(() => { setCurrentPage(1); }, [portalSearch]);
  // Ordenar ao clicar no cabeçalho
  const handleSortByKey = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Resetar preferências (colunas, ordenação, paginação)
  const resetPreferences = () => {
    try {
      localStorage.removeItem('list_selected_columns');
      localStorage.removeItem('list_items_per_page');
      localStorage.removeItem('list_sort_key');
      localStorage.removeItem('list_sort_dir');
    } catch {}
    setSelectedColumns(allColumns.map(c => c.key));
    setItemsPerPage(10);
    setSortKey('portal');
    setSortDirection('asc');
    setCurrentPage(1);
    setModalMessage('Preferências resetadas.');
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  // Exportar CSV apenas com colunas selecionadas e dados filtrados pela aba
  const exportCSV = () => {
    const cols = selectedCols;
    const headers = cols.map(c => c.label);
    const escapeCSV = (s) => {
      const str = String(s ?? '');
      return '"' + str.replace(/\"/g, '""') + '"';
    };
    const getCSVValue = (c, p) => {
      switch (c.key) {
        case 'status': {
          const meta = (typeof getStatusMeta === 'function') ? getStatusMeta(p.status) : { label: p.status };
          return meta.label;
        }
        case 'pulouCompetencia':
        case 'defasagemNosDados':
        case 'novosDados':
        case 'enviar':
          return p[c.key] ? 'Sim' : 'Não';
        case 'percentualVolumetriaUltima':
        case 'percentualVolumetriaMediaMovel':
        case 'percentualVolumetriaMedia':
        case 'percentualVolumetriaMinimo':
        case 'percentualVolumetriaMaximo':
          return p[c.key] != null ? `${p[c.key]}%` : '';
        default:
          return p[c.key] != null ? p[c.key] : '';
      }
    };
    const filtered = (portals || [])
      .filter(portal => getEntregaForPortal(portal) === selectedAba)
      .filter(portal => {
        if (!referenciaFilter) return true;
        const v = String(portal.mesAnoReferencia || '').trim().toUpperCase();
        return v === referenciaFilter.toUpperCase();
      })
      .filter(portal => {
        const q = portalSearch && portalSearch.trim();
        if (!q) return true;
        const needle = normalizeStr(q);
        const hay = normalizeStr(portal.portal || '');
        return hay.includes(needle);
      });
    const rows = filtered.map(p => cols.map(c => getCSVValue(c, p)));
    const csv = [headers.map(escapeCSV).join(';'), ...rows.map(r => r.map(escapeCSV).join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portais_${selectedAba || 'todos'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">

      {/* Indicador de carregamento da API */}
      {loading && (
        <div className="flex items-center mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm font-medium text-gray-700">Carregando dados da API...</span>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Mensagem de sucesso/aviso */}
      {showModal && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" role="status" aria-live="polite">
          {modalMessage}
        </div>
      )}

      {/* Barra de ações moderna responsiva (usa largura total, alinhada com a tabela) */}
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white shadow-soft rounded-xl px-4 py-3">
          {/* Opção de referência */}
          <div className="flex items-center gap-2">
            <label htmlFor="abaSelect" className="text-sm font-medium text-gray-700">Data da entrega:</label>
            <div className="relative inline-block">
              <select
                id="abaSelect"
                value={selectedAba}
                onChange={handleAbaChange}
                className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary px-2.5 pr-7 py-1 text-sm"
              >
                {abaNames.map((aba) => (
                  <option key={aba} value={aba}>{aba}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            {/* Filtro por Mês/Ano Referência */}
            <label htmlFor="referenciaFilter" className="text-sm font-medium text-gray-700 ml-3">Mês/Ano Referência:</label>
            <div className="relative inline-block">
              <select
                id="referenciaFilter"
                value={referenciaFilter}
                onChange={(e) => { setReferenciaFilter(e.target.value); setCurrentPage(1); }}
                className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary px-2.5 pr-7 py-1 text-sm"
                aria-label="Filtrar por Mês/Ano Referência"
              >
                <option value="">Todas</option>
                {referenciaOptions.map((ref) => (
                  <option key={ref} value={ref}>{ref}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            {/* Totais por data de entrega (aba selecionada) */}
            <div className="flex items-center gap-2 ml-4">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs md:text-sm">Total de Portais a Enviar: <strong>{totalAEnviarUnicos}</strong></span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs md:text-sm">Sem novos dados (data): <strong>{countSemNovosDadosAba}</strong></span>
            </div>
          </div>

          {/* Ações principais */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="px-3 py-1 text-sm rounded-md bg-primary text-white shadow hover:bg-primary/90"
              aria-expanded={menuOpen}
              aria-controls="columns-panel"
            >
              Selecionar colunas
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">Itens por página:</label>
              <div className="relative inline-block">
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => { setCurrentPage(1); setItemsPerPage(parseInt(e.target.value, 10)); }}
                  className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 pr-7 py-1 text-sm"
                >
                  <option value={5}>5</option>
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
            </div>
            {/* Busca por nome do portal */}
            <div className="flex items-center gap-2">
              <label htmlFor="portalSearch" className="text-sm text-gray-700">Buscar portal:</label>
              <input
                id="portalSearch"
                type="text"
                value={portalSearch}
                onChange={(e) => setPortalSearch(e.target.value)}
                placeholder="Pesquisar por nome do portal"
                className="rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2 py-1 text-sm"
              />
              {portalSearch && (
                <button
                  onClick={() => { setPortalSearch(''); setCurrentPage(1); }}
                  className="px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm border border-gray-300"
                  title="Limpar busca"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sortKey" className="text-sm text-gray-700">Ordenar por:</label>
              <div className="relative inline-block">
                <select
                  id="sortKey"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="appearance-none rounded-md border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary px-2.5 pr-7 py-1 text-sm"
                >
                  {selectedCols.map(col => (
                    <option key={col.key} value={col.key}>{col.label}</option>
                  ))}
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
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-1 text-sm rounded-md bg-secondary text-white shadow hover:bg-secondary/90"
            >
              Exportar CSV
            </button>
            <button
              onClick={resetPreferences}
              className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-800 shadow hover:bg-gray-300"
              title="Limpar seleção de colunas, ordenação e paginação"
            >
              Resetar preferências
            </button>
          </div>
        </div>
      </div>

      {/* Painel de seleção de colunas */}
      {menuOpen && (
        <div id="columns-panel" className="w-full mb-4 bg-white shadow rounded p-4" aria-label="Selecionar colunas da tabela">
          <div className="flex space-x-2 mb-3">
            <button
              onClick={() => setSelectedColumns(allColumns.map(c => c.key))}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Selecionar todas
            </button>
            <button
              onClick={() => setSelectedColumns(['portal','esfera','mesAnoReferencia','volumetriaDados','status','enviar'])}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Padrão
            </button>
            <button
              onClick={() => setSelectedColumns([])}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allColumns.map(col => (
              <label key={col.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.key)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedColumns(prev => checked ? [...prev, col.key] : prev.filter(k => k !== col.key));
                  }}
                />
                <span className="text-sm text-gray-700">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Legenda de Status simplificada */}
      <div className="w-full mb-2">
        <div className="text-sm font-medium text-gray-700 mb-1">Legenda de Status</div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">OK — Dados consistentes</span>
          <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Observação—Dados fora do padrão</span>
        </div>
      </div>

      <div className="w-full bg-white shadow-lg rounded-xl overflow-x-auto scroll-area">
        <table className="table-auto w-full border-collapse text-xs md:text-sm lg:text-base">
          <caption className="sr-only">Listagem de Portais e indicadores</caption>
          <thead>
            {/* Linha do título centralizado (totais por data de entrega) */}
            <tr className="bg-primary/15 text-primary text-left">
              <th colSpan={Math.max(selectedCols.length, 1)} className="p-4 text-2xl font-semibold">
                Total de Portais a Enviar: {totalAEnviarUnicos}
              </th>
            </tr>
            <tr className="bg-primary text-white">
              {selectedCols.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className="p-2 font-semibold cursor-pointer select-none"
                  onClick={() => handleSortByKey(col.key)}
                  title={`Ordenar por ${col.label}`}
                  aria-sort={sortKey === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPortals.map((portal) => {
              const meta = getStatusMeta(portal.status);
              return (
                <tr
                  key={portal._id}
                  className={`border-b cursor-pointer hover:bg-primary/10 ${meta.rowBg}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(portal._id);
                    }
                  }}
                >
                  {selectedCols.map(col => (
                    <td key={col.key} className="p-2" onClick={() => handleRowClick(portal._id)}>
                      {col.render(portal)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Navegação de Paginação */}
      <div className="mt-4 flex flex-wrap gap-2" role="navigation" aria-label="Paginação de resultados">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-full border ${
              currentPage === index + 1 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'
            } shadow-sm`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Página sem modal de edição */}
    </div>
  );
};

export default ListPage;
