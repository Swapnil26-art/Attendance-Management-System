/**
 * Database Seed Script
 * Run with: npm run seed
 * Creates tables and seeds initial data (admin user + departments)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
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

    // Seed sample employees
    const employees = [
      ['EMP001', 'Om Prakash', 'om@company.com', '9000010001', 1, 'Software Engineer', 'Active'],
      ['EMP002', 'Priya Sharma', 'priya@company.com', '9000010002', 2, 'Marketing Specialist', 'Active'],
      ['EMP003', 'Rahul Verma', 'rahul@company.com', '9000010003', 3, 'HR Executive', 'Active'],
      ['EMP004', 'Sita Reddy', 'sita@company.com', '9000010004', 4, 'Accountant', 'Active'],
      ['EMP005', 'Arjun Nair', 'arjun@company.com', '9000010005', 5, 'Operations Manager', 'Active'],
      ['EMP006', 'Neha Gupta', 'neha@company.com', '9000010006', 6, 'Sales Executive', 'Active'],
      ['EMP007', 'Vikram Singh', 'vikram@company.com', '9000010007', 1, 'QA Engineer', 'Active'],
      ['EMP008', 'Ananya Iyer', 'ananya@company.com', '9000010008', 2, 'Content Writer', 'Inactive'],
      ['EMP009', 'Rohan Das', 'rohan@company.com', '9000010009', 1, 'DevOps Engineer', 'Active'],
      ['EMP010', 'Kavya Menon', 'kavya@company.com', '9000010010', 4, 'Financial Analyst', 'Active'],
      ['EMP011', 'Manoj Kumar', 'manoj@company.com', '9000010011', 5, 'Logistics Coordinator', 'Active'],
      ['EMP012', 'Deepika Rao', 'deepika@company.com', '9000010012', 3, 'Recruiter', 'Active']
    ];
    const employeeInsert = `INSERT IGNORE INTO employees
      (employee_id, name, email, mobile, department_id, designation, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    for (const emp of employees) {
      await connection.query(employeeInsert, emp);
    }
    console.log(`✅ ${employees.length} sample employees seeded`);

    // Seed attendance for active employees (last 14 days)
    const [activeRows] = await connection.query(
      "SELECT id FROM employees WHERE status = 'Active'"
    );
    const statusSequence = ['Present', 'Present', 'Present', 'Present', 'Present', 'Late', 'Absent', 'Half-Day'];
    let attendanceCount = 0;
    for (const emp of activeRows) {
      for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        const idx = (emp.id + daysAgo) % statusSequence.length;
        const st = statusSequence[idx];
        const checkIn = st === 'Absent' ? null : `09:0${idx % 10}:00`;
        const checkOut = st === 'Absent' ? null : '18:00:00';
        const result = await connection.query(
          `INSERT IGNORE INTO attendance
            (employee_id, attendance_date, check_in_time, check_out_time, status)
           VALUES (?, ?, ?, ?, ?)`,
          [emp.id, dateStr, checkIn, checkOut, st]
        );
        attendanceCount += result[0].affectedRows;
      }
    }
    console.log(`✅ ${attendanceCount} attendance records seeded`);

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

seed();
