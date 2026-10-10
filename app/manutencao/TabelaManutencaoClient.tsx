'use client';

import { useState } from 'react';
import BotaoConcluirManutencao from '../components/BotaoConcluirManutencao';

export default function TabelaManutencaoClient({ manutencoes }: { manutencoes: any[] }) {
  const [filtro, setFiltro] = useState<'todos' | 'andamento' | 'concluido'>('todos');

  // Filtra os dados com base no botão selecionado
  const manutencoesFiltradas = manutencoes.filter((man) => {
    if (filtro === 'andamento') return man.status_manutencao !== 'CONCLUIDO';
    if (filtro === 'concluido') return man.status_manutencao === 'CONCLUIDO';
    return true; // 'todos'
  });

  return (
    <div className="space-y-4">
      {/* BOTÕES DE FILTRO */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm w-fit">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'todos' ? 'bg-orange-100 text-orange-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('andamento')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'andamento' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Em Andamento
        </button>
        <button
          onClick={() => setFiltro('concluido')}
          className={`px-4 py-2 text-sm font-bold rounded-md transition ${
            filtro === 'concluido' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Património</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Entrada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnóstico / Reparo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {manutencoesFiltradas.length > 0 ? (
              manutencoesFiltradas.map((man) => {
                const isConcluido = man.status_manutencao === 'CONCLUIDO';

                return (
                  <tr key={man.id} className="align-top hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{man.patrimonio_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(man.data_entrada).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {man.responsavel.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 min-w-[250px]">
                      <div className="mb-2">
                        <span className="font-bold text-xs text-gray-500 uppercase">Diagnóstico:</span>
                        <p className="mt-0.5">{man.diagnostico || <span className="italic text-gray-400">Nenhum</span>}</p>
                      </div>
                      {isConcluido && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="font-bold text-xs text-green-600 uppercase">Reparo Feito:</span>
                          <p className="mt-0.5 text-gray-800 font-medium">{man.reparo_feito}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isConcluido ? 'bg-green-100 text-green-800' : 
                        man.status_manutencao === 'EM_INSPECAO' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {man.status_manutencao.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isConcluido ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-400 italic">Concluído</span>
                          <span className="text-[10px] text-gray-400">{new Date(man.data_fim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      ) : (
                        <BotaoConcluirManutencao manutencao={{ id: man.id, patrimonio_id: man.patrimonio_id }} />
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Nenhum registo de manutenção encontrado para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}