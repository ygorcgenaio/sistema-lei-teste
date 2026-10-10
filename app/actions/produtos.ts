'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function excluirProdutoAdminAction(formData: FormData) {
  const n_patrimonio = formData.get('n_patrimonio');
  const userCargo = formData.get('user_cargo'); // Veio do cookie HTTP-Only / Sessão

  // Validação no servidor: Apenas ADMIN pode excluir
  if (userCargo !== 'ADMIN') {
    console.error('Acesso negado: Apenas a Administração Geral pode excluir produtos.');
    return;
  }

  try {
    // O CASCADE do MariaDB remove automaticamente os registros em tipo_produto e equipamento_ti
    await db.query('DELETE FROM produto WHERE n_patrimonio = ?', [n_patrimonio]);

    revalidatePath('/equipamentos');
    revalidatePath('/');
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
  }
}