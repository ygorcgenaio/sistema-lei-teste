import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL?.trim();

const connectionOptions = connectionString
  ? connectionString
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'sua_senha_local',
      database: process.env.DB_NAME || 'sistema_lei',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

export const db = mysql.createPool(connectionOptions);
