const express = require('express');
const router = express.Router();
const { login, register, getMe, loginValidation, registerValidation } = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user (admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', verifyToken, authorizeRoles('admin'), registerValidation, register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get('/me', verifyToken, getMe);

module.exports = router;
