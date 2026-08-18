const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', verifyToken, getStats);

module.exports = router;
