'use client';

import { useState } from 'react';
import { devolverEquipamentoAction } from '@/app/actions/emprestimos';

interface DevolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  emprestimo: {
    id: number;
    patrimonio_id: string;
    nome_requisitante: string;
  } | null;
}

export default function DevolucaoModal({ isOpen, onClose, emprestimo }: DevolucaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen || !emprestimo) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const formData = new FormData(e.currentTarget);
    const resposta = await devolverEquipamentoAction(formData);

    if (resposta?.erro) {
      setErro(resposta.erro);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-left whitespace-normal space-y-4">
        
        <h3 className="text-xl font-bold text-blue-800 border-b pb-2">Confirmar Devolução</h3>
        
        <p className="text-sm text-gray-700">
          Deseja confirmar a devolução do património <strong className="text-black">{emprestimo.patrimonio_id}</strong> requisitado por <strong className="text-black">{emprestimo.nome_requisitante}</strong>?
        </p>

        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded text-sm text-orange-800">
          <p><strong>Atenção:</strong> O status deste equipamento será alterado automaticamente para <strong>Revisão TI</strong> e sairá da lista de disponíveis.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <input type="hidden" name="emprestimo_id" value={emprestimo.id} />
          <input type="hidden" name="patrimonio_id" value={emprestimo.patrimonio_id} />
          
          {/* NOVA ÁREA DE OBSERVAÇÃO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações da Devolução (Opcional)
            </label>
            <textarea
              name="observacao"
              rows={3}
              placeholder="Ex: Equipamento devolvido com a tampa riscada, falta o rato..."
              className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {erro && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow disabled:bg-gray-400"
            >
              {loading ? 'A processar...' : 'Confirmar Devolução'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}