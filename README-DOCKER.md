# LEI-Gestão — ambiente Docker

## Subir localmente

1. Copie `.env.example` para `.env`.
2. Troque todas as senhas de exemplo.
3. Execute:

```bash
docker compose up -d --build
```

A aplicação ficará disponível em `http://localhost:3000` por padrão.

## Logs

```bash
docker compose logs -f app
docker compose logs -f db
```

## Parar containers

```bash
docker compose down
```

Esse comando mantém os volumes e os dados.

Para remover também os volumes (atenção: apaga banco e uploads):

```bash
docker compose down -v
```

## Migrations

As migrations ficam em `database/migrations/` e são executadas automaticamente antes do Next.js iniciar.

Consulte `COOLIFY-DEPLOY.md` para o procedimento de produção.
