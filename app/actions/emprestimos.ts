'use server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export async function criarEmprestimoAction(form:FormData){
 const codigo=String(form.get('patrimonio_id')||'').trim(), nome=String(form.get('nome_requisitante')||'').trim();
 if(!codigo||!nome)return {erro:'Código LEI e requisitante são obrigatórios.'};
 const conn=await db.getConnection();
 try {await conn.beginTransaction();
 const [rows]:any=await conn.query('SELECT id,status FROM itens WHERE codigo_lei=? FOR UPDATE',[codigo]);
 if(!rows.length){await conn.rollback();return {erro:'Código LEI não encontrado.'};}
 if(rows[0].status!=='DISPONIVEL'){await conn.rollback();return {erro:`Item indisponível: ${rows[0].status}`};}
 await conn.query("INSERT INTO emprestimos_itens(item_id,nome_requisitante) VALUES(?,?)",[rows[0].id,nome]);
 await conn.query("UPDATE itens SET status='EMPRESTADO' WHERE id=?",[rows[0].id]);
 await conn.commit();revalidatePath('/itens');revalidatePath('/emprestimos');revalidatePath('/');return {sucesso:true};
 }catch(e){await conn.rollback();console.error(e);return {erro:'Não foi possível criar o empréstimo.'}}finally{conn.release()}
}
export async function devolverEquipamentoAction(form:FormData){
 const id=Number(form.get('emprestimo_id')), codigo=String(form.get('patrimonio_id')||'').trim(),obs=String(form.get('observacao')||'').trim();
 const conn=await db.getConnection();
 try {await conn.beginTransaction();
 const [rows]:any=await conn.query("SELECT e.item_id FROM emprestimos_itens e JOIN itens i ON i.id=e.item_id WHERE e.id=? AND i.codigo_lei=? AND e.status_devolucao='EM_ANDAMENTO' FOR UPDATE",[id,codigo]);
 if(!rows.length){await conn.rollback();return {erro:'Empréstimo não encontrado ou já concluído.'};}
 const itemId=rows[0].item_id;
 await conn.query("UPDATE emprestimos_itens SET status_devolucao='CONCLUIDO', data_devolucao=NOW(),observacao=? WHERE id=?",[obs||null,id]);
 await conn.query("UPDATE itens SET status='EM_MANUTENCAO' WHERE id=?",[itemId]);
 await conn.query("INSERT INTO manutencoes_itens(item_id,status_manutencao,responsavel,diagnostico) VALUES(?,'EM_INSPECAO','EQUIPE_TI',?)",[itemId,`Inspeção pós-devolução. ${obs}`]);
 await conn.commit();for(const ruta of ['/itens','/emprestimos','/manutencao','/'])revalidatePath(ruta);return {sucesso:true};
 }catch(e){await conn.rollback();console.error(e);return {erro:'Erro ao processar devolução.'}}finally{conn.release()}
}
