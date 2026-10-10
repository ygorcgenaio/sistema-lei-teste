'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// AÇÃO 1: Entrada manual em manutenção
export async function criarManutencaoAction(formData: FormData) {
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const responsavel = formData.get('responsavel') as string;
  const diagnostico = formData.get('diagnostico') as string;

  if (!patrimonio_id) return { erro: 'O Património é obrigatório.' };

  try {
    const [item]: any = await db.query(
      'SELECT status FROM inventario_lei WHERE patrimonio_id = ?',
      [patrimonio_id]
    );

    if (!item || item.length === 0) return { erro: 'Património não encontrado.' };
    if (item[0].status === 'DESATIVADO') return { erro: 'Este item está desativado.' };

    // Insere na tabela de manutenção
    await db.query(
      `INSERT INTO manutencao (patrimonio_id, responsavel, diagnostico, status_manutencao)
       VALUES (?, ?, ?, 'EM_MANUTENCAO')`,
      [patrimonio_id, responsavel || 'EQUIPE_TI', diagnostico || null]
    );

    // Bloqueia o item no inventário
    await db.query("UPDATE inventario_lei SET status = 'EM_MANUTENCAO' WHERE patrimonio_id = ?", [patrimonio_id]);
    await db.query("UPDATE notebook SET status_notebook = 'EM_MANUTENCAO' WHERE patrimonio_id = ?", [patrimonio_id]);

    revalidatePath('/manutencao');
    revalidatePath('/equipamentos');
    revalidatePath('/notebooks');
    
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao criar manutenção:', error);
    return { erro: 'Erro interno ao registar a manutenção.' };
  }
}

// AÇÃO 2: Terminar a manutenção e registar o reparo
export async function concluirManutencaoAction(formData: FormData) {
  const manutencao_id = formData.get('manutencao_id') as string;
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const reparo_feito = formData.get('reparo_feito') as string;

  if (!manutencao_id || !patrimonio_id) return { erro: 'Dados insuficientes.' };

  try {
    // 1. Encerra a manutenção e regista o reparo e a data de fim
    await db.query(
      `UPDATE manutencao 
       SET status_manutencao = 'CONCLUIDO', data_fim = CURRENT_TIMESTAMP, reparo_feito = ? 
       WHERE id = ?`,
      [reparo_feito || 'Sem reparo especificado', manutencao_id]
    );

    // 2. Devolve o item ao status normal (se estiver estragado, o operador desativa-o depois no inventário)
    await db.query("UPDATE inventario_lei SET status = 'ATIVO' WHERE patrimonio_id = ?", [patrimonio_id]);
    await db.query("UPDATE notebook SET status_notebook = 'DISPONIVEL' WHERE patrimonio_id = ?", [patrimonio_id]);

    revalidatePath('/manutencao');
    revalidatePath('/equipamentos');
    revalidatePath('/notebooks');

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao concluir manutenção:', error);
    return { erro: 'Erro interno ao processar a conclusão.' };
  }
}