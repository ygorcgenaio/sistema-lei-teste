import { db } from '@/lib/db';
import TabelaNotebooksClient from './TabelaNotebooksClient';

export default async function NotebooksPage() {
  let notebooks: any[] = [];

  try {
    const [rows]: any = await db.query('SELECT * FROM notebook ORDER BY patrimonio_id DESC');
    notebooks = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Erro ao consultar notebooks:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Fichas Técnicas - Notebooks</h1>
            <p className="text-gray-600 text-sm mt-1">Gerencie as especificações de hardware e software</p>
          </div>
          <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-medium shadow">
            &larr; Voltar ao Início
          </a>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {/* O componente cliente gerencia o estado de edição das linhas */}
          <TabelaNotebooksClient dadosIniciais={notebooks} />
        </div>
      </div>
    </div>
  );
}