const express = require('express');
const router = express.Router();
const { getDepartments } = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', verifyToken, getDepartments);

module.exports = router;
