const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

/**
 * Validation rules for creating/updating employees
 */
const employeeValidation = [
  body('employee_id').trim().notEmpty().withMessage('Employee ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('department_id').isInt({ min: 1 }).withMessage('Valid department is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required')
];

/**
 * GET /api/employees
 * Supports: pagination, search, filter, sort
 */
const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'e.created_at';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    // Build WHERE clause
    let conditions = [];
    let params = [];

    if (search) {
      conditions.push('(e.name LIKE ? OR e.email LIKE ? OR e.employee_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      conditions.push('e.department_id = ?');
      params.push(department);
    }

    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Sanitize sortBy to prevent SQL injection
    const allowedSortFields = ['e.employee_id', 'e.name', 'e.email', 'e.designation', 'e.status', 'e.created_at', 'd.name'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'e.created_at';

    // Count total records
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM employees e ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Fetch employees with department name
    const [employees] = await pool.execute(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       ${whereClause} 
       ORDER BY ${safeSortBy} ${order} 
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      success: true,
      data: employees,
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
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const [employees] = await pool.execute(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employees[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employee_id, name, email, mobile, department_id, designation, status } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO employees (employee_id, name, email, mobile, department_id, designation, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, name, email, mobile, department_id, designation, status || 'Active']
    );

    // Fetch the created employee with department name
    const [newEmployee] = await pool.execute(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employee_id, name, email, mobile, department_id, designation, status } = req.body;

    const [result] = await pool.execute(
      `UPDATE employees 
       SET employee_id = ?, name = ?, email = ?, mobile = ?, department_id = ?, designation = ?, status = ?
       WHERE id = ?`,
      [employee_id, name, email, mobile, department_id, designation, status || 'Active', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Fetch updated employee
    const [updated] = await pool.execute(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeValidation
};
