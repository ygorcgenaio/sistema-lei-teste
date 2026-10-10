const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'mariadb',
  password: '123456',
  database: 'default',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MariaDB:', err.stack);
    return;
  }
  console.log('✅ Conexão bem-sucedida com o MariaDB!');
  connection.end();
});