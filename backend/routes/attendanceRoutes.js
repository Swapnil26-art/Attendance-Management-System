const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getAttendanceSummary,
  getEmployeeAttendance,
  exportAttendance,
  attendanceValidation
} = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/auth');

// All attendance routes require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Mark attendance
 *     tags: [Attendance]
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
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *                 format: date
 *               check_in_time:
 *                 type: string
 *               check_out_time:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Half-Day, Late]
 *     responses:
 *       201:
 *         description: Attendance marked
 */
router.post('/', attendanceValidation, markAttendance);

/**
 * @swagger
 * /api/attendance/export:
 *   get:
 *     summary: Export attendance as CSV
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/export', exportAttendance);

/**
 * @swagger
 * /api/attendance/summary:
 *   get:
 *     summary: Get attendance summary
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance summary
 */
router.get('/summary', getAttendanceSummary);

/**
 * @swagger
 * /api/attendance/employee/{id}:
 *   get:
 *     summary: Get employee attendance history
 *     tags: [Attendance]
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
 *         description: Employee attendance history
 */
router.get('/employee/:id', getEmployeeAttendance);

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records (paginated, filterable)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get('/', getAttendance);

module.exports = router;
