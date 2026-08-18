const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  employeeValidation
} = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/auth');

// All employee routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees (paginated, searchable, filterable)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or employee ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/', getEmployees);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee details
 *       404:
 *         description: Employee not found
 */
router.get('/:id', getEmployeeById);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               designation:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post('/', employeeValidation, createEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put('/:id', employeeValidation, updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/:id', deleteEmployee);

module.exports = router;
