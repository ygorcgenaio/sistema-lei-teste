import { db } from '@/lib/db';
import TabelaEmprestimosClient from './TabelaEmprestimosClient';
export const dynamic='force-dynamic';
export default async function Page(){
 const [rows]:any=await db.query('SELECT e.*,i.codigo_lei AS patrimonio_id FROM emprestimos_itens e JOIN itens i ON i.id=e.item_id ORDER BY e.data_emprestimo DESC');
 return <main className="min-h-screen bg-gray-100 p-8"><div className="max-w-7xl mx-auto"><div className="flex justify-between mb-6"><h1 className="text-2xl font-bold text-blue-900">Empréstimos</h1><div className="flex gap-3"><a href="/emprestimos/novo" className="bg-blue-700 text-white px-4 py-2 rounded">Novo empréstimo</a><a href="/" className="text-blue-700">Voltar</a></div></div><div className="bg-white rounded shadow overflow-x-auto"><TabelaEmprestimosClient emprestimos={rows}/></div></div></main>;
}
