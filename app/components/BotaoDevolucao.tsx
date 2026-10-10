'use client';

import { useState } from 'react';
import DevolucaoModal from '../emprestimos/DevolucaoModal';

interface BotaoDevolucaoProps {
  emprestimo: {
    id: number;
    patrimonio_id: string;
    nome_requisitante: string;
  };
}

export default function BotaoDevolucao({ emprestimo }: BotaoDevolucaoProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition font-bold shadow"
      >
        Devolver
      </button>

      <DevolucaoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        emprestimo={emprestimo}
      />
    </>
  );
}