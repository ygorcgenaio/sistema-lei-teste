# SiGPatri — entrega de desenvolvimento LEI-003

## Instalação
1. Faça backup do banco no Coolify antes do push (incluindo usuários e volumes de upload).
2. Extraia o ZIP na raiz do repositório, mantendo a pasta `.git` atual. Substitua os arquivos com o mesmo nome.
3. Rode `npm ci` e `npm run build` localmente se Node estiver disponível.
4. Faça commit e push para `main`; o Coolify executará `002_estrutura_itens.sql` automaticamente.
5. No log do `app`, confirme `002_estrutura_itens.sql: concluída.` e `Ready`.

## Endereços para teste
- `/itens`: listar itens
- `/itens/novo`: cadastrar
- `/equipamentos` e `/equipamentos/novo`: redirecionam para os novos endereços
- `/api/itens/opcoes`: carregar categorias e tipos
- `/notebooks`, `/emprestimos`, `/manutencao`: consultas adaptadas para as tabelas novas

## Cenários
- Cadastre `MESA LEI 001` sem patrimônio, categoria Mobiliário, tipo Mesa; verifique a listagem.
- Cadastre `NOTE LEI 001` com patrimônio institucional e detalhes técnicos.
- Tente cadastrar código repetido e patrimônio repetido: devem falhar.
- Teste nota fiscal opcional e PDF válido até 5 MB.
- Faça empréstimo usando **código LEI**; devolução gera uma inspeção.
- Conclua a inspeção; o status volta a DISPONIVEL.
- Faça baixa de um item disponível e confirme que ele continua na listagem.

## Compatibilidade / escopo
- A `001_initial.sql` não é alterada. As tabelas antigas (`inventario_lei`, `notebook`, `emprestimos`, `manutencao`) permanecem intactas para não arriscar registros.
- Novos registros ficam em `itens`, `itens_computadores`, `emprestimos_itens`, `manutencoes_itens`.
- Por enquanto os formulários de empréstimo/manutenção ainda enviam um campo interno chamado `patrimonio_id`, mas **seu valor agora é o código LEI**. A relação real no banco é por `item_id`.
- A baixa só é permitida quando o item não está emprestado nem em manutenção.
- O formulário exibe todos os status para testes; regras de transição/autorizações mais restritas serão etapa posterior.
- Não há migração automática de registros antigos — conforme informado, o ambiente de inventário ainda não tem registros.
- Não apague volumes Docker e não edite migrations já aplicadas.
