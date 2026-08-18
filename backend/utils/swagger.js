const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Attendance Management System API',
      version: '1.0.0',
      description: 'REST API for managing employees and tracking attendance records',
      contact: {
        name: 'Swapnil',
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || 'https://your-backend-url.onrender.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
