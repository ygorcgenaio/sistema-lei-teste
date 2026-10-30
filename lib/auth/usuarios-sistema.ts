import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '@/lib/db';
import type { IdentidadeGoogle } from '@/lib/auth/google';

export const PERFIS = ['ADMINISTRADOR', 'TI', 'OPERADOR', 'CONSULTA'] as const;
export type Perfil = (typeof PERFIS)[number];

export type UsuarioSistema = {
  id: number;
  googleSub: string | null;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  primeiroAcessoEm: Date | null;
};

type LinhaUsuario = RowDataPacket & {
  id: number;
  google_sub: string | null;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo: number;
  primeiro_acesso_em: Date | null;
};

const COLUNAS = 'id, google_sub, nome, email, perfil, ativo, primeiro_acesso_em';

function paraUsuario(linha: LinhaUsuario): UsuarioSistema {
  return {
    id: Number(linha.id),
    googleSub: linha.google_sub,
    nome: linha.nome,
    email: linha.email,
    perfil: linha.perfil,
    ativo: Boolean(linha.ativo),
    primeiroAcessoEm: linha.primeiro_acesso_em,
  };
}

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioSistema | null> {
  const [linhas] = await db.query<LinhaUsuario[]>(
    `SELECT ${COLUNAS} FROM usuarios_sistema WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()]
  );
  return linhas.length > 0 ? paraUsuario(linhas[0]) : null;
}

// Usada a cada requisição protegida: só devolve o usuário se ele continuar ATIVO.
// É isso que faz uma inativação ter efeito imediato, mesmo com sessão antiga.
export async function buscarUsuarioAtivoPorId(id: number): Promise<UsuarioSistema | null> {
  const [linhas] = await db.query<LinhaUsuario[]>(
    `SELECT ${COLUNAS} FROM usuarios_sistema WHERE id = ? AND ativo = TRUE LIMIT 1`,
    [id]
  );
  return linhas.length > 0 ? paraUsuario(linhas[0]) : null;
}

export type EventoAuditoria = {
  tipoEvento: string;
  resultado: 'SUCESSO' | 'NEGADO' | 'FALHA';
  emailInformado?: string | null;
  usuarioAfetadoId?: number | null;
  administradorId?: number | null;
  valorAnterior?: string | null;
  valorNovo?: string | null;
  detalhe?: string | null;
};

// A auditoria nunca derruba o fluxo principal: se falhar, o erro vai para o log do servidor.
// NUNCA passe o token do Google para cá.
export async function registrarAuditoria(evento: EventoAuditoria): Promise<void> {
  try {
    await db.query(
      `INSERT INTO auditoria_eventos
        (tipo_evento, resultado, email_informado, usuario_afetado_id, administrador_id,
         valor_anterior, valor_novo, detalhe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        evento.tipoEvento,
        evento.resultado,
        evento.emailInformado ?? null,
        evento.usuarioAfetadoId ?? null,
        evento.administradorId ?? null,
        evento.valorAnterior ?? null,
        evento.valorNovo ?? null,
        evento.detalhe ?? null,
      ]
    );
  } catch (erro) {
    console.error('[auditoria] Falha ao registrar evento:', evento.tipoEvento, erro);
  }
}

export type MotivoNegacao =
  | 'EMAIL_NAO_VERIFICADO'
  | 'NAO_CADASTRADO'
  | 'INATIVO'
  | 'SUB_DIVERGENTE';

export type ResultadoLogin =
  | { ok: true; usuario: UsuarioSistema }
  | { ok: false; motivo: MotivoNegacao };

// Decide se uma identidade já validada pelo Google pode entrar no SiGPatri.
// A autenticação do Google NÃO concede acesso: quem decide é a tabela usuarios_sistema.
export async function autorizarLogin(identidade: IdentidadeGoogle): Promise<ResultadoLogin> {
  const { sub, email } = identidade;

  if (!identidade.emailVerificado) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_EMAIL_NAO_VERIFICADO',
      resultado: 'NEGADO',
      emailInformado: email,
    });
    return { ok: false, motivo: 'EMAIL_NAO_VERIFICADO' };
  }

  const usuario = await buscarUsuarioPorEmail(email);

  if (!usuario) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_NAO_CADASTRADO',
      resultado: 'NEGADO',
      emailInformado: email,
    });
    return { ok: false, motivo: 'NAO_CADASTRADO' };
  }

  if (!usuario.ativo) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_INATIVO',
      resultado: 'NEGADO',
      emailInformado: email,
      usuarioAfetadoId: usuario.id,
    });
    return { ok: false, motivo: 'INATIVO' };
  }

  if (usuario.googleSub !== null && usuario.googleSub !== sub) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_SUB_DIVERGENTE',
      resultado: 'NEGADO',
      emailInformado: email,
      usuarioAfetadoId: usuario.id,
      detalhe: 'Identificador Google diferente do vinculado ao cadastro.',
    });
    return { ok: false, motivo: 'SUB_DIVERGENTE' };
  }

  const eraPrimeiroAcesso = usuario.primeiroAcessoEm === null;

  // Vincula o google_sub (se ainda estiver vazio) e registra o acesso, em um único comando.
  // A condição no WHERE garante que a vinculação não sobrescreva um vínculo existente.
  try {
    await db.query<ResultSetHeader>(
      `UPDATE usuarios_sistema
          SET google_sub = ?,
              primeiro_acesso_em = COALESCE(primeiro_acesso_em, NOW()),
              ultimo_acesso_em = NOW()
        WHERE id = ? AND ativo = TRUE AND (google_sub IS NULL OR google_sub = ?)`,
      [sub, usuario.id, sub]
    );
  } catch (erro) {
    // 1062 = violação de UNIQUE: esse google_sub já pertence a outro cadastro.
    if ((erro as { errno?: number }).errno === 1062) {
      await registrarAuditoria({
        tipoEvento: 'LOGIN_SUB_DIVERGENTE',
        resultado: 'NEGADO',
        emailInformado: email,
        usuarioAfetadoId: usuario.id,
        detalhe: 'Identificador Google já vinculado a outro cadastro.',
      });
      return { ok: false, motivo: 'SUB_DIVERGENTE' };
    }
    throw erro;
  }

  // Confere o resultado em vez de presumir que o UPDATE valeu (evita corrida entre dois acessos).
  const atualizado = await buscarUsuarioPorEmail(email);

  if (!atualizado || !atualizado.ativo) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_INATIVO',
      resultado: 'NEGADO',
      emailInformado: email,
      usuarioAfetadoId: usuario.id,
    });
    return { ok: false, motivo: 'INATIVO' };
  }

  if (atualizado.googleSub !== sub) {
    await registrarAuditoria({
      tipoEvento: 'LOGIN_SUB_DIVERGENTE',
      resultado: 'NEGADO',
      emailInformado: email,
      usuarioAfetadoId: usuario.id,
      detalhe: 'Vinculação do identificador Google não foi concluída.',
    });
    return { ok: false, motivo: 'SUB_DIVERGENTE' };
  }

  if (eraPrimeiroAcesso) {
    await registrarAuditoria({
      tipoEvento: 'PRIMEIRO_ACESSO',
      resultado: 'SUCESSO',
      emailInformado: email,
      usuarioAfetadoId: atualizado.id,
    });
  }

  await registrarAuditoria({
    tipoEvento: 'LOGIN_SUCESSO',
    resultado: 'SUCESSO',
    emailInformado: email,
    usuarioAfetadoId: atualizado.id,
  });

  return { ok: true, usuario: atualizado };
}
