'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 1. Ação para buscar utilizador pela matrícula (usada no empréstimo)
export async function buscarUsuarioPorMatriculaAction(matricula: string) {
  if (!matricula) return { erro: 'Matrícula não fornecida' };

  try {
    const [rows]: any = await db.query(
      'SELECT nome FROM usuarios WHERE matricula = ? LIMIT 1',
      [matricula]
    );

    if (rows && rows.length > 0) {
      return { nome: rows[0].nome };
    }
    
    return { erro: 'Matrícula não encontrada.' };
  } catch (error) {
    console.error('Erro ao buscar utilizador:', error);
    return { erro: 'Erro interno na base de dados.' };
  }
}

// 2. Ação para cadastrar novo utilizador (usada na página de pessoas)
export async function cadastrarUsuarioAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const matricula = formData.get('matricula') as string;
  const telefone = formData.get('telefone') as string;
  const role = formData.get('role') as string;

  if (!nome || !email) {
    return { erro: 'Nome e Email são obrigatórios.' };
  }

  try {
    await db.query(
      `INSERT INTO usuarios (nome, email, matricula, telefone, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, matricula || null, telefone || null, role || 'OUTROS']
    );

    revalidatePath('/pessoas');
    
    return { sucesso: true };
  } catch (error: any) {
    console.error('Erro ao cadastrar utilizador:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { erro: 'Este email já está registado no sistema.' };
    }
    return { erro: 'Erro interno ao salvar no banco de dados.' };
  }
}