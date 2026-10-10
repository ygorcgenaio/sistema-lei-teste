'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cadastrarItemAction } from '@/app/actions/inventario';

export default function NovoItemInventarioPage() {
  const router = useRouter();
  const [dataCompra, setDataCompra] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null); // Estado para o alerta

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMensagemErro(null); // Limpa mensagens de erros anteriores

    const formData = new FormData(e.currentTarget);

    try {
      const resposta = await cadastrarItemAction(formData);

      // Se a Server Action retornar um erro, exibimos na tela e paramos a função
      if (resposta?.erro) {
        setMensagemErro(resposta.erro);
        setLoading(false);
        return; // Retorna aqui para não executar o router.push (mantém os dados na tela)
      }

      // Se passou direto, foi sucesso
      router.push('/equipamentos');
      router.refresh();
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setMensagemErro('Falha de conexão com o servidor.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Cadastrar Novo Item no Inventário</h1>
          <a href="/equipamentos" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
            &larr; Voltar
          </a>
        </div>

        {/* ALERTA DE ERRO (Exibido apenas se mensagemErro não for nulo) */}
        {mensagemErro && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm text-sm">
            <p className="font-bold">Não foi possível cadastrar:</p>
            <p>{mensagemErro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID do Patrimônio</label>
              <input
                type="text"
                name="patrimonio_id"
                required
                placeholder="Ex: PAT-00123"
                className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                name="categoria"
                required
                className="w-full border border-gray-300 rounded p-2 text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="notebook">Notebook</option>
                <option value="equipamento_de_ti">Equipamento de TI</option>
                <option value="movel">Móvel</option>
                <option value="eletrodomestico">Eletrodoméstico</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Produto <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descricao"
              required
              placeholder="Detalhes sobre o equipamento, marca, modelo, configurações..."
              rows={3}
              className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Conservação <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="estado_conservacao"
                required
                defaultValue="Bom"
                placeholder="Ex: Novo, Bom, Regular..."
                className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origem do Recurso</label>
              <select
                name="origem_recurso"
                defaultValue="LEI"
                className="w-full border border-gray-300 rounded p-2 text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LEI">LEI</option>
                <option value="UFF">UFF</option>
                <option value="PROJETO">Projeto</option>
              </select>
            </div>
          </div>

          {/* SESSÃO DA NOTA FISCAL E DATAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo PDF da Nota Fiscal <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="pdf_file"
                required
                accept="application/pdf"
                className="w-full border border-gray-300 rounded p-1.5 text-xs text-black bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Compra</label>
              <input
                type="date"
                name="data_compra"
                required
                value={dataCompra}
                onChange={(e) => setDataCompra(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Recebimento</label>
              <input
                type="date"
                name="data_recebimento"
                required
                min={dataCompra}
                className="w-full border border-gray-300 rounded p-2 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded hover:bg-blue-700 transition mt-6 shadow disabled:bg-gray-400"
          >
            {loading ? 'Cadastrando e enviando ficheiro...' : 'Cadastrar Item no Inventário'}
          </button>
        </form>
      </div>
    </div>
  );
}