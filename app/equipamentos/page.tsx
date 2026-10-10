import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function EquipamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; detalhes?: string; desativar?: string; erro?: string }>;
}) {
  const resolvedParams = await searchParams;
  const categoriaFiltro = resolvedParams.categoria || 'notebook';
  const patrimonioDetalhes = resolvedParams.detalhes;
  const patrimonioDesativar = resolvedParams.desativar;
  const erroDesativar = resolvedParams.erro;

  let itens: any[] = [];
  let itemDetalhe: any = null;
  let itemParaDesativar: any = null;

  try {
    let query = 'SELECT * FROM inventario_lei';
    let params: any[] = [];

    if (categoriaFiltro !== 'todos') {
      query += ' WHERE categoria = ?';
      params.push(categoriaFiltro);
    }

    query += ' ORDER BY patrimonio_id DESC';

    const [rows]: any = await db.query(query, params);
    itens = Array.isArray(rows) ? rows : [];

    if (patrimonioDetalhes) {
      const [detRows]: any = await db.query('SELECT * FROM inventario_lei WHERE patrimonio_id = ?', [patrimonioDetalhes]);
      itemDetalhe = detRows[0] || null;
    }

    if (patrimonioDesativar) {
      const [desRows]: any = await db.query('SELECT * FROM inventario_lei WHERE patrimonio_id = ?', [patrimonioDesativar]);
      itemParaDesativar = desRows[0] || null;
    }
  } catch (error) {
    console.error('Erro ao consultar inventário:', error);
  }

  // Server Action para Desativar Item com verificação da palavra 'LEI'
  async function desativarItemAction(formData: FormData) {
    'use server';

    const patrimonio_id = formData.get('patrimonio_id') as string;
    const confirmacao = formData.get('confirmacao') as string;

    if (confirmacao?.trim() !== 'LEI') {
      redirect(`/equipamentos?categoria=${categoriaFiltro}&desativar=${patrimonio_id}&erro=1`);
    }

    try {
      await db.query(
        "UPDATE inventario_lei SET status = 'DESATIVADO' WHERE patrimonio_id = ?",
        [patrimonio_id]
      );
    } catch (err) {
      console.error('Erro ao desativar item:', err);
    }

    redirect(`/equipamentos?categoria=${categoriaFiltro}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho e Filtro por Categoria */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Inventário Geral - LEI</h1>
            <p className="text-gray-600">Gestão centralizada de equipamentos, móveis e eletrodomésticos</p>
          </div>

          <div className="flex items-center gap-3">
            <form method="GET" className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700">Filtrar Categoria:</label>
              <select
                name="categoria"
                defaultValue={categoriaFiltro}
                className="border border-gray-300 rounded p-1.5 text-xs font-semibold bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="notebook">Notebooks</option>
                <option value="equipamento_de_ti">Equipamento de TI</option>
                <option value="movel">Móveis</option>
                <option value="eletrodomestico">Eletrodomésticos</option>
                <option value="todos">Todos</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition font-medium shadow"
              >
                Filtrar
              </button>
            </form>

            <a
              href="/equipamentos/novo"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium shadow"
            >
              + Novo Item
            </a>
            <a
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-medium shadow"
            >
              &larr; Voltar
            </a>
          </div>
        </div>

        {/* Tabela de Inventário */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Património</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conservação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itens.length > 0 ? (
                itens.map((item) => {
                  const isDesativado = item.status === 'DESATIVADO';

                  return (
                    <tr key={item.patrimonio_id} className="align-middle">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {item.patrimonio_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase text-xs font-semibold">
                        {item.categoria}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">
                        {item.descricao || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.estado_conservacao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                        {item.localizacao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'ATIVO' ? 'bg-green-100 text-green-800' :
                          item.status === 'EMPRESTADO' ? 'bg-purple-100 text-purple-800' :
                          item.status === 'EM_MANUTENCAO' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'EM_INSPECAO' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <a
                          href={`/equipamentos?categoria=${categoriaFiltro}&detalhes=${item.patrimonio_id}`}
                          className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1.5 rounded hover:bg-gray-300 transition font-medium inline-block"
                        >
                          Detalhes
                        </a>

                        {isDesativado ? (
                          <span className="text-xs text-gray-400 italic">Desativado</span>
                        ) : (
                          <a
                            href={`/equipamentos?categoria=${categoriaFiltro}&desativar=${item.patrimonio_id}`}
                            className="bg-red-100 text-red-700 text-xs px-2.5 py-1.5 rounded hover:bg-red-200 transition font-medium inline-block"
                          >
                            Desativar
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Nenhum item encontrado nesta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DE DETALHES PATRIMONIAIS */}
        {itemDetalhe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-left space-y-3">
              <h3 className="text-lg font-bold text-blue-800">Detalhes Fiscais e de Origem</h3>
              <p className="text-xs text-gray-500">Património: <strong className="text-gray-800">{itemDetalhe.patrimonio_id}</strong></p>

              <div className="bg-gray-50 p-3 rounded space-y-2 text-sm text-black">
                <p><strong>Data de Compra:</strong> {itemDetalhe.data_compra ? new Date(itemDetalhe.data_compra).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                <p><strong>Data de Recebimento:</strong> {itemDetalhe.data_recebimento ? new Date(itemDetalhe.data_recebimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                <p><strong>Origem do Recurso:</strong> <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-xs">{itemDetalhe.origem_recurso}</span></p>
                
                {itemDetalhe.nota_fiscal_pdf ? (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <a
                      href={itemDetalhe.nota_fiscal_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs font-semibold flex items-center gap-1"
                    >
                      📄 Ver PDF da Nota Fiscal Anexado
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-red-500 font-semibold pt-2 border-t border-gray-200 mt-2">Nenhum PDF anexado.</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href={`/equipamentos?categoria=${categoriaFiltro}`}
                  className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 font-medium inline-block"
                >
                  Fechar
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE DESATIVAÇÃO (EXIGE 'LEI') */}
        {itemParaDesativar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-left space-y-4">
              <h3 className="text-lg font-bold text-red-700">Atenção: Desativar Item</h3>
              <p className="text-sm text-gray-600">
                O património <strong className="text-gray-900">{itemParaDesativar.patrimonio_id}</strong> será desativado permanentemente e não poderá mais ser alterado.
              </p>

              {erroDesativar && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
                  Palavra de confirmação incorreta. Digite exatamente <strong>LEI</strong> em maiúsculas.
                </div>
              )}

              <form action={desativarItemAction} className="space-y-4">
                <input type="hidden" name="patrimonio_id" value={itemParaDesativar.patrimonio_id} />

                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                  <label className="block text-xs font-bold text-red-800 mb-1">
                    Digite "LEI" em maiúsculas para confirmar:
                  </label>
                  <input
                    type="text"
                    name="confirmacao"
                    required
                    placeholder="Digite LEI..."
                    className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono outline-none text-black bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <a
                    href={`/equipamentos?categoria=${categoriaFiltro}`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded inline-flex items-center"
                  >
                    Cancelar
                  </a>

                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition shadow"
                  >
                    Confirmar Desativação
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}