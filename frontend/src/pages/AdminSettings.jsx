import React, { useState } from 'react';

// Página de Configurações administrativas (stub inicial)
const AdminSettings = () => {
  const [compactUI, setCompactUI] = useState(true);
  const [denseTables, setDenseTables] = useState(true);

  return (
    <div className="w-full space-y-4">
      <div className="w-full">
        <div className="bg-white shadow-soft rounded-xl px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">Configurações</h1>
          <p className="text-sm text-gray-600">Ajuste preferências de UI e comportamento</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input id="compactUI" type="checkbox" checked={compactUI} onChange={(e) => setCompactUI(e.target.checked)} />
            <label htmlFor="compactUI" className="text-sm text-gray-800">Usar UI compacta (inputs e selects menores)</label>
          </div>
          <div className="flex items-center gap-3">
            <input id="denseTables" type="checkbox" checked={denseTables} onChange={(e) => setDenseTables(e.target.checked)} />
            <label htmlFor="denseTables" className="text-sm text-gray-800">Tabelas densas (linhas mais próximas)</label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-700">
          Esta página é um ponto de partida para configurações administrativas. No próximo passo, podemos persistir essas preferências por usuário ou globalmente via backend.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;