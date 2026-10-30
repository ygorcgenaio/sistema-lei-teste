import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, lerTokenSessao } from '@/lib/auth/session';
import { buscarUsuarioAtivoPorId, type UsuarioSistema } from '@/lib/auth/usuarios-sistema';

// Quem está logado agora? Lê o cookie assinado e CONSULTA O BANCO a cada chamada.
// Por isso, um usuário inativado perde o acesso na hora, mesmo com sessão antiga.
// Devolve null se não houver sessão válida ou se o usuário estiver inativo.
export async function obterUsuarioAtual(): Promise<UsuarioSistema | null> {
  const armazenamento = await cookies();
  const usuarioId = await lerTokenSessao(armazenamento.get(SESSION_COOKIE)?.value);

  if (!usuarioId) {
    return null;
  }

  return buscarUsuarioAtivoPorId(usuarioId);
}

// Para páginas e ações que exigem login: sem usuário válido, vai para a tela de login.
export async function exigirUsuario(): Promise<UsuarioSistema> {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    redirect('/login');
  }

  return usuario;
}
