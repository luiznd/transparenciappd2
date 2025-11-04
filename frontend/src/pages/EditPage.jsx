// src/pages/EditPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import logo from '../assets/logo.png'; // Importar o logotipo

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portalData, setPortalData] = useState(null);
  const [observacaoTimeDados, setObservacaoTimeDados] = useState('');
  const [enviar, setEnviar] = useState(false);
  // Campos editáveis foram restritos: apenas observacaoTimeDados e enviar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    const fetchPortal = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usar proxy de API para funcionar em dev (CRA/Vite) e produção (Nginx)
        const response = await axios.get(`/api/portals/${id}`);
        setPortalData(response.data);
        setObservacaoTimeDados(response.data.observacaoTimeDados || '');
        setEnviar(!!response.data.enviar);
        // Demais campos permanecem somente leitura na UI
      } catch (err) {
        setError('Erro ao carregar dados do portal: ' + err.message);
        console.error('Erro ao buscar portal por ID:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortal();
  }, [id]);

  // Dados dos gráficos
  const safePct = (num, den) => {
    const n = Number(num) || 0;
    const d = Number(den) || 0;
    if (d <= 0) return 0;
    const pct = (n / d) * 100;
    // Limitar a 100 para melhor leitura em gráficos de Radar
    return Math.min(Math.max(pct, 0), 100);
  };

  const percentMetrics = portalData ? {
    taxaDadosVsFonte: safePct(portalData.volumetriaDados, portalData.volumeFonte),
    taxaServicosVsFonte: safePct(portalData.volumetriaServicos, portalData.volumeFonte),
    cpfsUnicosDadosSobreVolumetriaDados: safePct(portalData.volumeCpfsUnicosDados, portalData.volumetriaDados),
    cpfsUnicosServicosSobreVolumetriaServicos: safePct(portalData.volumeCpfsUnicosServicos, portalData.volumetriaServicos),
    ultimaVolumetriaSobreMediaMovel: safePct(portalData.ultimaVolumetriaEnviada, portalData.mediaMovelUltimos12Meses),
  } : null;

  const pieData = portalData ? {
    labels: ['Volume Fonte', 'Volumetria Serviços', 'Última Volumetria Enviada', 'Média Móvel (Últimos 12 Meses)'],
    datasets: [
      {
        data: [
          portalData.volumeFonte,
          portalData.volumetriaServicos,
          portalData.ultimaVolumetriaEnviada,
          portalData.mediaMovelUltimos12Meses
        ],
        backgroundColor: ['#059669', '#D97706', '#4B5563', '#3B82F6'],
        hoverBackgroundColor: ['#047857', '#B45309', '#374151', '#1D4ED8']
      }
    ]
  } : { labels: [], datasets: [] };

  const barData = portalData ? {
    labels: [
      'Volume Fonte',
      'Volumetria Dados',
      'Volumetria Serviços',
      'Volume CPFs Únicos (Dados)',
      'Volume CPFs Únicos (Serviços)',
      'Média'
    ],
    datasets: [
      {
        label: 'Valores',
        data: [
          portalData.volumeFonte,
          portalData.volumetriaDados,
          portalData.volumetriaServicos,
          portalData.volumeCpfsUnicosDados,
          portalData.volumeCpfsUnicosServicos,
          portalData.media
        ],
        backgroundColor: [
          '#059669',
          '#D97706',
          '#4F46E5',
          '#10B981',
          '#3B82F6',
          '#6366F1'
        ]
      }
    ]
  } : { labels: [], datasets: [] };

  const radarLabels = [
    'Taxa Dados vs Fonte',
    'Taxa Serviços vs Fonte',
    'CPFs Únicos Dados / Vol. Dados',
    'CPFs Únicos Serviços / Vol. Serviços',
    'Última Volumetria / Média Móvel',
  ];

  const radarData = percentMetrics ? {
    labels: radarLabels,
    datasets: [
      {
        label: 'Percentuais (%)',
        data: [
          percentMetrics.taxaDadosVsFonte,
          percentMetrics.taxaServicosVsFonte,
          percentMetrics.cpfsUnicosDadosSobreVolumetriaDados,
          percentMetrics.cpfsUnicosServicosSobreVolumetriaServicos,
          percentMetrics.ultimaVolumetriaSobreMediaMovel,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366F1',
        pointBackgroundColor: '#6366F1',
      }
    ]
  } : { labels: [], datasets: [] };

  const percentBarData = percentMetrics ? {
    labels: radarLabels,
    datasets: [
      {
        label: 'Percentuais (%)',
        data: [
          percentMetrics.taxaDadosVsFonte,
          percentMetrics.taxaServicosVsFonte,
          percentMetrics.cpfsUnicosDadosSobreVolumetriaDados,
          percentMetrics.cpfsUnicosServicosSobreVolumetriaServicos,
          percentMetrics.ultimaVolumetriaSobreMediaMovel,
        ],
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#8B5CF6',
          '#EF4444',
        ]
      }
    ]
  } : { labels: [], datasets: [] };

  return (
    <div className="min-h-screen p-10 flex flex-col items-center">
      <img
        src={logo}
        alt="Logotipo"
        className="absolute top-4 left-4 h-12 w-auto" // Estilo para posicionamento
      />
      <br></br> 
      <br></br>        
      <div className="w-full max-w-6xl text-center bg-[#059669] text-white py-4 rounded-lg mb-8">
        <h2 className="text-3xl font-bold">Detalhes do Portal {portalData ? `- ${portalData.portal}` : ''}</h2>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-gray-100 rounded">Carregando dados...</div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
      )}
      {saveError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{saveSuccess}</div>
      )}
      {!portalData && !loading && !error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">Nenhum dado encontrado para este portal.</div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        {/* Coluna Esquerda: Card com todos os dados do portal */}
        <div
          className={`w-full md:w-1/2 p-6 rounded-lg shadow-lg bg-white ${
            portalData && portalData.status === 'OK' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-700">Dados do Portal</h3>
          <div className="grid grid-cols-1 gap-2">
            {portalData && Object.entries(portalData).map(([key, value]) => {
              if (key !== 'observacaoTimeDados' && key !== 'enviar' && key !== '_id') {
                return (
                  <div key={key} className="flex justify-between border-b py-1">
                    <span className="font-semibold text-gray-700">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</span>
                    <span className="text-gray-600">{value.toString()}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Coluna Direita: Edição e Gráficos */}
        <div className="flex flex-col w-full md:w-1/2 gap-6">
          {/* Card de Edição de Campos */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-1 text-gray-700">Editar Dados</h3>
            <p className="text-sm text-gray-500 mb-4">Somente os campos "Observação Time Dados" e "Enviar?" podem ser alterados.</p>
            <div className="mb-4">
              <label className="block font-semibold text-gray-700">Observação Time Dados</label>
              <textarea
                value={observacaoTimeDados}
                onChange={(e) => setObservacaoTimeDados(e.target.value)}
                className="w-full p-2 border rounded resize-none"
                rows="4"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-700">Enviar?</label>
              <input
                type="checkbox"
                checked={enviar}
                onChange={(e) => setEnviar(e.target.checked)}
                className="mt-2"
              />
            </div>
            {/* Campos somente leitura foram removidos da edição para atender à regra */}
            <button
              onClick={async () => {
                setSaving(true);
                setSaveError(null);
                setSaveSuccess(null);
                try {
                  await axios.put(`/api/portals/${id}`, {
                    observacaoTimeDados,
                    enviar,
                  });
                  setSaveSuccess('Alterações salvas com sucesso.');
                  // Atualizar dados exibidos
                  setPortalData({ ...portalData, observacaoTimeDados, enviar });
                } catch (err) {
                  console.error('Erro ao salvar dados:', err);
                  const msg = err.response?.data?.error || 'Erro ao salvar alterações';
                  setSaveError(msg);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className={`w-full text-white py-2 rounded ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

          {/* Card do Gráfico de Pizza com porcentagens */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col w-full h-[300px] md:h-[400px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700 text-center">Comparação de Volumes</h3>
            <div className="flex-grow flex items-center justify-center">
              <Pie 
                data={pieData} 
                plugins={[ChartDataLabels]} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => {
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2) + '%';
                        return percentage;
                      },
                      color: '#fff',
                      font: { weight: 'bold' },
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Card do Gráfico de Barras Horizontal */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col min-w-full h-[350px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700 text-center">Detalhamento de Volumes</h3>
            <div className="flex-grow flex items-center justify-center">
              <Bar data={barData} options={{ indexAxis: 'y' }} />
            </div>
          </div>

          {/* Novo: Radar de Percentuais de Volumetria */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col min-w-full h-[350px]">
            <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Radar de Percentuais (0-100%)</h3>
            <p className="text-xs text-gray-500 text-center mb-3">
              Métricas calculadas: Dados/Fonte, Serviços/Fonte, CPFs Únicos/Volumetria (Dados e Serviços), Última Volumetria/Média Móvel.
            </p>
            <div className="flex-grow flex items-center justify-center">
              <Radar 
                data={radarData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      suggestedMin: 0,
                      suggestedMax: 100,
                      ticks: {
                        callback: (val) => `${val}%`,
                        showLabelBackdrop: false,
                      },
                      grid: { color: 'rgba(156, 163, 175, 0.2)' },
                      angleLines: { color: 'rgba(156, 163, 175, 0.2)' },
                    }
                  },
                  plugins: {
                    legend: { display: true },
                  }
                }}
              />
            </div>
          </div>

          {/* Novo: Barra dos Percentuais */}
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col min-w-full h-[350px]">
            <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Percentuais de Volumetria</h3>
            <div className="flex-grow flex items-center justify-center">
              <Bar 
                data={percentBarData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (val) => `${val}%` } }
                  },
                  plugins: {
                    datalabels: {
                      formatter: (value) => `${Number(value).toFixed(0)}%`,
                      color: '#111827',
                      anchor: 'end',
                      align: 'start',
                      offset: -2,
                      font: { weight: 'bold' },
                    },
                    legend: { display: false },
                  },
                }}
                plugins={[ChartDataLabels]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
