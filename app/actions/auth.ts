'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validarTokenGoogle } from '@/lib/auth/google';
import { autorizarLogin } from '@/lib/auth/usuarios-sistema';
import { SESSION_COOKIE, criarTokenSessao, opcoesCookieSessao } from '@/lib/auth/session';

type RespostaLogin = { ok: true } | { ok: false; titulo: string; mensagem: string };

// Mensagens definidas na LEI-002. Nenhuma expõe detalhe técnico.
const MSG_FALHA: RespostaLogin = {
  ok: false,
  titulo: 'Não foi possível realizar a autenticação.',
  mensagem:
    'Tente novamente. Caso o problema persista, entre em contato com a equipe responsável pelo SiGPatri.',
};

const MSG_SEM_PERMISSAO: RespostaLogin = {
  ok: false,
  titulo: 'Usuário sem permissão neste sistema.',
  mensagem:
    'Sua conta foi autenticada com sucesso, porém não possui autorização para acessar o SiGPatri. ' +
    'Entre em contato com a administração do LEI para solicitar acesso.',
};

const MSG_INATIVO: RespostaLogin = {
  ok: false,
  titulo: 'Acesso ao sistema desativado.',
  mensagem:
    'Sua conta está cadastrada no SiGPatri, porém o acesso encontra-se desativado. ' +
    'Entre em contato com a administração do LEI.',
};

// Recebe a credencial do Google enviada pelo navegador. A ÚNICA coisa em que confiamos
// vinda do navegador é esse token, e ele é conferido com o Google antes de qualquer decisão.
export async function loginComGoogleAction(credencial: string): Promise<RespostaLogin> {
  try {
    const identidade = await validarTokenGoogle(credencial);
    if (!identidade) {
      return MSG_FALHA;
    }

    const resultado = await autorizarLogin(identidade);

    if (!resultado.ok) {
      switch (resultado.motivo) {
        case 'NAO_CADASTRADO':
          return MSG_SEM_PERMISSAO;
        case 'INATIVO':
          return MSG_INATIVO;
        default:
          // E-mail não verificado ou divergência de identificador: mensagem genérica.
          return MSG_FALHA;
      }
    }

    const token = await criarTokenSessao(resultado.usuario.id);
    const armazenamento = await cookies();
    armazenamento.set(SESSION_COOKIE, token, opcoesCookieSessao);

    return { ok: true };
  } catch (erro) {
    // O detalhe vai só para o log do servidor; o usuário recebe a mensagem genérica.
    console.error('[auth] Erro inesperado no login:', erro);
    return MSG_FALHA;
  }
}

export async function logoutAction(): Promise<void> {
  const armazenamento = await cookies();
  armazenamento.delete(SESSION_COOKIE);
  redirect('/login');
}
