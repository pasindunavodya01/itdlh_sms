// server/db.js
const mysql = require('mysql2');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASS || '';   // 👈 match .env
const DB_NAME = process.env.DB_NAME || 'itdlh_sms';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

const connection = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectTimeout: 20000
});

// Log connection target (no password)
console.info('[db] Connecting to MySQL at', `${DB_HOST}:${DB_PORT}`, 'database:', DB_NAME);

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    console.error('Config used:', {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      database: DB_NAME
    });
    process.exit(1);
  }
  console.log('MySQL connected');
});

module.exports = connection;
