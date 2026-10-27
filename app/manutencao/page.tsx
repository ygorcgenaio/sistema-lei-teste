import { db } from '@/lib/db';
import TabelaManutencaoClient from './TabelaManutencaoClient';
export const dynamic='force-dynamic';
export default async function Page(){
 const [rows]:any=await db.query('SELECT m.*,i.codigo_lei AS patrimonio_id FROM manutencoes_itens m JOIN itens i ON i.id=m.item_id ORDER BY m.data_entrada DESC');
 return <main className="min-h-screen bg-gray-100 p-8"><div className="max-w-7xl mx-auto"><div className="flex justify-between mb-6"><h1 className="text-2xl font-bold text-blue-900">Manutenção</h1><div className="flex gap-3"><a href="/manutencao/novo" className="bg-orange-700 text-white px-4 py-2 rounded">Nova manutenção</a><a href="/" className="text-blue-700">Voltar</a></div></div><div className="bg-white rounded shadow overflow-x-auto"><TabelaManutencaoClient manutencoes={rows}/></div></div></main>;
}
