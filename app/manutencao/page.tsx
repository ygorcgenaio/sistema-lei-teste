import { db } from '@/lib/db';
import TabelaManutencaoClient from './TabelaManutencaoClient';

export default async function ManutencaoPage() {
  let manutencoes: any[] = [];

  try {
    // Busca todos os registos uma única vez
    const [rows]: any = await db.query('SELECT * FROM manutencao ORDER BY data_entrada DESC');
    manutencoes = Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Controle de Manutenção</h1>
            <p className="text-gray-600">Acompanhamento técnico e inspeção de equipamentos</p>
          </div>
          
          <div className="flex gap-3">
            <a href="/manutencao/novo" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition text-sm font-medium shadow inline-block">
              + Registar Manutenção
            </a>
            <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition text-sm font-medium shadow inline-block">
              &larr; Voltar
            </a>
          </div>
        </div>

        {/* COMPONENTE CLIENTE COM A TABELA E OS FILTROS */}
        <TabelaManutencaoClient manutencoes={manutencoes} />

      </div>
    </div>
  );
}