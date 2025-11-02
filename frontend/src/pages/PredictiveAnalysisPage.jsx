// src/pages/PredictiveAnalysisPage.js
import React, { useState } from 'react';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import 'chart.js/auto';
import mockPortals from '../mockData';

const PredictiveAnalysisPage = () => {
  const navigate = useNavigate();

  // Obter as opções únicas de aba
  const abaOptions = [...new Set(mockPortals.map((portal) => portal.aba))];
  const [selectedAba, setSelectedAba] = useState(abaOptions[0]);

  // Filtrar os portais pela aba selecionada
  const filteredPortals = mockPortals.filter((portal) => portal.aba === selectedAba);

  // Exemplo de dados para as 3 últimas referências
  const lastThreeReferences = ['10-09-2024', '10-10-2024', '10-11-2024']; // Substituir por dados reais

  // Dados para os gráficos
  const aggregatedData = lastThreeReferences.map((reference) => {
    const portalsInReference = filteredPortals.filter(
      (portal) => portal.mesAnoReferencia === reference
    );

    // Calcular a soma de cada métrica para a referência
    return {
      reference,
      volumeFonte: portalsInReference.reduce((sum, portal) => sum + portal.volumeFonte, 0),
      volumetriaServicos: portalsInReference.reduce((sum, portal) => sum + portal.volumetriaServicos, 0),
      volumetriaDados: portalsInReference.reduce((sum, portal) => sum + portal.volumetriaDados, 0),
    };
  });

  // Dados para os gráficos
  const lineData = {
    labels: aggregatedData.map((data) => data.reference),
    datasets: [
      {
        label: 'Volume Fonte',
        data: aggregatedData.map((data) => data.volumeFonte),
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5',
        fill: false,
      },
      {
        label: 'Volumetria Serviços',
        data: aggregatedData.map((data) => data.volumetriaServicos),
        borderColor: '#14B8A6',
        backgroundColor: '#14B8A6',
        fill: false,
      },
    ],
  };

  const pieData = {
    labels: ['Volume Fonte', 'Volumetria Dados', 'Volumetria Serviços'],
    datasets: [
      {
        data: [
          aggregatedData.reduce((sum, data) => sum + data.volumeFonte, 0),
          aggregatedData.reduce((sum, data) => sum + data.volumetriaDados, 0),
          aggregatedData.reduce((sum, data) => sum + data.volumetriaServicos, 0),
        ],
        backgroundColor: ['#4F46E5', '#14B8A6', '#F97316'],
        hoverBackgroundColor: ['#3730A3', '#0F766E', '#EA580C'],
      },
    ],
  };

  const barData = {
    labels: aggregatedData.map((data) => data.reference),
    datasets: [
      {
        label: 'Volumetria Dados',
        data: aggregatedData.map((data) => data.volumetriaDados),
        backgroundColor: '#F97316',
      },
      {
        label: 'Volumetria Serviços',
        data: aggregatedData.map((data) => data.volumetriaServicos),
        backgroundColor: '#14B8A6',
      },
    ],
  };

  return (
    <div className="min-h-screen p-10 flex flex-col items-center bg-gray-100">
      {/* Título da Página */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Análise Preditiva por Aba</h1>
        <button
          onClick={() => navigate('/list')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voltar para Lista
        </button>
      </div>

      {/* Seleção de Aba */}
      <div className="w-full max-w-6xl bg-white p-4 rounded-lg shadow-lg mb-8">
        <label className="block mb-2 text-gray-700 font-semibold">Selecionar Aba</label>
        <select
          value={selectedAba}
          onChange={(e) => setSelectedAba(e.target.value)}
          className="w-full p-2 border rounded bg-gray-50"
        >
          {abaOptions.map((aba) => (
            <option key={aba} value={aba}>
              {aba}
            </option>
          ))}
        </select>
      </div>

      {/* Gráficos */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gráfico de Linha */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Evolução do Volume Fonte</h2>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Comparação de Volumetria</h2>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
              },
            }}
          />
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Proporção Total de Volumes</h2>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysisPage;
