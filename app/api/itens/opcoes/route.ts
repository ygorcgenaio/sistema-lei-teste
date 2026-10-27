import { db } from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){
 try {
 const [categorias]=await db.query('SELECT id,nome FROM categorias_itens WHERE ativo=1 ORDER BY nome');
 const [tipos]=await db.query('SELECT id,categoria_id,nome FROM tipos_itens WHERE ativo=1 ORDER BY nome');
 return Response.json({categorias,tipos});
 }catch(e){console.error('Opções de itens:',e);return Response.json({erro:'Erro de banco'},{status:500});}
}
