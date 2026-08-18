const { pool } = require('../config/db');

/**
 * GET /api/departments
 * Returns all departments (for dropdowns)
 */
const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await pool.execute(
      'SELECT * FROM departments ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments };
