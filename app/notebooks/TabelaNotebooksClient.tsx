'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { atualizarNotebookAction } from '@/app/actions/notebook';

export default function TabelaNotebooksClient({ dadosIniciais }: { dadosIniciais: any[] }) {
  const router = useRouter();
  const [linhaEmEdicao, setLinhaEmEdicao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // NOVO ESTADO: Controla a janelinha de visualização de softwares
  const [modalSoftwares, setModalSoftwares] = useState<{patrimonio_id: string, softwares: string} | null>(null);

  async function handleSalvarEdicao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await atualizarNotebookAction(formData);
    
    setLinhaEmEdicao(null);
    setLoading(false);
    router.refresh();
  }

  const inputEstilo = "w-full px-2 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-400";

  const limparValorPadrao = (valor: string) => valor === 'A preencher' ? '' : valor;

  const renderizarLeitura = (valor: string) => {
    if (!valor || valor === 'A preencher') {
      return <span className="text-gray-400 italic">A preencher</span>;
    }
    return valor;
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código LEI</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RAM</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Armazenamento</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Softwares</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dadosIniciais.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Nenhum notebook cadastrado nesta tabela.</td></tr>
          ) : (
            dadosIniciais.map((nb) => {
              const isEditando = linhaEmEdicao === nb.patrimonio_id;
              const formId = `form-edit-${nb.patrimonio_id}`;

              if (isEditando) {
                return (
                  <tr key={nb.patrimonio_id} className="bg-blue-50/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                      {nb.patrimonio_id}
                    </td>
                    <td className="px-2 py-2">
                      <input form={formId} type="text" name="marca" defaultValue={limparValorPadrao(nb.marca)} placeholder="Ex: Dell" required className={inputEstilo} />
                    </td>
                    <td className="px-2 py-2">
                      <input form={formId} type="text" name="modelo" defaultValue={limparValorPadrao(nb.modelo)} placeholder="Ex: Latitude 3420" required className={inputEstilo} />
                    </td>
                    <td className="px-2 py-2">
                      <input form={formId} type="text" name="memoria_ram" defaultValue={limparValorPadrao(nb.memoria_ram)} placeholder="Ex: 8GB DDR4" required className={inputEstilo} />
                    </td>
                    <td className="px-2 py-2">
                      <input form={formId} type="text" name="armazenamento" defaultValue={limparValorPadrao(nb.armazenamento)} placeholder="Ex: 256GB SSD" required className={inputEstilo} />
                    </td>
                    <td className="px-2 py-2">
                      <input form={formId} type="text" name="softwares_instalados" defaultValue={nb.softwares_instalados} placeholder="Ex: Office, AutoCAD" className={inputEstilo} />
                    </td>
                    <td className="px-2 py-2">
                      <span className="text-sm">{nb.status_notebook}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <form id={formId} onSubmit={handleSalvarEdicao} className="flex items-center justify-end gap-3">
                        <input type="hidden" name="patrimonio_id" value={nb.patrimonio_id} />
                        <button type="button" onClick={() => setLinhaEmEdicao(null)} className="text-xs font-semibold text-gray-500 hover:text-gray-800">
                          Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold shadow hover:bg-green-700 disabled:opacity-50">
                          {loading ? '...' : 'Salvar'}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={nb.patrimonio_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{nb.patrimonio_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{renderizarLeitura(nb.marca)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{renderizarLeitura(nb.modelo)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{renderizarLeitura(nb.memoria_ram)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{renderizarLeitura(nb.armazenamento)}</td>
                  
                  {/* NOVA COLUNA DE SOFTWARES COM BOTÃO */}
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {nb.softwares_instalados ? (
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[100px] text-gray-600" title={nb.softwares_instalados}>
                          {nb.softwares_instalados}
                        </span>
                        <button 
                          onClick={() => setModalSoftwares({ patrimonio_id: nb.patrimonio_id, softwares: nb.softwares_instalados })}
                          className="text-[10px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition whitespace-nowrap"
                        >
                          Exibir
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Nenhum</span>
                    )}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                      nb.status_notebook === 'DISPONIVEL' ? 'bg-green-100 text-green-800' :
                      nb.status_notebook === 'EMPRESTADO' ? 'bg-purple-100 text-purple-800' :
                      nb.status_notebook === 'REVISAO_TI' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {nb.status_notebook}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setLinhaEmEdicao(nb.patrimonio_id)} className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1.5 rounded transition">
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* JANELINHA FLUTUANTE (MODAL) DOS SOFTWARES */}
      {modalSoftwares && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-left whitespace-normal space-y-4">
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2">
              Softwares Instalados - {modalSoftwares.patrimonio_id}
            </h3>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {modalSoftwares.softwares}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalSoftwares(null)}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}