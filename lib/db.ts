import mysql from 'mysql2/promise';

let pool: mysql.Pool;

if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'lei_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_lei',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export const db = pool;
export default db;