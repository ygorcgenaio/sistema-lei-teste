'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { criarManutencaoAction } from '@/app/actions/manutencao';

export default function NovaManutencaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErroGeral(null);

    const formData = new FormData(e.currentTarget);
    const resposta = await criarManutencaoAction(formData);

    if (resposta?.erro) {
      setErroGeral(resposta.erro);
      setLoading(false);
    } else {
      router.push('/manutencao');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Registrar Manutenção</h1>
          <a href="/manutencao" className="text-gray-500 hover:text-gray-700 text-sm font-medium">&larr; Voltar</a>
        </div>

        {erroGeral && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm">
            <p className="font-bold">Erro:</p><p>{erroGeral}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patrimônio ID <span className="text-red-500">*</span></label>
              <input type="text" name="patrimonio_id" required placeholder="Ex: NOTE LEI 001" className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select name="responsavel" className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="EQUIPE_TI">Equipe TI Interna</option>
                <option value="AUTORIZADA">Assistência Autorizada</option>
                <option value="OUTRO">Outro / Terceirizado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico Inicial (Opcional)</label>
            <textarea name="diagnostico" rows={3} placeholder="Descreva o problema relatado..." className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700 transition shadow disabled:bg-gray-400">
            {loading ? 'A processar...' : 'Enviar para Manutenção'}
          </button>
        </form>
      </div>
    </div>
  );
}