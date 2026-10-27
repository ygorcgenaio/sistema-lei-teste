'use server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ResultSetHeader } from 'mysql2';

const texto = (form: FormData, chave: string) => String(form.get(chave) || '').trim();
const opcional = (form: FormData, chave: string) => texto(form, chave) || null;
export async function cadastrarItemAction(formData: FormData) {
  const codigo = texto(formData, 'codigo_lei');
  const patrimonio = opcional(formData, 'patrimonio');
  const categoria = Number(texto(formData, 'categoria_id'));
  const tipo = Number(texto(formData, 'tipo_item_id'));
  const descricao = texto(formData, 'descricao');
  const conservacao = texto(formData, 'estado_conservacao') || 'BOM';
  const status = texto(formData, 'status') || 'DISPONIVEL';
  const origem = opcional(formData, 'origem_aquisicao');
  const dataCompra = opcional(formData, 'data_compra');
  const dataRecebimento = opcional(formData, 'data_recebimento_lei');
  if (!codigo || !descricao || !Number.isInteger(categoria) || categoria <= 0 || !Number.isInteger(tipo) || tipo <= 0) return { erro: 'Preencha o código LEI, a descrição, a categoria e o tipo.' };
  if (!['NOVO','BOM','REGULAR','RUIM'].includes(conservacao)) return { erro: 'Estado de conservação inválido.' };
  if (!['DISPONIVEL','RESERVADO','EMPRESTADO','EM_MANUTENCAO','INSERVIVEL','BAIXADO'].includes(status)) return { erro: 'Status inválido.' };
  if (origem && !['RECURSOS_UFF','RECURSOS_LEI','PROJETO','DOACAO','CESSAO','OUTRO'].includes(origem)) return { erro: 'Origem de aquisição inválida.' };
  if ((dataCompra && !/^\d{4}-\d{2}-\d{2}$/.test(dataCompra)) || (dataRecebimento && !/^\d{4}-\d{2}-\d{2}$/.test(dataRecebimento)) || (dataCompra && dataRecebimento && dataRecebimento < dataCompra)) return { erro: 'Verifique as datas de compra e recebimento.' };
  const arquivo = formData.get('pdf_file');
  if (arquivo instanceof File && arquivo.size) {
    if (arquivo.type !== 'application/pdf' || !arquivo.name.toLowerCase().endsWith('.pdf')) return { erro: 'Anexe somente arquivos PDF.' };
    if (arquivo.size > 5 * 1024 * 1024) return { erro: 'O PDF deve ter até 5 MB.' };
  }
  const conn = await db.getConnection();
  let arquivoFisico: string | null = null;
  try {
    await conn.beginTransaction();
    const [tipos]: any = await conn.query('SELECT id,nome FROM tipos_itens WHERE id=? AND categoria_id=? AND ativo=1', [tipo,categoria]);
    if (!tipos.length) { await conn.rollback(); return { erro: 'Tipo inválido para a categoria selecionada.' }; }
    let arquivoUrl: string | null = null;
    if (arquivo instanceof File && arquivo.size) {
      const pasta = path.join(process.cwd(),'public','uploads');
      await mkdir(pasta,{recursive:true});
      const nome = `${randomUUID()}.pdf`;
      arquivoFisico = path.join(pasta,nome);
      await writeFile(arquivoFisico, Buffer.from(await arquivo.arrayBuffer()));
      arquivoUrl = `/uploads/${nome}`;
    }
    const [resultado] = await conn.execute<ResultSetHeader>(`INSERT INTO itens (codigo_lei,patrimonio,categoria_id,tipo_item_id,descricao,marca,modelo,numero_serie,data_compra,data_recebimento_lei,origem_aquisicao,projeto_origem,numero_nota_fiscal,arquivo_nota_fiscal,localizacao_atual,status,estado_conservacao,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [codigo,patrimonio,categoria,tipo,descricao,opcional(formData,'marca'),opcional(formData,'modelo'),opcional(formData,'numero_serie'),dataCompra,dataRecebimento,origem,opcional(formData,'projeto_origem'),opcional(formData,'numero_nota_fiscal'),arquivoUrl,texto(formData,'localizacao_atual') || 'LEI',status,conservacao,opcional(formData,'observacoes')]);
    if (['Notebook','Computador Desktop'].includes(tipos[0].nome)) {
      await conn.execute('INSERT INTO itens_computadores (item_id,processador,memoria_ram,armazenamento,sistema_operacional) VALUES (?,?,?,?,?)',[resultado.insertId,opcional(formData,'processador'),opcional(formData,'memoria_ram'),opcional(formData,'armazenamento'),opcional(formData,'sistema_operacional')]);
    }
    await conn.commit();
    revalidatePath('/itens'); revalidatePath('/notebooks'); revalidatePath('/');
    return { sucesso: true };
  } catch (e: any) {
    await conn.rollback();
    if (arquivoFisico) await unlink(arquivoFisico).catch(()=>{});
    console.error('Erro ao cadastrar item:',e);
    if (e?.code === 'ER_DUP_ENTRY') return { erro: 'Código LEI ou patrimônio já cadastrado.' };
    return { erro: 'Erro ao salvar item. Confira os dados e os logs do servidor.' };
  } finally { conn.release(); }
}

export async function baixarItemAction(formData: FormData) {
  const id = Number(formData.get('item_id'));
  if (!Number.isInteger(id) || id<=0 || String(formData.get('confirmacao')) !== 'LEI') return { erro: 'Confirmação inválida.' };
  const [resultado] = await db.execute<ResultSetHeader>(`UPDATE itens SET status='BAIXADO' WHERE id=? AND status NOT IN ('EMPRESTADO','EM_MANUTENCAO','BAIXADO')`,[id]);
  if (!resultado.affectedRows) return { erro: 'Não foi possível baixar este item. Verifique o status.' };
  revalidatePath('/itens'); revalidatePath('/');
  return { sucesso: true };
}
