import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL || 'mysql://root:sua_senha_local@localhost:3306/sistema_lei';

export const db = mysql.createPool(connectionString);