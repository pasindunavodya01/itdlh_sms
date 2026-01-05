    // server/db.js
const mysql = require('mysql2');
// Load .env if present. The main server may already load dotenv; calling config() again is safe.
require('dotenv').config();

// Read DB config from environment with sensible defaults
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'itdlh_sms';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const DB_SOCKET = process.env.DB_SOCKET || undefined;

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  socketPath: DB_SOCKET,
});

// Log connection target (avoid printing password)
console.info('[db] Connecting to MySQL at', DB_HOST + (DB_PORT ? `:${DB_PORT}` : ''), ' database:', DB_NAME);

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('MySQL connected');
});

module.exports = connection;
