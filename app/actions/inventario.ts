'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function cadastrarItemAction(formData: FormData) {
  const patrimonio_id = formData.get('patrimonio_id') as string;
  const categoria = formData.get('categoria') as string;
  const descricao = formData.get('descricao') as string;
  const estado_conservacao = formData.get('estado_conservacao') as string;
  const data_compra = formData.get('data_compra') as string;
  const data_recebimento = formData.get('data_recebimento') as string;
  const origem_recurso = formData.get('origem_recurso') as string;
  const pdfFile = formData.get('pdf_file') as File;

  let pdfUrl = null;

  try {
    // 1. VERIFICAÇÃO DE DUPLICIDADE
    const [existente]: any = await db.query(
      'SELECT patrimonio_id FROM inventario_lei WHERE patrimonio_id = ?',
      [patrimonio_id]
    );

    if (existente && existente.length > 0) {
      return { erro: `O patrimônio "${patrimonio_id}" já está cadastrado no sistema.` };
    }

    // 2. PROCESSAMENTO DO PDF DA NOTA FISCAL
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.type !== 'application/pdf') {
        return { erro: 'O arquivo enviado não é um PDF válido.' };
      }

      const maxSize = 5 * 1024 * 1024;
      if (pdfFile.size > maxSize) {
        return { erro: 'O PDF é muito grande. O limite é 5MB.' };
      }

      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      pdfUrl = `/uploads/${fileName}`;
    }

    // 3. INSERÇÃO NO INVENTÁRIO GERAL
    await db.query(
      `INSERT INTO inventario_lei 
       (patrimonio_id, categoria, descricao, estado_conservacao, localizacao, status, data_compra, data_recebimento, origem_recurso, nota_fiscal_pdf)
       VALUES (?, ?, ?, ?, 'LEI', 'ATIVO', ?, ?, ?, ?)`,
      [patrimonio_id, categoria, descricao, estado_conservacao, data_compra, data_recebimento, origem_recurso, pdfUrl]
    );

    // 4. CRIAÇÃO AUTOMÁTICA DA FICHA TÉCNICA (SE FOR NOTEBOOK)
    if (categoria === 'notebook') {
      await db.query(
        `INSERT INTO notebook 
         (patrimonio_id, marca, modelo, memoria_ram, armazenamento, softwares_instalados, status_notebook)
         VALUES (?, 'A preencher', 'A preencher', 'A preencher', 'A preencher', '', 'DISPONIVEL')`,
        [patrimonio_id]
      );
    }

    // Revalida ambas as páginas para que as listas atualizem imediatamente
    revalidatePath('/equipamentos');
    revalidatePath('/notebooks');
    
    return { sucesso: true };
    
  } catch (error) {
    console.error('Erro ao cadastrar item:', error);
    return { erro: 'Ocorreu um erro interno no servidor ao tentar salvar o item.' };
  }
}