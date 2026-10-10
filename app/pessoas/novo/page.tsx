'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cadastrarUsuarioAction } from '@/app/actions/usuarios';

export default function NovaPessoaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const formData = new FormData(e.currentTarget);
    const resposta = await cadastrarUsuarioAction(formData);

    if (resposta?.erro) {
      setErro(resposta.erro);
      setLoading(false);
    } else {
      router.push('/pessoas');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Cadastrar Nova Pessoa</h1>
          <a href="/pessoas" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; Voltar
          </a>
        </div>

        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
              <input type="text" name="nome" required className="w-full border border-gray-300 rounded p-2 text-sm text-black" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" required className="w-full border border-gray-300 rounded p-2 text-sm text-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
              <input type="text" name="matricula" placeholder="Opcional" className="w-full border border-gray-300 rounded p-2 text-sm text-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="text" name="telefone" placeholder="Opcional" className="w-full border border-gray-300 rounded p-2 text-sm text-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo <span className="text-red-500">*</span></label>
              <select name="role" required className="w-full border border-gray-300 rounded p-2 text-sm text-black bg-white">
                <option value="PROFESSOR">Professor</option>
                <option value="ALUNO">Aluno</option>
                <option value="SERVIDOR">Servidor</option>
                <option value="OUTROS">Outros</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded hover:bg-blue-700 transition mt-6 disabled:bg-gray-400"
          >
            {loading ? 'A cadastrar...' : 'Cadastrar Pessoa'}
          </button>
        </form>
      </div>
    </div>
  );
}