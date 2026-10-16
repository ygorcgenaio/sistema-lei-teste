import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  async function autenticar(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;

    try {
      // Consulta o usuário no MariaDB
      const [rows]: any = await db.query(
        'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
        [email, senha]
      );

      if (rows.length === 0) {
        // Credenciais inválidas
        redirect('/login?erro=1');
      }

      const usuario = rows[0];

      // Salva a sessão em um cookie HTTP-Only seguro
      const cookieStore = await cookies();
      cookieStore.set('lei_session', JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 8, // Sessão válida por 8 horas
      });

    } catch (error) {
      if ((error as Error).message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      console.error('Erro no login:', error);
      redirect('/login?erro=2');
    }

    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">SiGPatri</h1>
          <p className="text-gray-600 text-sm mt-1">Sistema de Gestão Patrimonial</p>
        </div>

        <form action={autenticar} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              name="senha"
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition shadow"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Acesso disponibilizado pela administração do LEI.
        </div>
      </div>
    </div>
  );
}