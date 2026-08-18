/**
 * Vercel serverless entry point.
 * On Vercel, the Express app is exposed as a single serverless function.
 * Vercel installs dependencies declared in the root package.json.
 */
require('dotenv').config();
const app = require('../backend/app');

module.exports = (req, res) => app(req, res);