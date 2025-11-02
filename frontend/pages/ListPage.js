// src/pages/ListPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockPortals from '../mockData';
import logo from '../assets/logo.png'; // Importar o logotipo

const ListPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/fechar o menu


  // Obter os nomes das abas para o combobox (substitua pelos nomes reais das abas, caso disponíveis)
  const abaNames = ["10-11-2024", "10-10-2024", "10-09-2024"]; // Substitua com os nomes das abas reais
  const [selectedAba, setSelectedAba] = useState(abaNames[0]); // Inicia com a primeira aba selecionada

  // Configurações de edição, paginação e modal
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [editableRow, setEditableRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Filtrar registros da aba selecionada
  const filteredPortals = mockPortals.filter(portal => portal.referencia === selectedAba);
  
  // Calcular o total de páginas com base nos dados filtrados
  const totalPortais = filteredPortals.length;
  const totalPages = Math.ceil(totalPortais / itemsPerPage);

  // Filtrar os registros da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPortals = filteredPortals.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleEditClick = (id, field) => {
    if (!isFinalized) {
      setEditableRow(id);
      setEditedData((prevData) => ({
        ...prevData,
        [id]: {
          ...prevData[id],
          [field]: mockPortals.find((portal) => portal._id === id && portal.aba === selectedAba)[field],
        },
      }));
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [id]: {
        ...prevData[id],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    Object.keys(editedData).forEach((id) => {
      const portalIndex = mockPortals.findIndex((portal) => portal._id === id);
      if (portalIndex !== -1) {
        mockPortals[portalIndex] = {
          ...mockPortals[portalIndex],
          ...editedData[id],
        };
      }
    });
    setEditableRow(null);
    setEditedData({});
    setModalMessage('Alterações salvas com sucesso!');
    setShowModal(true);
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    setEditableRow(null);
    setModalMessage('Edição finalizada. Não é possível fazer mais alterações.');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAbaChange = (event) => {
    setSelectedAba(event.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao trocar de aba
  };

  return (
    <div className="min-h-screen p-10 flex flex-col items-center">
      {/* Logotipo no canto superior direito */}
      <img
        src={logo}
        alt="Logotipo"
        className="absolute top-4 left-4 h-12 w-auto" // Estilo para posicionamento
      />      

      {/* Combobox de seleção de aba e botões de ação */}
      <div className="flex space-x-4 mb-4 items-left">
        <select
          value={selectedAba}
          onChange={handleAbaChange}
          className="p-2 border rounded bg-white text-gray-700"
        >
          {abaNames.map((aba) => (
            <option key={aba} value={aba}>
              {aba}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
        <button
          onClick={handleFinalize}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Finalizar Edição
        </button>
      </div>

      <div className="w-full bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="table-auto w-full border-collapse text-xs md:text-sm lg:text-base">
          <thead>
            {/* Linha do título centralizado */}
            <tr className="bg-blue-200 text-black text-left">
              <th colSpan="33" className="p-4 text-2xl font-semibold">
                Total de Portais a Enviar: {totalPortais}
              </th>
            </tr>
            <tr className="bg-blue-700 text-white">
              <th className="p-2 font-semibold">Portal</th>
              <th className="p-2 font-semibold">Esfera</th>
              <th className="p-2 font-semibold">Mês/Ano Envio</th>
              <th className="p-2 font-semibold">Mês/Ano Referência</th>
              <th className="p-2 font-semibold">Volume Fonte</th>
              <th className="p-2 font-semibold">Volumetria Dados</th>
              <th className="p-2 font-semibold">Volumetria Serviços</th>
              <th className="p-2 font-semibold">Índice Dados</th>
              <th className="p-2 font-semibold">Índice Serviços</th>
              <th className="p-2 font-semibold">Volume CPFs Únicos (Dados)</th>
              <th className="p-2 font-semibold">Volume CPFs Únicos (Serviços)</th>
              <th className="p-2 font-semibold">Média Móvel CPFs Únicos</th>
              <th className="p-2 font-semibold">Último Mês Enviado</th>
              <th className="p-2 font-semibold">Última Referência</th>
              <th className="p-2 font-semibold">Última Volumetria Enviada</th>
              <th className="p-2 font-semibold">Média Móvel (Últimos 12 Meses)</th>
              <th className="p-2 font-semibold">Média</th>
              <th className="p-2 font-semibold">Mínimo</th>
              <th className="p-2 font-semibold">Mês Competência Mínimo</th>
              <th className="p-2 font-semibold">Máximo</th>
              <th className="p-2 font-semibold">Mês Competência Máximo</th>
              <th className="p-2 font-semibold">% Volumetria vs Última</th>
              <th className="p-2 font-semibold">% Volumetria vs Média Móvel</th>
              <th className="p-2 font-semibold">% Volumetria vs Média</th>
              <th className="p-2 font-semibold">% Volumetria vs Mínimo</th>
              <th className="p-2 font-semibold">% Volumetria vs Máximo</th>
              <th className="p-2 font-semibold">Pulou Competência?</th>
              <th className="p-2 font-semibold">Defasagem nos Dados?</th>
              <th className="p-2 font-semibold">Novos Dados?</th>
              <th className="p-2 font-semibold">Status</th>
              <th className="p-2 font-semibold">Observação Time Dados</th>
              <th className="p-2 font-semibold">Enviar?</th>
            </tr>
          </thead>
          <tbody>
            {currentPortals.map((portal) => (
              <tr
                key={portal._id}
                className={`border-b cursor-pointer hover:bg-blue-100 ${
                  editableRow === portal._id ? 'bg-green-100' : portal.status === 'OK' ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>
                {portal.portal}
                </td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.esfera}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mesAnoEnvio}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mesAnoReferencia}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.volumeFonte}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.volumetriaDados}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.volumetriaServicos}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.indiceDados}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.indiceServicos}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.volumeCpfsUnicosDados}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.volumeCpfsUnicosServicos}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mediaMovelCpfsUnicos}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.ultimoMesEnviado}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.ultimaReferencia}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.ultimaVolumetriaEnviada}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mediaMovelUltimos12Meses}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.media}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.minimo}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mesCompetenciaMinimo}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.maximo}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.mesCompetenciaMaximo}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.percentualVolumetriaUltima}%</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.percentualVolumetriaMediaMovel}%</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.percentualVolumetriaMedia}%</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.percentualVolumetriaMinimo}%</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.percentualVolumetriaMaximo}%</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.pulouCompetencia ? 'Sim' : 'Não'}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.defasagemNosDados ? 'Sim' : 'Não'}</td>
                <td className="p-2" onClick={() => handleRowClick(portal._id)}>{portal.novosDados ? 'Sim' : 'Não'}</td>
                <td className="p-2 font-semibold">{portal.status}</td>

                {/* Campo Observação Time Dados com edição */}
                <td
                  className="p-2"
                  onClick={() => handleEditClick(portal._id, 'observacaoTimeDados')}
                >
                  {editableRow === portal._id ? (
                    <input
                      type="text"
                      value={editedData[portal._id]?.observacaoTimeDados || portal.observacaoTimeDados}
                      onChange={(e) =>
                        handleInputChange(portal._id, 'observacaoTimeDados', e.target.value)
                      }
                      className="border rounded p-1 w-full"
                      disabled={isFinalized}
                    />
                  ) : (
                    portal.observacaoTimeDados
                  )}
                </td>

                {/* Campo Enviar com edição */}
                <td
                  className="p-2 text-center"
                  onClick={() => handleEditClick(portal._id, 'enviar')}
                >
                  {editableRow === portal._id ? (
                    <input
                      type="checkbox"
                      checked={editedData[portal._id]?.enviar ?? portal.enviar}
                      onChange={(e) =>
                        handleInputChange(portal._id, 'enviar', e.target.checked)
                      }
                      className="form-checkbox"
                      disabled={isFinalized}
                    />
                  ) : (
                    portal.enviar ? 'Sim' : 'Não'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Navegação de Paginação */}
      <div className="mt-4 flex space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Confirmação</h2>
            <p className="text-center mb-6">{modalMessage}</p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage;
