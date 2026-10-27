'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buscarUsuarioPorMatriculaAction } from '@/app/actions/usuarios';
import { criarEmprestimoAction } from '@/app/actions/emprestimos';

export default function NovoEmprestimoPage() {
  const router = useRouter();
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erroPesquisa, setErroPesquisa] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Busca na BD ao sair do campo da matrícula
  async function handleBuscarMatricula() {
    if (!matricula) return;

    setBuscando(true);
    setErroPesquisa('');
    setNome(''); // Limpa o nome anterior

    const resposta = await buscarUsuarioPorMatriculaAction(matricula);

    if (resposta.nome) {
      setNome(resposta.nome);
    } else if (resposta.erro) {
      setErroPesquisa(resposta.erro);
    }

    setBuscando(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErroGeral(null);

    if (!nome) {
      setErroGeral('É obrigatório ter um nome de requisitante válido.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    // Garante que o nome vai no formulário mesmo sendo readOnly
    formData.set('nome_requisitante', nome);

    const resposta = await criarEmprestimoAction(formData);

    if (resposta?.erro) {
      setErroGeral(resposta.erro);
      setLoading(false);
    } else {
      router.push('/'); // Redireciona para o painel principal após o sucesso
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Registrar Novo Empréstimo</h1>
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; Voltar
          </a>
        </div>

        {/* ALERTA DE ERRO DE CADASTRO */}
        {erroGeral && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm text-sm">
            <p className="font-bold">Atenção:</p>
            <p>{erroGeral}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BLOCO: REQUISITANTE */}
          <div className="bg-blue-50 p-4 rounded border border-blue-100">
            <h2 className="text-sm font-bold text-blue-800 mb-3">1. Dados do Requisitante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula do Requisitante
                </label>
                <input
                  type="text"
                  name="matricula"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  onBlur={handleBuscarMatricula} // Executa a busca ao clicar fora
                  placeholder="Digite a matrícula e clique fora..."
                  className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
                />
                {buscando && <p className="text-xs text-blue-600 mt-1 font-semibold">A procurar no sistema...</p>}
                {erroPesquisa && <p className="text-xs text-red-500 mt-1 font-semibold">{erroPesquisa}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Requisitante
                </label>
                <input
                  type="text"
                  name="nome_requisitante"
                  value={nome}
                  readOnly // IMPEDE A DIGITAÇÃO
                  placeholder="Preenchido automaticamente"
                  className="w-full border border-gray-300 rounded p-2 text-sm text-gray-600 bg-gray-200 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* BLOCO: EQUIPAMENTO */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3">2. Item</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código LEI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patrimonio_id"
                required
                placeholder="Ex: NOTE LEI 001"
                className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={loading || !nome} // Só permite clicar se houver um nome carregado
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'A registar empréstimo...' : 'Confirmar Empréstimo'}
          </button>
        </form>
      </div>
    </div>
  );
}