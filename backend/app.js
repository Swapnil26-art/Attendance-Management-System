require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./utils/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Attendance Management System - API Docs'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Attendance Management System API is running',
    docs: '/api-docs'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

module.exports = app;