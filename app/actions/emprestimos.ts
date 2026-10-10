'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 1. Ação para CRIAR um empréstimo
export async function criarEmprestimoAction(formData: FormData) {
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const nome_requisitante = formData.get('nome_requisitante') as string;

  if (!patrimonio_id || !nome_requisitante) {
    return { erro: 'Património e Nome do Requisitante são obrigatórios.' };
  }

  try {
    const [item]: any = await db.query(
      'SELECT status FROM inventario_lei WHERE patrimonio_id = ?',
      [patrimonio_id]
    );

    if (!item || item.length === 0) {
      return { erro: 'Património não encontrado no inventário.' };
    }

    if (item[0].status !== 'ATIVO') {
      return { erro: `O item não está disponível para empréstimo. Status atual: ${item[0].status}.` };
    }

    await db.query(
      `INSERT INTO emprestimos (patrimonio_id, nome_requisitante, status_devolucao)
       VALUES (?, ?, 'EM_ANDAMENTO')`,
      [patrimonio_id, nome_requisitante]
    );

    await db.query(
      "UPDATE inventario_lei SET status = 'EMPRESTADO' WHERE patrimonio_id = ?",
      [patrimonio_id]
    );

    await db.query(
      "UPDATE notebook SET status_notebook = 'EMPRESTADO' WHERE patrimonio_id = ?",
      [patrimonio_id]
    );

    revalidatePath('/');
    revalidatePath('/equipamentos');
    revalidatePath('/notebooks');
    
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    return { erro: 'Erro ao registar o empréstimo no banco de dados.' };
  }
}

// 2. Ação para DEVOLVER um equipamento (AGORA COM INTEGRAÇÃO À MANUTENÇÃO)
export async function devolverEquipamentoAction(formData: FormData) {
  const emprestimo_id = formData.get('emprestimo_id') as string;
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const observacao = formData.get('observacao') as string;

  if (!emprestimo_id || !patrimonio_id) {
    return { erro: 'Dados insuficientes para realizar a devolução.' };
  }

  try {
    // 1. Encerra o empréstimo
    await db.query(
      `UPDATE emprestimos 
       SET status_devolucao = 'CONCLUIDO', data_devolucao = CURRENT_TIMESTAMP, observacao = ? 
       WHERE id = ?`,
      [observacao || null, emprestimo_id]
    );

    // 2. Atualiza inventário geral para EM_INSPECAO
    await db.query(
      "UPDATE inventario_lei SET status = 'EM_INSPECAO' WHERE patrimonio_id = ?",
      [patrimonio_id]
    );

    // 3. Atualiza tabela de notebooks (se existir) para REVISAO_TI
    await db.query(
      "UPDATE notebook SET status_notebook = 'REVISAO_TI' WHERE patrimonio_id = ?",
      [patrimonio_id]
    );

    // 4. NOVO: Cria registo automático na tabela de manutenção
    const diagnosticoInicial = observacao 
      ? `Inspeção automática pós-devolução. Observação do empréstimo: ${observacao}` 
      : `Inspeção automática pós-devolução.`;

    await db.query(
      `INSERT INTO manutencao (patrimonio_id, status_manutencao, responsavel, diagnostico)
       VALUES (?, 'EM_INSPECAO', 'EQUIPE_TI', ?)`,
      [patrimonio_id, diagnosticoInicial]
    );

    // Atualiza as páginas
    revalidatePath('/');
    revalidatePath('/emprestimos');
    revalidatePath('/notebooks');
    revalidatePath('/equipamentos');
    revalidatePath('/manutencao'); // Caso já tenha a página de manutenção criada

    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao devolver equipamento:', error);
    return { erro: 'Erro interno ao processar a devolução e gerar a inspeção.' };
  }
}