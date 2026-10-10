'use client';

import { useState } from 'react';
import BotaoDevolucao from '../components/BotaoDevolucao';

export default function TabelaEmprestimosClient({ emprestimos }: { emprestimos: any[] }) {
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'concluidos'>('todos');

  // Filtra os dados com base no botão selecionado
  const emprestimosFiltrados = emprestimos.filter((emp) => {
    if (filtro === 'ativos') return emp.status_devolucao === 'EM_ANDAMENTO';
    if (filtro === 'concluidos') return emp.status_devolucao === 'CONCLUIDO';
    return true; // 'todos'
  });

  return (
    <div className="space-y-4">
      {/* BOTÕES DE FILTRO */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm w-fit">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'todos' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('ativos')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'ativos' ? 'bg-purple-100 text-purple-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Ativos (Em Andamento)
        </button>
        <button
          onClick={() => setFiltro('concluidos')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'concluidos' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Concluídos
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Património</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requisitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Requisição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {emprestimosFiltrados.length > 0 ? (
              emprestimosFiltrados.map((emp) => {
                const isDevolvido = emp.status_devolucao === 'CONCLUIDO';

                return (
                  <tr key={emp.id} className="align-middle hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{emp.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {emp.patrimonio_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {emp.nome_requisitante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(emp.data_emprestimo).toLocaleDateString('pt-BR')}
                      <span className="text-xs text-gray-400 ml-1">
                        {new Date(emp.data_emprestimo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={emp.observacao}>
                      {emp.observacao || <span className="text-gray-400 italic">Nenhuma</span>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isDevolvido ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {emp.status_devolucao === 'EM_ANDAMENTO' ? 'ATIVO' : 'CONCLUÍDO'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isDevolvido ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400 italic">Devolvido</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(emp.data_devolucao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ) : (
                        <BotaoDevolucao
                          emprestimo={{
                            id: emp.id,
                            patrimonio_id: emp.patrimonio_id,
                            nome_requisitante: emp.nome_requisitante
                          }}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum empréstimo encontrado para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}