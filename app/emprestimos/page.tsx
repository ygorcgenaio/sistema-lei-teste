import { db } from '@/lib/db';
import TabelaEmprestimosClient from './TabelaEmprestimosClient';

export default async function EmprestimosPage() {
  let emprestimos: any[] = [];

  try {
    // Busca todos os empréstimos ordenados pelos mais recentes
    const [rows]: any = await db.query(
      'SELECT * FROM emprestimos ORDER BY data_emprestimo DESC'
    );
    emprestimos = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Gestão de Empréstimos</h1>
            <p className="text-gray-600">Controlo de requisições e devoluções de equipamentos</p>
          </div>
          
          <div className="flex gap-3">
            <a
              href="/emprestimos/novo"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium shadow inline-block"
            >
              + Novo Empréstimo
            </a>
            <a
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-medium shadow inline-block"
            >
              &larr; Voltar ao Início
            </a>
          </div>
        </div>

        {/* COMPONENTE CLIENTE COM A TABELA E OS FILTROS */}
        <TabelaEmprestimosClient emprestimos={emprestimos} />
        
      </div>
    </div>
  );
}