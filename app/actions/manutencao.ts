'use server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export async function criarManutencaoAction(form:FormData){
 const codigo=String(form.get('patrimonio_id')||'').trim(),resp=String(form.get('responsavel')||'EQUIPE_TI'),diagnostico=String(form.get('diagnostico')||'').trim();
 if(!codigo)return {erro:'Informe o código LEI.'};
 if(!['EQUIPE_TI','AUTORIZADA','OUTRO'].includes(resp))return {erro:'Responsável inválido.'};
 const conn=await db.getConnection();try{await conn.beginTransaction();
 const [rows]:any=await conn.query('SELECT id,status FROM itens WHERE codigo_lei=? FOR UPDATE',[codigo]);
 if(!rows.length){await conn.rollback();return {erro:'Item não encontrado.'};}
 if(rows[0].status!=='DISPONIVEL'){await conn.rollback();return {erro:`Item indisponível: ${rows[0].status}`};}
 await conn.query("INSERT INTO manutencoes_itens(item_id,responsavel,diagnostico) VALUES(?,?,?)",[rows[0].id,resp,diagnostico||null]);
 await conn.query("UPDATE itens SET status='EM_MANUTENCAO' WHERE id=?",[rows[0].id]);await conn.commit();
 for(const r of ['/itens','/manutencao','/'])revalidatePath(r);return {sucesso:true};
 }catch(e){await conn.rollback();console.error(e);return {erro:'Erro ao registrar manutenção.'}}finally{conn.release()}
}
export async function concluirManutencaoAction(form:FormData){
 const id=Number(form.get('manutencao_id'));const codigo=String(form.get('patrimonio_id')||'').trim(),reparo=String(form.get('reparo_feito')||'').trim();
 const conn=await db.getConnection();try{await conn.beginTransaction();
 const [rows]:any=await conn.query("SELECT m.item_id FROM manutencoes_itens m JOIN itens i ON i.id=m.item_id WHERE m.id=? AND i.codigo_lei=? AND m.status_manutencao<>'CONCLUIDO' FOR UPDATE",[id,codigo]);
 if(!rows.length){await conn.rollback();return {erro:'Manutenção não encontrada ou já concluída.'};}
 await conn.query("UPDATE manutencoes_itens SET status_manutencao='CONCLUIDO',data_fim=NOW(),reparo_feito=? WHERE id=?",[reparo||'Sem reparo informado',id]);
 const [abertas]:any=await conn.query("SELECT COUNT(*) AS total FROM manutencoes_itens WHERE item_id=? AND status_manutencao<>'CONCLUIDO'",[rows[0].item_id]);
 if(Number(abertas[0].total)===0)await conn.query("UPDATE itens SET status='DISPONIVEL' WHERE id=? AND status='EM_MANUTENCAO'",[rows[0].item_id]);
 await conn.commit();for(const r of ['/itens','/manutencao','/'])revalidatePath(r);return {sucesso:true};
 }catch(e){await conn.rollback();console.error(e);return {erro:'Erro ao concluir manutenção.'}}finally{conn.release()}
}
