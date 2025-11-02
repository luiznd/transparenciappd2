// src/pages/EditPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import mockPortals from '../mockData';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import logo from '../assets/logo.png'; // Importar o logotipo

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Encontrar o registro pelo id
  const portalData = mockPortals.find((portal) => portal._id === id);
  const [observacaoTimeDados, setObservacaoTimeDados] = useState(portalData?.observacaoTimeDados || '');
  const [enviar, setEnviar] = useState(portalData?.enviar || false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Dados dos gráficos
  const pieData = {
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
  };

  const barData = {
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
  };

  const handleSave = () => {
    setShowModal(true);
    setModalMessage('Deseja realmente salvar as alterações?');
  };

  const confirmSave = () => {
    const index = mockPortals.findIndex((portal) => portal._id === id);
    if (index !== -1) {
      mockPortals[index] = {
        ...mockPortals[index],
        observacaoTimeDados,
        enviar
      };
    }
    setShowModal(false);
    navigate('/list');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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
        <h2 className="text-3xl font-bold">Editar Portal - {portalData.portal}</h2>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        {/* Coluna Esquerda: Card com todos os dados do portal */}
        <div
          className={`w-full md:w-1/2 p-6 rounded-lg shadow-lg bg-white ${
            portalData.status === 'OK' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-700">Dados do Portal</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(portalData).map(([key, value]) => {
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
            <h3 className="text-xl font-bold mb-4 text-gray-700">Editar Dados</h3>
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
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Salvar
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
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Confirmação</h2>
                  <p className="text-center mb-6">{modalMessage}</p>
                  <div className="flex justify-between">
                    <button
                      onClick={confirmSave}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Sim
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Não
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default EditPage;
