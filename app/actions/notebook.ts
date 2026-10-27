'use server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export async function atualizarNotebookAction(form:FormData){
 const codigo=String(form.get('patrimonio_id')||'').trim();
 try {
 const [result]:any=await db.query('SELECT id FROM itens WHERE codigo_lei=?',[codigo]);
 if(!result.length)return {erro:'Item não encontrado.'};
 await db.query('UPDATE itens_computadores SET memoria_ram=?,armazenamento=?,softwares_instalados=? WHERE item_id=?',[String(form.get('memoria_ram')||'').trim()||null,String(form.get('armazenamento')||'').trim()||null,String(form.get('softwares_instalados')||'').trim()||null,result[0].id]);
 await db.query('UPDATE itens SET marca=?,modelo=? WHERE id=?',[String(form.get('marca')||'').trim()||null,String(form.get('modelo')||'').trim()||null,result[0].id]);
 revalidatePath('/notebooks');revalidatePath('/itens');return {sucesso:true};
 }catch(e){console.error(e);return {erro:'Falha ao atualizar notebook.'}}
}
