const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Load backend/.env when present (local dev). No-op/missing on Vercel, where
// environment variables come from the project settings instead.
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// SSL is required for cloud MySQL (e.g. TiDB Cloud / AWS RDS).
// Set DB_SSL=true in .env for cloud databases, or DB_SSL=false for local MySQL.
const sslMode = process.env.DB_SSL === 'true';
const ssl = sslMode ? { rejectUnauthorized: false } : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl,
  connectTimeout: 30000,
  dateStrings: true
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = { pool, testConnection };