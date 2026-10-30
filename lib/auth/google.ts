import { OAuth2Client } from 'google-auth-library';

// Dados que aproveitamos do token do Google, já tratados.
export type IdentidadeGoogle = {
  sub: string; // identificador permanente da conta Google
  email: string; // sempre em minúsculas e sem espaços
  nome: string;
  emailVerificado: boolean; // o Google confirma que o e-mail pertence à pessoa
};

let cliente: OAuth2Client | null = null;

function obterClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Erro de configuração: deve aparecer, e não virar "login negado" em silêncio.
    throw new Error('GOOGLE_CLIENT_ID não configurado.');
  }
  return clientId;
}

// Recebe a credencial (ID token) enviada pelo navegador e confere com o Google.
// Devolve os dados da conta ou null se o token for inválido, expirado, forjado
// ou emitido para outro aplicativo. Nunca registra nem devolve o token.
export async function validarTokenGoogle(credencial: string): Promise<IdentidadeGoogle | null> {
  if (typeof credencial !== 'string' || credencial.length === 0 || credencial.length > 4096) {
    return null;
  }

  const clientId = obterClientId();
  if (!cliente) {
    cliente = new OAuth2Client(clientId);
  }

  try {
    // Confere assinatura, validade, emissor e audiência (tem de ser o NOSSO clientId).
    const ticket = await cliente.verifyIdToken({ idToken: credencial, audience: clientId });
    const dados = ticket.getPayload();

    if (!dados || !dados.sub || !dados.email) {
      return null;
    }

    const email = dados.email.trim().toLowerCase();

    return {
      sub: dados.sub,
      email,
      nome: (dados.name ?? email).trim(),
      emailVerificado: dados.email_verified === true,
    };
  } catch {
    return null;
  }
}
