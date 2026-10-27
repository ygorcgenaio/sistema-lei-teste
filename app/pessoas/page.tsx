export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

export default async function PessoasPage() {
  let pessoas: any[] = [];

  try {
    // Atenção: A buscar dados na nova tabela 'usuarios'
    const [rows]: any = await db.query('SELECT * FROM usuarios ORDER BY id DESC');
    pessoas = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Gestão de Pessoas</h1>
            <p className="text-gray-600">Alunos, Professores e Servidores</p>
          </div>
          
          <div className="flex gap-3">
            <a href="/pessoas/novo" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium shadow inline-block">
              + Cadastrar Pessoa
            </a>
            <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-medium shadow inline-block">
              &larr; Voltar
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matrícula</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pessoas.length > 0 ? (
                pessoas.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.matricula || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.telefone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {p.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Nenhuma pessoa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}