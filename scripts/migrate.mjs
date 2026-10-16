import mysql from 'mysql2/promise';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const databaseUrl = process.env.DATABASE_URL?.trim();

const databaseConfig = databaseUrl || {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sua_senha_local',
  database: process.env.DB_NAME || 'sistema_lei',
};
const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
const lockName = 'lei_gestao_schema_migrations';
const maxAttempts = Number(process.env.DB_MIGRATION_MAX_ATTEMPTS || 30);
const retryDelayMs = Number(process.env.DB_MIGRATION_RETRY_DELAY_MS || 2000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const connection = await mysql.createConnection(databaseConfig);
      await connection.ping();
      return connection;
    } catch (error) {
      lastError = error;
      console.log(`[db:migrate] Banco indisponível (${attempt}/${maxAttempts}). Nova tentativa em ${retryDelayMs}ms...`);
      if (attempt < maxAttempts) await sleep(retryDelayMs);
    }
  }

  throw lastError;
}

function splitStatements(sql) {
  return sql
    .split(/^\s*--\s*statement-breakpoint\s*$/gim)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function acquireLock(connection) {
  const [rows] = await connection.query('SELECT GET_LOCK(?, 60) AS acquired', [lockName]);
  if (!rows?.[0]?.acquired) {
    throw new Error('Não foi possível obter o lock de migrations do banco.');
  }
}

async function releaseLock(connection) {
  try {
    await connection.query('SELECT RELEASE_LOCK(?)', [lockName]);
  } catch {
    // A conexão sendo encerrada também libera o lock.
  }
}

async function applyMigrations(connection) {
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, 'en'));

  for (const filename of files) {
    const [existing] = await connection.query(
      'SELECT 1 FROM schema_migrations WHERE filename = ? LIMIT 1',
      [filename]
    );

    if (existing.length > 0) {
      console.log(`[db:migrate] ${filename}: já aplicada.`);
      continue;
    }

    console.log(`[db:migrate] Aplicando ${filename}...`);
    const sql = await readFile(path.join(migrationsDir, filename), 'utf8');
    const statements = splitStatements(sql);

    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.query(
      'INSERT INTO schema_migrations (filename) VALUES (?)',
      [filename]
    );

    console.log(`[db:migrate] ${filename}: concluída.`);
  }
}

async function ensureInitialAdmin(connection) {
  const email = process.env.LEI_ADMIN_EMAIL?.trim();
  const password = process.env.LEI_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('[db:migrate] LEI_ADMIN_EMAIL/LEI_ADMIN_PASSWORD não definidos; seed do administrador ignorado.');
    return;
  }

  const name = process.env.LEI_ADMIN_NAME?.trim() || 'Administrador LEI';
  const registration = process.env.LEI_ADMIN_MATRICULA?.trim() || null;
  const phone = process.env.LEI_ADMIN_TELEFONE?.trim() || null;

  await connection.query(
    `INSERT IGNORE INTO usuarios (nome, email, matricula, telefone, senha, role)
     VALUES (?, ?, ?, ?, ?, 'ADMIN')`,
    [name, email, registration, phone, password]
  );

  console.log(`[db:migrate] Administrador inicial garantido para ${email}.`);
}

let connection;
try {
  connection = await connectWithRetry();
  await ensureMigrationTable(connection);
  await acquireLock(connection);
  await applyMigrations(connection);
  await ensureInitialAdmin(connection);
  console.log('[db:migrate] Banco pronto.');
} catch (error) {
  console.error('[db:migrate] Falha:', error);
  process.exitCode = 1;
} finally {
  if (connection) {
    await releaseLock(connection);
    await connection.end();
  }
}
