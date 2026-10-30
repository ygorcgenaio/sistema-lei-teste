import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth/guard';
import { logoutAction } from '@/app/actions/auth';

export default async function Home() {
  // SESSÃO: exige usuário logado e ATIVO (consulta o banco a cada acesso)
  const usuario = await exigirUsuario();

  let totalobjetos = 0;
  let totalPessoas = 0;
  let totalEmprestimosAtivos = 0;
  let totalManutencaoAndamento = 0;

  try {
    const [rowsNb]: any = await db.query("SELECT COUNT(*) as total FROM itens WHERE status != 'BAIXADO'");
    totalobjetos = rowsNb[0].total;

    const [rowsPessoa]: any = await db.query('SELECT COUNT(*) as total FROM usuarios');
    totalPessoas = rowsPessoa[0].total;

    const [rowsEmp]: any = await db.query(
      "SELECT COUNT(*) as total FROM emprestimos_itens WHERE status_devolucao = 'EM_ANDAMENTO'"
    );
    totalEmprestimosAtivos = rowsEmp[0].total;


    const [rowsManutencao]: any = await db.query(
      "SELECT COUNT(*) as total FROM manutencoes_itens WHERE status_manutencao != 'CONCLUIDO'"
    );
    totalManutencaoAndamento = rowsManutencao[0].total;
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho com identificação do Usuário e Logout */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">SiGPatri</h1>
            <p className="text-gray-600 text-sm">Controle de equipamentos, empréstimos, manutenção e histórico patrimonial</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Usuário Autenticado</p>
              <p className="text-sm font-semibold text-gray-800">{usuario.nome}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-red-600 transition shadow"
              >
                Sair
              </button>
            </form>
          </div>
        </header>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Inventário Geral</h2>
              {/* A variável abaixo deve ser a que você já usa para contar os itens */}
              <p className="text-4xl font-bold text-gray-900 mt-2">{totalobjetos || 0}</p>
            </div>
            
            <div className="mt-5 flex flex-col gap-3 border-t pt-3">
              <a href="/itens" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center">
                Ver inventário &rarr;
              </a>
              <a href="/notebooks" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center">
                Ver Notebooks &rarr;
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Pessoas</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{totalPessoas}</p>
            <a href="/pessoas" className="text-green-600 hover:underline text-sm mt-4 inline-block font-medium">
              Ver cadastradas &rarr;
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Empréstimos Ativos</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{totalEmprestimosAtivos}</p>
            <a href="/emprestimos" className="text-purple-600 hover:underline text-sm mt-4 inline-block font-medium">
              Ver empréstimos &rarr;
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium uppercase">Em Manutenção</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{totalManutencaoAndamento}</p>
            <a href="/manutencao" className="text-yellow-600 hover:underline text-sm mt-4 inline-block font-medium">
              Ver manutenções &rarr;
            </a>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="/emprestimos/novo"
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition font-medium inline-block"
            >
              + Novo Empréstimo
            </a>
            <a
              href="/manutencao/novo"
              className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700 transition font-medium inline-block"
            >
              + Enviar p/ Manutenção
            </a>
            <a
              href="/itens/novo"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300 transition font-medium inline-block"
            >
              Cadastrar Notebook
            </a>
            <a
              href="/pessoas/novo"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300 transition font-medium inline-block"
            >
              Cadastrar Pessoa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}