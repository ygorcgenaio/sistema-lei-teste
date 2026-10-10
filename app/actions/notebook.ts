'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function atualizarNotebookAction(formData: FormData) {
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const marca = formData.get('marca') as string;
  const modelo = formData.get('modelo') as string;
  const memoria_ram = formData.get('memoria_ram') as string;
  const armazenamento = formData.get('armazenamento') as string;
  const softwares_instalados = formData.get('softwares_instalados') as string;
  const status_notebook = formData.get('status_notebook') as string;

  try {
    await db.query(
      `UPDATE notebook 
       SET marca = ?, modelo = ?, memoria_ram = ?, armazenamento = ?, softwares_instalados = ?, status_notebook = ? 
       WHERE patrimonio_id = ?`,
      [marca, modelo, memoria_ram, armazenamento, softwares_instalados, status_notebook, patrimonio_id]
    );
    
    revalidatePath('/notebooks');
    return { sucesso: true };
  } catch (error) {
    console.error('Erro ao atualizar notebook:', error);
    return { erro: 'Erro ao atualizar os dados do notebook.' };
  }
}