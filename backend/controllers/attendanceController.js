const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { Parser } = require('json2csv');

/**
 * Validation rules for marking attendance
 */
const attendanceValidation = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('attendance_date').isDate().withMessage('Valid date is required'),
  body('status').isIn(['Present', 'Absent', 'Half-Day', 'Late']).withMessage('Valid status is required')
];

/**
 * POST /api/attendance
 * Mark attendance (insert or update if already exists for that date)
 */
const markAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employee_id, attendance_date, check_in_time, check_out_time, status } = req.body;

    // Check if employee exists
    const [emp] = await pool.execute('SELECT id FROM employees WHERE id = ?', [employee_id]);
    if (emp.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Insert or update attendance (upsert)
    const [result] = await pool.execute(
      `INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         check_in_time = VALUES(check_in_time),
         check_out_time = VALUES(check_out_time),
         status = VALUES(status)`,
      [employee_id, attendance_date, check_in_time || null, check_out_time || null, status]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance
 * Supports: pagination, filtering by date/employee/status/date-range
 */
const getAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { date, employee_id, status, from, to } = req.query;

    let conditions = [];
    let params = [];

    if (date) {
      conditions.push('a.attendance_date = ?');
      params.push(date);
    }

    if (employee_id) {
      conditions.push('a.employee_id = ?');
      params.push(employee_id);
    }

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (from) {
      conditions.push('a.attendance_date >= ?');
      params.push(from);
    }

    if (to) {
      conditions.push('a.attendance_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count total
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM attendance a ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Fetch records with employee details
    const [records] = await pool.execute(
      `SELECT a.*, e.employee_id as emp_code, e.name as employee_name, d.name as department_name
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       ${whereClause}
       ORDER BY a.attendance_date DESC, e.name ASC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/summary
 * Returns count of each status for a date range
 */
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let conditions = [];
    let params = [];

    if (from) {
      conditions.push('attendance_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('attendance_date <= ?');
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [summary] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END), 0) as present,
        COALESCE(SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END), 0) as absent,
        COALESCE(SUM(CASE WHEN status = 'Half-Day' THEN 1 ELSE 0 END), 0) as halfDay,
        COALESCE(SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END), 0) as late,
        COUNT(*) as total
       FROM attendance ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/employee/:id
 * Get attendance history for a specific employee
 */
const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let conditions = ['a.employee_id = ?'];
    let params = [req.params.id];

    if (from) {
      conditions.push('a.attendance_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('a.attendance_date <= ?');
      params.push(to);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    // Get employee info
    const [emp] = await pool.execute(
      `SELECT e.*, d.name as department_name FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (emp.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get attendance records
    const [attendance] = await pool.execute(
      `SELECT a.* FROM attendance a ${whereClause} ORDER BY a.attendance_date DESC`,
      params
    );

    // Get summary stats
    const [summary] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) as present,
        COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) as absent,
        COALESCE(SUM(CASE WHEN a.status = 'Half-Day' THEN 1 ELSE 0 END), 0) as halfDay,
        COALESCE(SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END), 0) as late
       FROM attendance a ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        employee: emp[0],
        attendance,
        summary: summary[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/export
 * Export attendance records as CSV
 */
const exportAttendance = async (req, res, next) => {
  try {
    const { from, to, employee_id } = req.query;
    let conditions = [];
    let params = [];

    if (from) {
      conditions.push('a.attendance_date >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('a.attendance_date <= ?');
      params.push(to);
    }
    if (employee_id) {
      conditions.push('a.employee_id = ?');
      params.push(employee_id);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [records] = await pool.execute(
      `SELECT e.employee_id as "Employee ID", e.name as "Employee Name", 
              a.attendance_date as "Date", a.check_in_time as "Check In", 
              a.check_out_time as "Check Out", a.status as "Status",
              d.name as "Department"
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       ${whereClause}
       ORDER BY a.attendance_date DESC, e.name ASC`,
      params
    );

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attendance records found for the given filters'
      });
    }

    const parser = new Parser();
    const csv = parser.parse(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
  getEmployeeAttendance,
  exportAttendance,
  attendanceValidation
};
