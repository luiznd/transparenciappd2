import React from 'react';

const Forbidden = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 text-center">
      <div className="mb-3">
        <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">403</span>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Acesso restrito</h1>
      <p className="text-gray-700 mb-4">Você não possui permissão para acessar esta página. Se precisar de acesso, contate um administrador.</p>
      <p className="text-sm text-gray-500">Caso você acredite que isso seja um engano, atualize sua sessão ou tente novamente mais tarde.</p>
    </div>
  );
};

export default Forbidden;