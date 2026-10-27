import { db } from '@/lib/db';
import TabelaNotebooksClient from './TabelaNotebooksClient';
export const dynamic='force-dynamic';
export default async function Page(){
 const [rows]:any=await db.query(`SELECT i.codigo_lei AS patrimonio_id,i.marca,i.modelo,i.status AS status_notebook,c.memoria_ram,c.armazenamento,c.softwares_instalados FROM itens i JOIN itens_computadores c ON c.item_id=i.id JOIN tipos_itens t ON t.id=i.tipo_item_id WHERE t.nome='Notebook' ORDER BY i.id DESC`);
 return <main className="min-h-screen bg-gray-100 p-8"><div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-6"><h1 className="text-2xl text-blue-900 font-bold">Notebooks</h1><a href="/itens" className="text-blue-700 underline">Inventário</a></div><div className="bg-white rounded shadow overflow-x-auto"><TabelaNotebooksClient dadosIniciais={rows}/></div></div></main>;
}
