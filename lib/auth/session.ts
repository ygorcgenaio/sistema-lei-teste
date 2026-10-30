import { SignJWT, jwtVerify } from 'jose';

// Nome novo de propósito: o cookie antigo (lei_session) era um texto sem assinatura
// e passa a ser ignorado. Quem tiver o cookie antigo simplesmente cai na tela de login.
export const SESSION_COOKIE = 'sigpatri_session';

// Duração da sessão: 8 horas.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

// Opções do cookie. httpOnly impede que scripts da página leiam o cookie.
// secure só é aplicado em produção (em localhost o navegador aceita mesmo sem HTTPS).
export const opcoesCookieSessao = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

function obterChave(): Uint8Array {
  const segredo = process.env.SESSION_SECRET;
  if (!segredo || segredo.length < 32) {
    // Erro de configuração: melhor falhar de forma visível do que aceitar sessões inseguras.
    throw new Error('SESSION_SECRET ausente ou curto demais (mínimo de 32 caracteres).');
  }
  return new TextEncoder().encode(segredo);
}

// Cria o texto assinado que vai dentro do cookie.
// Guarda SOMENTE o id do usuário. Perfil e status (ativo) são consultados no banco
// a cada requisição protegida, para que uma inativação tenha efeito imediato.
export async function criarTokenSessao(usuarioId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(usuarioId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(obterChave());
}

// Confere a assinatura e a validade. Devolve o id do usuário ou null se o token
// estiver ausente, adulterado ou expirado.
export async function lerTokenSessao(token: string | undefined): Promise<number | null> {
  if (!token) return null;

  const chave = obterChave(); // fora do try: erro de configuração não vira "deslogado" em silêncio

  try {
    const { payload } = await jwtVerify(token, chave, { algorithms: ['HS256'] });
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
