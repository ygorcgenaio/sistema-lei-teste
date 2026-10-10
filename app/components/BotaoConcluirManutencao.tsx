'use client';

import { useState } from 'react';
import { concluirManutencaoAction } from '@/app/actions/manutencao';

interface Props {
  manutencao: {
    id: number;
    patrimonio_id: string;
  };
}

export default function BotaoConcluirManutencao({ manutencao }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const formData = new FormData(e.currentTarget);
    const resposta = await concluirManutencaoAction(formData);

    if (resposta?.erro) {
      setErro(resposta.erro);
      setLoading(false);
    } else {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700 transition font-bold shadow whitespace-nowrap"
      >
        Terminar Manutenção
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-left whitespace-normal space-y-4">
            <h3 className="text-xl font-bold text-green-800 border-b pb-2">Concluir Manutenção</h3>
            
            <p className="text-sm text-gray-700">
              Descreva o reparo efetuado no equipamento <strong>{manutencao.patrimonio_id}</strong>. 
              <br/><br/>
              Após concluir, o status retornará a "Ativo/Disponível". Se o item não tiver conserto, termine a manutenção aqui e depois desative-o no inventário geral.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
              <input type="hidden" name="manutencao_id" value={manutencao.id} />
              <input type="hidden" name="patrimonio_id" value={manutencao.patrimonio_id} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reparo Feito <span className="text-red-500">*</span></label>
                <textarea
                  name="reparo_feito"
                  required
                  rows={3}
                  placeholder="Ex: Substituição da memória RAM, limpeza interna..."
                  className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-green-500"
                ></textarea>
              </div>

              {erro && <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded">{erro}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded shadow disabled:bg-gray-400">
                  {loading ? 'A processar...' : 'Confirmar Conclusão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}