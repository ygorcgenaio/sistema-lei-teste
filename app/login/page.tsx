import { redirect } from 'next/navigation';
import { obterUsuarioAtual } from '@/lib/auth/guard';
import BotaoGoogle from './BotaoGoogle';

// Lê GOOGLE_CLIENT_ID e a sessão a cada requisição (e não só na hora do build).
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Quem já está logado (e continua ativo) vai direto para o painel.
  let jaLogado = false;
  try {
    jaLogado = (await obterUsuarioAtual()) !== null;
  } catch (erro) {
    console.error('[login] Não foi possível verificar a sessão atual:', erro);
  }

  if (jaLogado) {
    redirect('/');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ?? '';

  if (!clientId) {
    console.error('[login] GOOGLE_CLIENT_ID não configurado.');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">SiGPatri</h1>
          <p className="text-gray-600 text-sm mt-1">Sistema de Gestão Patrimonial</p>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Acesso restrito</h2>
          <p className="text-sm text-gray-600 mt-2">
            Utilize sua conta Google institucional. O acesso ao SiGPatri é permitido somente a
            usuários previamente autorizados.
          </p>
        </div>

        {clientId ? (
          <BotaoGoogle clientId={clientId} />
        ) : (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-semibold">Não foi possível realizar a autenticação.</p>
            <p className="mt-1">
              Tente novamente. Caso o problema persista, entre em contato com a equipe responsável
              pelo SiGPatri.
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Acesso disponibilizado pela administração do LEI.
        </div>
      </div>
    </div>
  );
}
