require('dotenv').config();
const { testConnection } = require('./config/db');

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  await testConnection();
});