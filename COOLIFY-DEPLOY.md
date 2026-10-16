# Deploy do LEI-Gestão no Coolify

O projeto foi preparado para ser implantado como um **Docker Compose**, com dois serviços:

- `app`: aplicação Next.js do LEI-Gestão;
- `db`: MySQL 8 com volume persistente.

O banco é criado pelo container MySQL e o schema é atualizado automaticamente pelas migrations do projeto antes de o servidor Next.js iniciar.

## 1. Arquivos de infraestrutura

- `Dockerfile`: build multi-stage da aplicação Next.js.
- `docker-compose.yml`: orquestra `app` + `db`.
- `.dockerignore`: reduz o contexto enviado ao Docker.
- `.env.example`: lista as variáveis necessárias sem armazenar segredos reais.
- `database/migrations/*.sql`: migrations versionadas do banco.
- `scripts/migrate.mjs`: executor das migrations.

## 2. Variáveis no Coolify

Cadastre, no mínimo:

```env
MYSQL_DATABASE=sistema_lei
MYSQL_USER=lei_user
MYSQL_PASSWORD=UMA_SENHA_FORTE
MYSQL_ROOT_PASSWORD=OUTRA_SENHA_FORTE
APP_PORT=3000

LEI_ADMIN_EMAIL=admin@lei.uff.br
LEI_ADMIN_PASSWORD=UMA_SENHA_FORTE_PARA_O_ADMIN
LEI_ADMIN_NAME=Administrador LEI
```

`LEI_ADMIN_MATRICULA` e `LEI_ADMIN_TELEFONE` são opcionais.

Não envie o arquivo `.env` real ao GitHub. O `.env.example` pode e deve ser versionado.

## 3. Configuração do recurso no Coolify

1. Crie um novo recurso a partir do repositório GitHub do LEI-Gestão.
2. Escolha **Docker Compose** como método de build/deploy.
3. Use `docker-compose.yml` na raiz do repositório.
4. Cadastre as variáveis de ambiente acima.
5. Configure o domínio do serviço `app` apontando para a porta interna `3000`.
6. Faça o deploy.

Não é necessário publicar a porta `3306` do MySQL para a internet. O `app` acessa o banco pela rede interna do Compose usando o hostname `db`.

## 4. Primeiro deploy

A sequência esperada é:

1. Docker cria o volume `lei_db_data`.
2. MySQL cria o database informado em `MYSQL_DATABASE`.
3. O healthcheck aguarda o MySQL ficar disponível.
4. O container `app` executa `scripts/migrate.mjs`.
5. A migration `001_initial.sql` cria as tabelas e o trigger.
6. `schema_migrations` registra a migration executada.
7. O administrador inicial é criado se `LEI_ADMIN_EMAIL` e `LEI_ADMIN_PASSWORD` estiverem definidos e o e-mail ainda não existir.
8. O servidor Next.js inicia na porta `3000`.

## 5. Próximas alterações no banco

Não altere uma migration que já foi aplicada em produção. Crie uma nova migration com numeração crescente, por exemplo:

```text
database/migrations/
├── 001_initial.sql
├── 002_adicionar_numero_serie.sql
└── 003_perfis_de_acesso.sql
```

Dentro de uma migration, se houver mais de uma instrução SQL, separe os blocos com:

```sql
-- statement-breakpoint
```

Exemplo:

```sql
ALTER TABLE inventario_lei
  ADD COLUMN numero_serie VARCHAR(100) NULL;

-- statement-breakpoint

CREATE INDEX idx_inventario_numero_serie
  ON inventario_lei (numero_serie);
```

No próximo deploy, o sistema executará apenas migrations ainda não registradas em `schema_migrations`.

## 6. Persistência

O Compose mantém dois volumes:

- `lei_db_data`: arquivos de dados do MySQL;
- `lei_uploads`: PDFs enviados para `public/uploads`.

Assim, redeploys e recriações dos containers não devem apagar o banco nem os novos arquivos enviados pelo sistema, desde que os volumes não sejam removidos manualmente.

## 7. Banco externo (opcional)

A aplicação continua aceitando `DATABASE_URL`. Se ela for definida, tem prioridade sobre `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`.

Exemplo:

```env
DATABASE_URL=mysql://usuario:senha@host:3306/sistema_lei
```

Para o modelo padrão deste repositório, deixe `DATABASE_URL` vazia e utilize o serviço `db` do Compose.

## 8. Observação de segurança

O sistema atual ainda autentica comparando a senha diretamente com o campo `usuarios.senha`. A infraestrutura Docker não altera esse comportamento para evitar quebrar o código existente. Antes da disponibilização definitiva a usuários reais, recomenda-se migrar as senhas para hash seguro e substituir a sessão atual por um mecanismo de autenticação apropriado.
