/**
 * Database Seed Script
 * Run with: npm run seed
 * Creates tables and seeds initial data (admin user + departments)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const sslMode = process.env.DB_SSL === 'true';
const ssl = sslMode ? { rejectUnauthorized: false } : false;

const seed = async () => {
  let connection;
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    console.log(`✅ Database "${process.env.DB_NAME}" ready`);

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Departments table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        department_id INT NOT NULL,
        designation VARCHAR(100) NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
      )
    `);
    console.log('✅ Employees table created');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        check_in_time TIME NULL,
        check_out_time TIME NULL,
        status ENUM('Present', 'Absent', 'Half-Day', 'Late') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (employee_id, attendance_date)
      )
    `);
    console.log('✅ Attendance table created');

    // Seed departments
    const departments = ['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Sales'];
    for (const dept of departments) {
      await connection.query(
        'INSERT IGNORE INTO departments (name) VALUES (?)',
        [dept]
      );
    }
    console.log('✅ Departments seeded');

    // Seed admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      `INSERT IGNORE INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)`,
      ['admin', hashedPassword, 'Administrator', 'admin']
    );
    console.log('✅ Admin user seeded (username: admin, password: admin123)');

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

seed();
